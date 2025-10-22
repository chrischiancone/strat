#!/bin/bash

# Restore Supabase data from backup
# Usage: ./scripts/restore-data.sh [backup_file]

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a backup file"
    echo "Usage: ./scripts/restore-data.sh backups/data_backup_YYYYMMDD_HHMMSS.sql"
    echo ""
    echo "Available backups:"
    ls -1t backups/*.sql 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring data from: $BACKUP_FILE"
echo ""
echo "⚠️  This will overwrite current data. Press Ctrl+C to cancel, or Enter to continue..."
read

# Set password for psql
export PGPASSWORD="postgres"

# Restore data
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Data restored successfully!"
else
    echo ""
    echo "❌ Restore failed"
    exit 1
fi
