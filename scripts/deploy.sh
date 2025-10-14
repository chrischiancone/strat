#!/bin/bash

# Strategic Planning System - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/strategic-plan-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
check_requirements() {
    log "Checking deployment requirements..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check environment file
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found. Please copy from .env.production.template"
    fi
    
    # Check SSL certificates
    if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
        warn "SSL certificates not found. HTTPS will not work until certificates are installed."
    fi
    
    success "All requirements check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if it exists
    if docker ps | grep -q strategic_plan_db; then
        log "Backing up database..."
        docker exec strategic_plan_db pg_dump -U postgres postgres | gzip > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
        success "Database backup created"
    fi
    
    # Backup storage data if it exists
    if [[ -d "/var/lib/docker/volumes/strategic-plan_storage_data" ]]; then
        log "Backing up storage data..."
        tar -czf "$BACKUP_DIR/storage_backup_$(date +%Y%m%d_%H%M%S).tar.gz" -C /var/lib/docker/volumes strategic-plan_storage_data
        success "Storage backup created"
    fi
}

# Deploy application
deploy() {
    log "Starting deployment..."
    
    # Pull latest code
    log "Pulling latest code..."
    git pull origin main || error "Failed to pull latest code"
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker compose -f "$COMPOSE_FILE" down || warn "No existing containers to stop"
    
    # Remove old images (optional, saves space)
    log "Cleaning up old Docker images..."
    docker system prune -f || warn "Failed to clean up Docker images"
    
    # Build and start containers
    log "Building and starting containers..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
    
    success "Deployment completed"
}

# Health checks
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if ! docker ps | grep -q strategic_plan_app; then
        error "Application container is not running"
    fi
    
    if ! docker ps | grep -q strategic_plan_db; then
        error "Database container is not running"
    fi
    
    if ! docker ps | grep -q strategic_plan_nginx; then
        error "Nginx container is not running"
    fi
    
    # Check application health endpoint
    if command -v curl &> /dev/null; then
        if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Application health check passed"
        else
            warn "Application health check failed - service might still be starting"
        fi
    fi
    
    # Check database connectivity
    if docker exec strategic_plan_db psql -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        success "Database connectivity check passed"
    else
        error "Database connectivity check failed"
    fi
    
    success "All health checks completed"
}

# Post-deployment tasks
post_deploy() {
    log "Running post-deployment tasks..."
    
    # Update file permissions
    chown -R root:docker /opt/strategic-plan || warn "Failed to update file permissions"
    
    # Setup log rotation
    if [[ ! -f "/etc/logrotate.d/strategic-plan" ]]; then
        cat > /etc/logrotate.d/strategic-plan << EOF
/var/log/strategic-plan-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF
        success "Log rotation configured"
    fi
    
    # Clean up old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete || warn "Failed to clean up old backups"
    
    success "Post-deployment tasks completed"
}

# Display deployment info
show_info() {
    echo
    echo "======================================"
    echo "   DEPLOYMENT COMPLETED SUCCESSFULLY  "
    echo "======================================"
    echo
    echo "Application: http://localhost:3000"
    echo "Database: localhost:5432"
    echo "Supabase API: http://localhost:8000"
    echo
    echo "Container Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    echo "Log locations:"
    echo "- Deployment log: $LOG_FILE"
    echo "- Application logs: docker logs strategic_plan_app"
    echo "- Database logs: docker logs strategic_plan_db"
    echo "- Nginx logs: docker logs strategic_plan_nginx"
    echo
    echo "Backup location: $BACKUP_DIR"
    echo
}

# Main deployment process
main() {
    log "Starting Strategic Planning System deployment"
    
    check_requirements
    backup_current
    deploy
    health_check
    post_deploy
    show_info
    
    success "Deployment completed successfully!"
}

# Handle script arguments
case "$1" in
    --check)
        check_requirements
        ;;
    --backup)
        backup_current
        ;;
    --deploy-only)
        deploy
        ;;
    --health)
        health_check
        ;;
    *)
        main
        ;;
esac