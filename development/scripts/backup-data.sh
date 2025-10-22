#!/bin/bash

# Backup Supabase data before migrations
# Usage: ./scripts/backup-data.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/data_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating data backup..."

# Export data from local Supabase
npx supabase db dump --data-only -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Data backed up to: $BACKUP_FILE"
    echo ""
    echo "To restore this backup later, run:"
    echo "  psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < $BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi
