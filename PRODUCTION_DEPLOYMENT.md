# Production Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Initial Deployment](#initial-deployment)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Process](#deployment-process)
- [Post-Deployment Verification](#post-deployment-verification)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## Overview

This guide provides step-by-step instructions for deploying the Strategic Planning System to production using Docker containers with a self-hosted Supabase instance.

**Architecture:**
- **Frontend/Backend**: Next.js 14 application
- **Database**: PostgreSQL 15 (via Supabase)
- **Authentication**: Supabase Auth (GoTrue)
- **Storage**: Supabase Storage
- **Caching**: Redis
- **Reverse Proxy**: Nginx with SSL/TLS
- **Container Orchestration**: Docker Compose

---

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS or similar Linux distribution
- **CPU**: Minimum 4 cores (8+ recommended)
- **RAM**: Minimum 8GB (16GB+ recommended)
- **Storage**: Minimum 100GB SSD
- **Network**: Static IP address, ports 80/443 open

### Software Requirements
- Docker 24.0+
- Docker Compose 2.0+
- Node.js 20+ (for local builds)
- Git
- OpenSSL (for SSL certificates)

### Domain and DNS
- Domain name registered and pointing to server IP
- DNS A record configured
- Optional: Wildcard DNS for subdomains

---

## Pre-Deployment Checklist

Run the automated pre-deployment validation:

```bash
./scripts/pre-deploy-check.sh
```

### Manual Checklist

- [ ] Server provisioned and accessible via SSH
- [ ] Domain DNS configured
- [ ] SSL certificates obtained (Let's Encrypt recommended)
- [ ] `.env.production` configured with production values
- [ ] All placeholder passwords replaced with secure values
- [ ] Backup strategy configured
- [ ] Monitoring tools configured (Sentry, etc.)
- [ ] CI/CD pipeline tested
- [ ] Database migrations reviewed
- [ ] Code merged to `main` branch
- [ ] All tests passing

---

## Initial Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installations
docker --version
docker compose version
```

### 2. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/strategic-plan
sudo chown $USER:$USER /opt/strategic-plan
cd /opt/strategic-plan

# Clone repository
git clone <your-repo-url> .
git checkout main
```

### 3. Create Required Directories

```bash
# Create directories for persistent data
mkdir -p ssl
mkdir -p backups
mkdir -p logs

# Set permissions
chmod 700 ssl
chmod 700 backups
```

---

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
chmod 600 ssl/*.pem

# Setup auto-renewal
sudo certbot renew --dry-run
sudo systemctl enable certbot.timer
```

### Option 2: Self-Signed (Development Only)

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"

chmod 600 ssl/*.pem
```

---

## Environment Configuration

### 1. Generate Secure Secrets

```bash
# Generate JWT secret (32 bytes)
openssl rand -base64 32

# Generate Realtime secret key base (64 bytes)
openssl rand -base64 64

# Generate strong password
openssl rand -base64 32

# Generate Supabase keys (use Supabase CLI)
npx supabase keys
```

### 2. Configure Environment

```bash
# Copy template
cp .env.production.template .env.production

# Edit with secure values
nano .env.production

# Set secure permissions
chmod 600 .env.production
```

### 3. Verify Configuration

```bash
# Check for placeholder values
grep -E 'changeme|password123|your-' .env.production

# If any found, replace them!
```

---

## Database Setup

### 1. Initialize Database

The database will be automatically initialized from migrations on first startup.

### 2. Review Migrations

```bash
# List all migrations
ls -la supabase/migrations/

# Review migration order
cat supabase/migrations/*.sql
```

### 3. Create Admin User

After deployment, create the first admin user:

```bash
# Access the database
docker exec -it strategic_plan_db psql -U postgres -d postgres

# Create admin user (within psql)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'admin@your-domain.com',
  crypt('your-secure-password', gen_salt('bf')),
  now()
);
```

---

## Deployment Process

### 1. Build and Deploy

```bash
cd /opt/strategic-plan

# Pull latest code
git pull origin main

# Build and start services
docker compose -f docker-compose.production.yml up -d --build

# Watch logs
docker compose -f docker-compose.production.yml logs -f
```

### 2. Run Database Migrations

```bash
# Wait for database to be ready (30 seconds)
sleep 30

# Run migrations
docker compose -f docker-compose.production.yml exec app npm run db:migrate
```

### 3. Verify Services

```bash
# Check all services are running
docker compose -f docker-compose.production.yml ps

# Check service health
docker compose -f docker-compose.production.yml exec app curl http://localhost:3000/api/health
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# HTTP health check
curl http://your-domain.com/health

# HTTPS health check
curl https://your-domain.com/api/health

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 2. Functional Testing

- [ ] Can access home page at `https://your-domain.com`
- [ ] Can log in with admin credentials
- [ ] Can create a test plan
- [ ] Can upload a file
- [ ] Database operations working
- [ ] Real-time updates functioning
- [ ] Email notifications sending (if configured)

### 3. Performance Testing

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Monitor resource usage
docker stats
```

### 4. Security Verification

```bash
# Check security headers
curl -I https://your-domain.com

# Verify rate limiting
for i in {1..10}; do curl https://your-domain.com/api/auth/login; done

# Check SSL grade (external tool)
# Visit: https://www.ssllabs.com/ssltest/
```

---

## Monitoring and Maintenance

### Daily Tasks

```bash
# Check service health
docker compose -f docker-compose.production.yml ps

# Check disk usage
df -h

# Review error logs
docker compose -f docker-compose.production.yml logs --tail=100 app | grep ERROR
```

### Weekly Tasks

```bash
# Backup database
./scripts/backup-data.sh

# Review security logs
docker compose -f docker-compose.production.yml logs auth | grep -i "security\|failed\|unauthorized"

# Update dependencies (if needed)
npm audit
```

### Monthly Tasks

```bash
# Rotate logs
find /opt/strategic-plan/logs -name "*.log" -mtime +30 -delete

# Review and rotate SSL certificates
sudo certbot renew

# Database vacuum and analyze
docker compose -f docker-compose.production.yml exec postgres vacuumdb -U postgres --all --analyze

# Review and update dependencies
npm outdated
```

### Monitoring Tools

**Recommended Setup:**
- **Error Tracking**: Sentry (configured in `.env.production`)
- **Uptime Monitoring**: UptimeRobot or similar
- **Log Aggregation**: ELK Stack or Loki
- **Metrics**: Prometheus + Grafana
- **APM**: New Relic or DataDog (optional)

---

## Rollback Procedures

### Quick Rollback

```bash
cd /opt/strategic-plan

# Pull previous version
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build

# Verify
curl https://your-domain.com/api/health
```

### Database Rollback

```bash
# List available backups
ls -la ./backups/

# Restore from backup
./scripts/restore-data.sh ./backups/backup-YYYY-MM-DD.sql

# Verify data integrity
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"
```

### Complete Rollback with Data Restore

```bash
# 1. Stop all services
docker compose -f docker-compose.production.yml down

# 2. Restore previous version
git checkout <stable-commit>

# 3. Restore database backup
./scripts/restore-data.sh ./backups/backup-YYYY-MM-DD.sql

# 4. Restart services
docker compose -f docker-compose.production.yml up -d

# 5. Verify
curl https://your-domain.com/api/health
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs <service-name>

# Check configuration
docker compose -f docker-compose.production.yml config

# Check disk space
df -h

# Check memory
free -h

# Restart service
docker compose -f docker-compose.production.yml restart <service-name>
```

### Database Connection Issues

```bash
# Check database is running
docker ps | grep postgres

# Check database logs
docker logs strategic_plan_db

# Test connection
docker exec strategic_plan_db pg_isready -U postgres

# Check connection from app
docker compose -f docker-compose.production.yml exec app nc -zv postgres 5432
```

### SSL/HTTPS Issues

```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout | grep "Not After"

# Check nginx configuration
docker compose -f docker-compose.production.yml exec nginx nginx -t

# Reload nginx
docker compose -f docker-compose.production.yml restart nginx

# Check certificate chain
curl -vI https://your-domain.com
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check slow queries
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check Redis
docker compose -f docker-compose.redis.yml exec redis redis-cli INFO stats

# Clear caches
docker compose -f docker-compose.redis.yml restart redis
```

### Application Errors

```bash
# Check application logs
docker compose -f docker-compose.production.yml logs app -f

# Check error tracking (Sentry)
# Visit your Sentry dashboard

# Check health endpoint
curl https://your-domain.com/api/health

# Restart application
docker compose -f docker-compose.production.yml restart app
```

---

## Security Best Practices

### 1. Access Control

```bash
# Use SSH keys only (disable password auth)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no

# Setup firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Use fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 2. Secret Management

- Store secrets in AWS Secrets Manager, HashiCorp Vault, or similar
- Rotate secrets every 90 days
- Never commit secrets to version control
- Use `.env` files with strict permissions (600)

### 3. Database Security

```bash
# Regular backups (automated)
# Set in crontab:
0 2 * * * /opt/strategic-plan/scripts/backup-data.sh

# Enable SSL for database connections
# Configure in docker-compose.production.yml

# Regular security audits
npm audit
docker scan strategic_plan_app
```

### 4. Monitoring and Alerts

- Setup alerting for:
  - Service downtime
  - High error rates
  - Slow response times
  - Disk space < 20%
  - High CPU/memory usage
  - Failed login attempts
  - SSL certificate expiry

### 5. Update Strategy

```bash
# Monthly security updates
sudo apt update && sudo apt upgrade

# Dependency updates
npm audit fix

# Docker image updates
docker pull supabase/postgres:latest
```

---

## Support and Contact

For issues not covered in this guide:

1. Check the [GitHub Issues](your-repo-url/issues)
2. Review application logs
3. Contact the development team
4. Emergency contact: [your-emergency-contact]

---

## Appendix: Useful Commands

```bash
# View all logs
docker compose -f docker-compose.production.yml logs -f

# Restart all services
docker compose -f docker-compose.production.yml restart

# Stop all services
docker compose -f docker-compose.production.yml down

# Remove all data (DANGEROUS)
docker compose -f docker-compose.production.yml down -v

# Scale app (if needed)
docker compose -f docker-compose.production.yml up -d --scale app=3

# Execute command in container
docker compose -f docker-compose.production.yml exec app sh

# Database backup
docker compose -f docker-compose.production.yml exec postgres pg_dump -U postgres postgres > backup.sql

# Database restore
docker compose -f docker-compose.production.yml exec -T postgres psql -U postgres postgres < backup.sql
```

---

**Last Updated**: $(date +%Y-%m-%d)
**Version**: 1.0.0
