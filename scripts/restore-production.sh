#!/bin/bash

# ===========================================
# Production Database Restore Script
# ===========================================
# This script restores a database backup with safety checks
#
# Usage: ./scripts/restore-production.sh <backup_file>

set -euo pipefail

# Configuration
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.production.yml}"
DB_CONTAINER="${DB_CONTAINER:-strategic_plan_db}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
LOG_FILE="./backups/restore.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
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

# Check arguments
if [ $# -eq 0 ]; then
    log_error "No backup file specified"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    find ./backups -name "backup_*.sql.gz" -type f -printf "%T@ %p\n" 2>/dev/null | \
        sort -rn | \
        head -10 | \
        cut -d' ' -f2- || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if backup is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    IS_COMPRESSED=true
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
else
    IS_COMPRESSED=false
    TEMP_FILE="$BACKUP_FILE"
fi

# Verify database container
check_database() {
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "Database container '$DB_CONTAINER' is not running"
        exit 1
    fi
    log_success "Database container is running"
}

# Create pre-restore backup
create_safety_backup() {
    local safety_backup="./backups/pre-restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    log_warning "Creating safety backup before restore..."
    
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --no-owner --no-acl --clean --if-exists | gzip > "$safety_backup"; then
        log_success "Safety backup created: $safety_backup"
        echo "$safety_backup"
    else
        log_error "Failed to create safety backup"
        exit 1
    fi
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup file integrity..."
    
    if [ "$IS_COMPRESSED" = true ]; then
        if gzip -t "$BACKUP_FILE" 2>> "$LOG_FILE"; then
            log_success "Backup file integrity verified"
        else
            log_error "Backup file is corrupted"
            exit 1
        fi
    fi
}

# Decompress backup if needed
decompress_backup() {
    if [ "$IS_COMPRESSED" = true ]; then
        log_info "Decompressing backup..."
        if gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"; then
            log_success "Backup decompressed"
        else
            log_error "Failed to decompress backup"
            exit 1
        fi
    fi
}

# Get backup info
get_backup_info() {
    local size=$(du -h "$BACKUP_FILE" | cut -f1)
    local modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || \
                    stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d'.' -f1)
    
    log_info "Backup file: $BACKUP_FILE"
    log_info "File size: $size"
    log_info "Last modified: $modified"
}

# Confirm restore
confirm_restore() {
    echo ""
    log_warning "================================================"
    log_warning "WARNING: This will REPLACE all current data!"
    log_warning "================================================"
    echo ""
    
    read -p "Are you sure you want to continue? Type 'YES' to proceed: " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
}

# Restore database
restore_database() {
    log_info "Starting database restore..."
    
    # Stop application temporarily
    log_info "Stopping application..."
    docker compose -f "$DOCKER_COMPOSE_FILE" stop app 2>> "$LOG_FILE" || true
    
    # Perform restore
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        < "$TEMP_FILE" >> "$LOG_FILE" 2>&1; then
        log_success "Database restored successfully"
    else
        log_error "Database restore failed"
        log_error "Check $LOG_FILE for details"
        
        # Restart application
        docker compose -f "$DOCKER_COMPOSE_FILE" start app 2>> "$LOG_FILE" || true
        exit 1
    fi
    
    # Restart application
    log_info "Restarting application..."
    if docker compose -f "$DOCKER_COMPOSE_FILE" start app >> "$LOG_FILE" 2>&1; then
        log_success "Application restarted"
    else
        log_warning "Failed to restart application automatically"
        log_info "Run: docker compose -f $DOCKER_COMPOSE_FILE start app"
    fi
}

# Verify restore
verify_restore() {
    log_info "Verifying database connection..."
    
    sleep 3
    
    if docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
        >> "$LOG_FILE" 2>&1; then
        log_success "Database is operational"
    else
        log_warning "Database connection test failed"
    fi
}

# Cleanup
cleanup() {
    if [ "$IS_COMPRESSED" = true ] && [ -f "$TEMP_FILE" ]; then
        rm "$TEMP_FILE"
        log_info "Temporary files cleaned up"
    fi
}

# Error handler
error_handler() {
    log_error "Restore failed on line $1"
    cleanup
    exit 1
}

trap 'error_handler $LINENO' ERR
trap cleanup EXIT

# Main execution
main() {
    local start_time=$(date +%s)
    
    echo ""
    log_info "================================================"
    log_info "Starting restore at $(date)"
    log_info "================================================"
    echo ""
    
    # Get backup info
    get_backup_info
    
    # Check database
    check_database
    
    # Verify backup
    verify_backup
    
    # Confirm
    confirm_restore
    
    # Create safety backup
    safety_backup=$(create_safety_backup)
    
    # Decompress if needed
    decompress_backup
    
    # Restore database
    restore_database
    
    # Verify restore
    verify_restore
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    log_info "================================================"
    log_success "Restore completed successfully in ${duration}s!"
    log_info "================================================"
    echo ""
    log_info "Safety backup created at: $safety_backup"
    log_info "You can restore to previous state if needed"
    
    exit 0
}

# Run main
main "$@"
