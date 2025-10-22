#!/bin/bash

# ===========================================
# Production Database Backup Script
# ===========================================
# This script creates compressed backups of the PostgreSQL database
# with retention policies and optional off-site storage
#
# Usage: ./scripts/backup-production.sh

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE_DIR=$(date +"%Y-%m")
BACKUP_FILE="backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Docker configuration
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.production.yml}"
DB_CONTAINER="${DB_CONTAINER:-strategic_plan_db}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

# Optional: S3 backup configuration
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
S3_ENABLED="${S3_ENABLED:-false}"

# Optional: Notification webhook
WEBHOOK_URL="${BACKUP_WEBHOOK_URL:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
    log "SUCCESS: $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR: $1"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
    log "INFO: $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARNING: $1"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
            > /dev/null 2>&1 || true
    fi
}

# Create backup directory structure
create_backup_dir() {
    local full_path="${BACKUP_DIR}/${DATE_DIR}"
    mkdir -p "$full_path"
    mkdir -p "${BACKUP_DIR}/temp"
    log_success "Backup directory created: $full_path"
}

# Check if Docker container is running
check_database() {
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "Database container '$DB_CONTAINER' is not running"
        send_notification "error" "Database container not running"
        exit 1
    fi
    log_success "Database container is running"
}

# Create database backup
create_backup() {
    local temp_file="${BACKUP_DIR}/temp/${BACKUP_FILE}"
    local final_file="${BACKUP_DIR}/${DATE_DIR}/${BACKUP_FILE_COMPRESSED}"
    
    log_info "Creating database backup..."
    
    # Create SQL dump
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --no-owner --no-acl --clean --if-exists \
        > "$temp_file" 2>> "$LOG_FILE"; then
        log_success "Database dump created"
    else
        log_error "Failed to create database dump"
        send_notification "error" "Database backup failed"
        exit 1
    fi
    
    # Verify backup file is not empty
    if [ ! -s "$temp_file" ]; then
        log_error "Backup file is empty"
        send_notification "error" "Backup file is empty"
        exit 1
    fi
    
    # Get file size
    local size=$(du -h "$temp_file" | cut -f1)
    log_info "Backup size (uncompressed): $size"
    
    # Compress backup
    log_info "Compressing backup..."
    if gzip -c "$temp_file" > "$final_file"; then
        local compressed_size=$(du -h "$final_file" | cut -f1)
        log_success "Backup compressed: $compressed_size"
        rm "$temp_file"
    else
        log_error "Failed to compress backup"
        send_notification "error" "Backup compression failed"
        exit 1
    fi
    
    echo "$final_file"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log_info "Verifying backup integrity..."
    
    # Check if file can be decompressed
    if gzip -t "$backup_file" 2>> "$LOG_FILE"; then
        log_success "Backup integrity verified"
        return 0
    else
        log_error "Backup integrity check failed"
        send_notification "error" "Backup integrity check failed"
        return 1
    fi
}

# Upload to S3 (if configured)
upload_to_s3() {
    local backup_file="$1"
    
    if [ "$S3_ENABLED" != "true" ] || [ -z "$S3_BUCKET" ]; then
        return 0
    fi
    
    log_info "Uploading to S3 bucket: $S3_BUCKET"
    
    # Check if AWS CLI is available
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not found, skipping S3 upload"
        return 0
    fi
    
    local s3_path="s3://${S3_BUCKET}/strategic-plan/${DATE_DIR}/$(basename $backup_file)"
    
    if aws s3 cp "$backup_file" "$s3_path" >> "$LOG_FILE" 2>&1; then
        log_success "Backup uploaded to S3: $s3_path"
    else
        log_warning "Failed to upload to S3"
    fi
}

# Clean old backups
clean_old_backups() {
    log_info "Cleaning backups older than $RETENTION_DAYS days..."
    
    local count=0
    while IFS= read -r -d '' file; do
        rm "$file"
        ((count++))
    done < <(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -print0)
    
    if [ $count -gt 0 ]; then
        log_success "Removed $count old backup(s)"
    else
        log_info "No old backups to remove"
    fi
    
    # Remove empty date directories
    find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true
}

# Generate backup report
generate_report() {
    local backup_file="$1"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_info "Backup completed in ${duration}s"
    log_success "Backup file: $backup_file"
    
    # Count total backups
    local total_backups=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
    log_info "Total backups: $total_backups"
    
    # Calculate total size
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log_info "Total backup size: $total_size"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    echo ""
    log_info "================================================"
    log_info "Starting backup at $(date)"
    log_info "================================================"
    echo ""
    
    # Create backup directory
    create_backup_dir
    
    # Check database is running
    check_database
    
    # Create backup
    local backup_file=$(create_backup)
    
    # Verify backup
    if ! verify_backup "$backup_file"; then
        send_notification "error" "Backup verification failed"
        exit 1
    fi
    
    # Upload to S3 (if enabled)
    upload_to_s3 "$backup_file"
    
    # Clean old backups
    clean_old_backups
    
    # Generate report
    generate_report "$backup_file"
    
    echo ""
    log_info "================================================"
    log_success "Backup completed successfully!"
    log_info "================================================"
    
    # Send success notification
    send_notification "success" "Database backup completed successfully: $(basename $backup_file)"
    
    exit 0
}

# Error handler
error_handler() {
    log_error "Backup script failed on line $1"
    send_notification "error" "Backup script failed"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Run main function
main "$@"
