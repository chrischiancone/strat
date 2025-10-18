# Database Migration Guide

This guide explains how to make database changes without losing your data.

## Quick Reference

### ✅ Safe Operations (Preserve Data)

```bash
# 1. Create a new migration file
npx supabase migration new your_migration_name

# 2. Edit the migration file in supabase/migrations/

# 3. Apply migrations without resetting
npx supabase db push

# 4. For local development
npx supabase migration up
```

### ⚠️ Destructive Operations (Lose Data)

```bash
# These will DELETE all data:
npx supabase db reset    # ❌ Drops and recreates database
```

## Workflow for Making Schema Changes

### Option 1: Create New Migrations (Recommended)

This preserves existing data:

```bash
# Step 1: Backup current data (optional but recommended)
chmod +x scripts/backup-data.sh
./scripts/backup-data.sh

# Step 2: Create a new migration
npx supabase migration new add_new_column_to_users

# Step 3: Edit the generated file in supabase/migrations/
# Example: supabase/migrations/20251016000001_add_new_column_to_users.sql

# Step 4: Apply the migration
npx supabase migration up
```

### Option 2: Backup and Restore

If you need to reset the database:

```bash
# Step 1: Backup data
./scripts/backup-data.sh

# Step 2: Reset database (if needed)
npx supabase db reset

# Step 3: Restore data
./scripts/restore-data.sh backups/data_backup_YYYYMMDD_HHMMSS.sql
```

## Common Migration Examples

### Add a Column

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_column.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

### Modify a Column

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_modify_column.sql
ALTER TABLE users ALTER COLUMN email TYPE TEXT;
```

### Add an Index

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_index.sql
CREATE INDEX idx_users_email ON users(email);
```

### Create a New Table

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_table.sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (user_id = auth.uid());
```

### Update RLS Policies

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_update_rls.sql

-- Drop old policy
DROP POLICY IF EXISTS old_policy_name ON table_name;

-- Create new policy
CREATE POLICY new_policy_name ON table_name
    FOR SELECT USING (
        -- your policy logic
        true
    );
```

## Backup Management

### List Available Backups

```bash
ls -lt backups/
```

### Manual Backup

```bash
# Backup everything (schema + data)
npx supabase db dump -f backups/full_backup.sql

# Backup data only
npx supabase db dump --data-only -f backups/data_only.sql

# Backup specific tables
npx supabase db dump --data-only -t users -t departments -f backups/specific_tables.sql
```

### Manual Restore

```bash
# Set password
export PGPASSWORD="postgres"

# Restore from backup
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < backups/backup_file.sql
```

## Best Practices

1. **Always backup before major changes**
   ```bash
   ./scripts/backup-data.sh
   ```

2. **Use migrations for schema changes**
   - Create new migration files instead of editing existing ones
   - Never modify migrations that have been applied to production

3. **Test migrations locally first**
   ```bash
   # Apply migration locally
   npx supabase migration up
   
   # If something goes wrong, rollback
   npx supabase db reset
   ./scripts/restore-data.sh backups/latest_backup.sql
   ```

4. **Keep seed data updated**
   - Update seed scripts when you add new required data
   - Location: `supabase/seed.sql` (if you create one)

5. **Version control your migrations**
   - Commit migration files to git
   - Never delete or modify applied migrations

## Troubleshooting

### Issue: Migration fails

```bash
# Check migration status
npx supabase migration list

# Check database logs
npx supabase db logs

# Rollback and try again
npx supabase db reset
./scripts/restore-data.sh backups/your_backup.sql
```

### Issue: Data lost after reset

```bash
# Restore from most recent backup
./scripts/restore-data.sh backups/data_backup_YYYYMMDD_HHMMSS.sql
```

### Issue: Auth users lost

After a database reset, auth users are wiped. Recreate them:

```bash
# Recreate test users
node scripts/create-test-user.js

# Or reset specific user password
npx tsx scripts/reset-specific-user-password.ts user@example.com password123
```

## NPM Scripts

Add these to your workflow:

```bash
# Backup data
npm run db:backup

# Create new migration
npm run db:migration "migration_name"

# Apply migrations
npm run db:migrate

# Reset and restore
npm run db:reset
npm run db:restore
```

## Production Deployments

For production databases:

1. **Never use `db reset`** - This drops all data
2. **Use `db push`** - This applies migrations safely
3. **Always backup first** - Use your hosting provider's backup tools
4. **Test migrations locally** - Before applying to production
5. **Plan for rollback** - Have a rollback strategy ready

```bash
# Safe production workflow
npx supabase link --project-ref your-project-ref
npx supabase db push --dry-run  # Preview changes
npx supabase db push            # Apply migrations
```
