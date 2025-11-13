# Migration Fixes - Idempotent Migrations

## Problem

The setup script was failing with errors like:
```
ERROR: relation "strategic_objectives" already exists (SQLSTATE 42P07)
```

This happened because migrations were trying to create tables, indexes, and policies that already existed in the database.

## Solution

All migrations have been updated to be **idempotent** - meaning they can be run multiple times safely without errors.

### Changes Made

1. **Tables**: Changed `CREATE TABLE` to `CREATE TABLE IF NOT EXISTS`
2. **Indexes**: Changed `CREATE INDEX` to `CREATE INDEX IF NOT EXISTS`
3. **Triggers**: Added `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
4. **Policies**: Added `DROP POLICY IF EXISTS` before `CREATE POLICY`
5. **RLS**: Wrapped `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in conditional blocks

### Fixed Migrations

- ✅ `20251023000001_restructure_goals_objectives_deliverables.sql`
- ✅ `20251023000007_add_initiatives_objective_id.sql` (already had IF NOT EXISTS)
- ✅ `20251023000002_create_fn_create_goal_with_children.sql` (already had DROP IF EXISTS)

### Setup Script Improvements

The `scripts/dev-setup.sh` script now:
- Handles migration errors gracefully
- Shows warnings instead of failing completely
- Displays migration status if errors occur

## Testing

Run the setup again:
```bash
npm run dev:setup
```

The migrations should now complete successfully, showing NOTICE messages (which are harmless) instead of ERROR messages.

## For New Developers

When setting up for the first time:
1. Run `npm run dev:setup`
2. If you see NOTICE messages about existing objects, that's normal
3. The setup will complete successfully

## For Existing Developers

If you already have the database set up:
1. The migrations will now run without errors
2. Existing objects will be skipped (NOTICE messages)
3. New objects will be created as needed

## Verification

Check migration status:
```bash
npm run db:status
```

All migrations should show as applied.

