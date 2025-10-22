# Backup and Recovery Procedures

Complete guide for database backup, restoration, and disaster recovery.

## Overview

The system includes automated backup scripts with:
- Compressed backups (gzip)
- Retention policies
- Integrity verification
- Off-site storage support (S3)
- Notification webhooks
- Automated scheduling via cron

---

## Backup Scripts

### Production Backup Script
**Location**: `./scripts/backup-production.sh`

**Features**:
- Automated PostgreSQL dumps
- Gzip compression
- Backup verification
- Optional S3 upload
- Retention policy (default: 30 days)
- Webhook notifications
- Detailed logging

**Usage**:
```bash
# Manual backup
./scripts/backup-production.sh

# With custom retention
RETENTION_DAYS=60 ./scripts/backup-production.sh

# With S3 upload
S3_ENABLED=true BACKUP_S3_BUCKET=my-bucket ./scripts/backup-production.sh
```

### Production Restore Script
**Location**: `./scripts/restore-production.sh`

**Features**:
- Safety backup before restore
- Integrity verification
- Automatic decompression
- Application service management
- Detailed logging

**Usage**:
```bash
# List available backups
./scripts/restore-production.sh

# Restore specific backup
./scripts/restore-production.sh ./backups/2025-10/backup_20251020_020000.sql.gz
```

---

## Automated Backup Schedule

### Setting Up Cron Jobs

#### 1. Edit Crontab

```bash
# Open crontab for editing
crontab -e
```

#### 2. Add Backup Jobs

```cron
# Daily backup at 2:00 AM
0 2 * * * cd /opt/strategic-plan && ./scripts/backup-production.sh >> /var/log/strategic-plan-backup.log 2>&1

# Weekly full backup on Sunday at 3:00 AM with S3 upload
0 3 * * 0 cd /opt/strategic-plan && S3_ENABLED=true ./scripts/backup-production.sh >> /var/log/strategic-plan-backup.log 2>&1

# Monthly backup cleanup (optional, script auto-cleans)
0 4 1 * * find /opt/strategic-plan/backups -name "backup_*.sql.gz" -mtime +90 -delete
```

#### 3. Verify Cron Jobs

```bash
# List cron jobs
crontab -l

# Check cron service status
sudo systemctl status cron
```

### Cron Schedule Examples

```cron
# Every 6 hours
0 */6 * * * /opt/strategic-plan/scripts/backup-production.sh

# Daily at midnight
0 0 * * * /opt/strategic-plan/scripts/backup-production.sh

# Twice daily (2 AM and 2 PM)
0 2,14 * * * /opt/strategic-plan/scripts/backup-production.sh

# Weekdays only at 3 AM
0 3 * * 1-5 /opt/strategic-plan/scripts/backup-production.sh

# Every Monday at 1 AM
0 1 * * 1 /opt/strategic-plan/scripts/backup-production.sh
```

---

## Backup Configuration

### Environment Variables

```bash
# Backup directory (default: ./backups)
BACKUP_DIR=/opt/strategic-plan/backups

# Retention period in days (default: 30)
RETENTION_DAYS=30

# Docker configuration
DOCKER_COMPOSE_FILE=docker-compose.production.yml
DB_CONTAINER=strategic_plan_db
DB_USER=postgres
DB_NAME=postgres

# S3 configuration (optional)
S3_ENABLED=true
BACKUP_S3_BUCKET=my-backup-bucket

# Webhook notification (optional)
BACKUP_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Setting Environment Variables

#### Option 1: In Cron Job
```cron
0 2 * * * cd /opt/strategic-plan && RETENTION_DAYS=60 S3_ENABLED=true ./scripts/backup-production.sh
```

#### Option 2: In .env File
```bash
# Create backup config file
cat > /opt/strategic-plan/.env.backup << EOF
BACKUP_DIR=/opt/strategic-plan/backups
RETENTION_DAYS=30
S3_ENABLED=true
BACKUP_S3_BUCKET=my-backup-bucket
BACKUP_WEBHOOK_URL=https://your-webhook-url
EOF

# Source in cron job
0 2 * * * cd /opt/strategic-plan && source .env.backup && ./scripts/backup-production.sh
```

---

## Off-Site Backup (S3)

### AWS S3 Setup

#### 1. Install AWS CLI

```bash
# On Ubuntu
sudo apt install awscli

# Configure AWS credentials
aws configure
```

#### 2. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://strategic-plan-backups

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket strategic-plan-backups \
  --versioning-configuration Status=Enabled

# Set lifecycle policy for old versions
cat > lifecycle.json << EOF
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket strategic-plan-backups \
  --lifecycle-configuration file://lifecycle.json
```

#### 3. Test S3 Upload

```bash
# Test backup with S3
S3_ENABLED=true BACKUP_S3_BUCKET=strategic-plan-backups ./scripts/backup-production.sh

# Verify upload
aws s3 ls s3://strategic-plan-backups/strategic-plan/
```

### Alternative: Other Cloud Providers

#### Backblaze B2
```bash
# Install B2 CLI
pip install b2

# Configure
b2 authorize-account <applicationKeyId> <applicationKey>

# Upload (modify script to use b2 instead of aws)
b2 upload-file <bucket> <local-file> <remote-name>
```

#### DigitalOcean Spaces
```bash
# Configure AWS CLI for Spaces
aws configure set aws_access_key_id <your-spaces-key>
aws configure set aws_secret_access_key <your-spaces-secret>

# Use with custom endpoint
aws s3 cp backup.sql.gz s3://your-bucket/ --endpoint-url=https://nyc3.digitaloceanspaces.com
```

---

## Backup Verification

### Manual Verification

```bash
# List backups
ls -lh backups/

# Check backup size
du -sh backups/

# Verify gzip integrity
gzip -t backups/2025-10/backup_20251020_020000.sql.gz

# Test restore to temporary database (Docker)
docker run --rm -e POSTGRES_PASSWORD=test postgres:15
gunzip -c backup.sql.gz | docker exec -i temp-db psql -U postgres
```

### Automated Verification

Add to crontab:
```cron
# Daily verification of last backup
0 5 * * * /opt/strategic-plan/scripts/verify-last-backup.sh
```

**verify-last-backup.sh**:
```bash
#!/bin/bash
LAST_BACKUP=$(find /opt/strategic-plan/backups -name "backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$LAST_BACKUP" ]; then
    echo "No backups found!"
    exit 1
fi

if gzip -t "$LAST_BACKUP" 2>/dev/null; then
    echo "Backup verified: $LAST_BACKUP"
    exit 0
else
    echo "Backup verification failed: $LAST_BACKUP"
    exit 1
fi
```

---

## Restore Procedures

### Scenario 1: Recent Data Loss

```bash
# 1. Find latest backup
ls -lt backups/

# 2. Stop application
docker compose -f docker-compose.production.yml stop app

# 3. Restore backup
./scripts/restore-production.sh backups/2025-10/backup_20251020_020000.sql.gz

# 4. Verify application
curl https://your-domain.com/api/health
```

### Scenario 2: Complete System Failure

```bash
# 1. Provision new server
# 2. Install Docker and dependencies
# 3. Clone repository
# 4. Download backup from S3

aws s3 cp s3://strategic-plan-backups/strategic-plan/2025-10/backup_20251020_020000.sql.gz ./backups/

# 5. Start infrastructure
docker compose -f docker-compose.production.yml up -d postgres

# 6. Wait for database
sleep 30

# 7. Restore backup
./scripts/restore-production.sh backups/backup_20251020_020000.sql.gz

# 8. Start application
docker compose -f docker-compose.production.yml up -d
```

### Scenario 3: Point-in-Time Recovery

```bash
# 1. Find backup closest to desired time
ls -l backups/

# 2. Restore that backup
./scripts/restore-production.sh backups/2025-10/backup_20251020_140000.sql.gz

# 3. If needed, manually roll forward from audit logs
```

---

## Monitoring Backups

### Check Backup Status

```bash
# View backup log
tail -100 backups/backup.log

# Check last backup time
stat -f "%Sm" $(find backups -name "backup_*.sql.gz" -type f | sort | tail -1)

# Check backup sizes
du -sh backups/*/
```

### Backup Health Script

**backup-health.sh**:
```bash
#!/bin/bash

# Find last backup
LAST_BACKUP=$(find backups -name "backup_*.sql.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1)
LAST_BACKUP_TIME=$(echo $LAST_BACKUP | cut -d' ' -f1)
CURRENT_TIME=$(date +%s)
AGE_HOURS=$(( (CURRENT_TIME - LAST_BACKUP_TIME) / 3600 ))

echo "Last backup: ${AGE_HOURS} hours ago"

if [ $AGE_HOURS -gt 25 ]; then
    echo "WARNING: Last backup is too old!"
    exit 1
else
    echo "Backup status: OK"
    exit 0
fi
```

Add to monitoring:
```cron
*/30 * * * * /opt/strategic-plan/scripts/backup-health.sh || echo "Backup health check failed" | mail -s "Backup Alert" admin@example.com
```

---

## Disaster Recovery Plan

### Recovery Time Objective (RTO)
**Target**: 2 hours

### Recovery Point Objective (RPO)
**Target**: 24 hours (daily backups)

### DR Steps

1. **Assess Situation** (5 minutes)
   - Determine cause of failure
   - Identify affected services
   - Check backup availability

2. **Provision Infrastructure** (30 minutes)
   - Provision new server if needed
   - Install required software
   - Configure networking

3. **Restore Application** (30 minutes)
   - Clone repository
   - Download latest backup
   - Start Docker services

4. **Restore Database** (30 minutes)
   - Run restore script
   - Verify data integrity
   - Check application connectivity

5. **Update DNS** (15 minutes)
   - Point DNS to new server
   - Wait for propagation
   - Verify with health checks

6. **Verify and Monitor** (15 minutes)
   - Test critical functionality
   - Check error logs
   - Monitor performance

### DR Testing Schedule

- **Quarterly**: Full DR drill
- **Monthly**: Test backup restore to staging
- **Weekly**: Verify backup integrity
- **Daily**: Check backup completion

---

## Backup Best Practices

### Security
1. Encrypt backups at rest
2. Use secure transfer protocols (HTTPS, SSH)
3. Limit access to backup files
4. Store off-site in different region
5. Encrypt S3 buckets with KMS

### Reliability
1. Test restores regularly
2. Maintain multiple backup generations
3. Store backups in multiple locations
4. Monitor backup jobs
5. Alert on failures

### Performance
1. Run backups during low-traffic periods
2. Use compression (gzip)
3. Incremental backups for large databases
4. Parallel backups if possible

### Compliance
1. Document retention policies
2. Maintain audit trail
3. Regular compliance reviews
4. Secure deletion of old backups

---

## Troubleshooting

### Backup Fails

```bash
# Check disk space
df -h

# Check Docker container
docker ps | grep strategic_plan_db

# Check database connectivity
docker exec strategic_plan_db pg_isready -U postgres

# Check permissions
ls -la backups/

# Check logs
tail -100 backups/backup.log
```

### Restore Fails

```bash
# Check backup file integrity
gzip -t backup.sql.gz

# Check database is running
docker ps | grep strategic_plan_db

# Check logs
tail -100 backups/restore.log

# Try manual restore
gunzip -c backup.sql.gz | docker exec -i strategic_plan_db psql -U postgres -d postgres
```

### S3 Upload Fails

```bash
# Check AWS credentials
aws sts get-caller-identity

# Check bucket permissions
aws s3 ls s3://your-bucket/

# Test upload manually
aws s3 cp backup.sql.gz s3://your-bucket/test/

# Check AWS CLI logs
AWS_CLI_LOG_FILE=aws-cli.log aws s3 cp backup.sql.gz s3://your-bucket/
cat aws-cli.log
```

---

## Contact and Support

For backup and recovery assistance:
- Check logs: `backups/backup.log` and `backups/restore.log`
- Contact DevOps team
- Emergency: [emergency-contact]

---

**Last Updated**: 2025-10-20  
**Version**: 1.0
