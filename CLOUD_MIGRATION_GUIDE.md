# Cloud Database Migration Guide

## Overview
This guide will help you migrate your complete local database to Supabase Cloud using the web interface.

## Files Generated
- `schema_export.sql` - Complete database schema (102KB)
- `data_export.sql` - All your application data (46KB)

## Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your "Strat Plan" project
3. Go to the **SQL Editor** in the left sidebar

## Step 2: Apply Database Schema

### Option A: Apply All Migrations (Recommended)
Since you have a proper migration system, let's use that:

1. In your Supabase dashboard, go to **Database > Migrations**
2. Check if any migrations are pending
3. If no migrations exist, we'll manually run them

### Option B: Manual Schema Import
1. In the SQL Editor, create a new query
2. Copy the entire contents of `schema_export.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute

⚠️ **Important**: If you get errors about existing objects, that's normal for a fresh instance.

## Step 3: Import Data

1. In the SQL Editor, create a new query
2. Copy the entire contents of `data_export.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute

⚠️ **Note**: The export warned about circular foreign keys. If you get constraint errors, follow these steps:

### Handle Constraint Errors:
```sql
-- Temporarily disable triggers and constraints
SET session_replication_role = replica;

-- Paste your data_export.sql content here

-- Re-enable triggers and constraints
SET session_replication_role = DEFAULT;
```

## Step 4: Verify Migration

Run these queries to verify your data migrated correctly:

```sql
-- Check users
SELECT COUNT(*) as user_count FROM users;

-- Check municipalities
SELECT COUNT(*) as municipality_count FROM municipalities;

-- Check strategic plans
SELECT COUNT(*) as plan_count FROM strategic_plans;

-- Check objectives  
SELECT COUNT(*) as objective_count FROM strategic_objectives;

-- Check that RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected results:
- At least 1 user (your admin account)
- At least 1 municipality
- Your strategic plans and objectives
- Multiple RLS policies for each table

## Step 5: Test Authentication

1. Go to **Authentication > Users** in Supabase dashboard
2. Verify your admin user exists
3. Test login to your deployed app: https://stratplan.netlify.app

## Step 6: Enable Required Extensions

Make sure these extensions are enabled in **Database > Extensions**:
- [x] uuid-ossp
- [x] pgcrypto
- [x] vector (if using AI features)

## Alternative: CLI Migration (if linking works later)

If you can get the CLI to link to your cloud project:

```bash
# Try linking again (replace with your actual project ref)
supabase link --project-ref evufnjybcejytbsptxmn

# If successful, push all migrations
supabase db push

# Then manually import data via SQL editor
```

## Troubleshooting

### Issue: "relation does not exist" errors
**Solution**: Make sure schema was applied first, then data

### Issue: "duplicate key value violates unique constraint"
**Solution**: The data might already exist. Check if previous import was partially successful

### Issue: RLS policy errors
**Solution**: Make sure you're connected as the service role user or temporarily disable RLS:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Import data
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Issue: Permission denied errors
**Solution**: Make sure you're using the service role key, not the anon key

## Next Steps After Migration

1. **Test the deployed app**: https://stratplan.netlify.app
2. **Run the automated tests**: `node test-deployment.js`
3. **Update local development environment** to use cloud database
4. **Run User Acceptance Testing** as outlined in `UAT_TEST_PLAN.md`

## Expected File Sizes
- schema_export.sql: ~102KB (indicates comprehensive schema)
- data_export.sql: ~46KB (indicates meaningful data exists)

This suggests your local database has substantial data worth migrating.