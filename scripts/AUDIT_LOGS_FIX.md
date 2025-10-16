# Audit Logs Not Populating - Fix Guide

## Problem
Audit logs are not being populated when users make changes in the system.

## Root Cause
The database triggers that automatically create audit log entries may not be installed or may have been dropped during a migration.

## Solution

### Option 1: Run the Verification Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Verification Script**
   - Open the file: `scripts/verify-audit-triggers.sql`
   - Copy the entire contents
   - Paste it into the Supabase SQL Editor
   - Click "Run" (or press Cmd+Enter / Ctrl+Enter)

3. **Review the Results**
   The script will:
   - ✅ Check if audit_logs table exists
   - ✅ Show current audit log count
   - ✅ List installed triggers
   - ✅ Identify missing triggers
   - ✅ Install the audit_trigger_function
   - ✅ Install triggers on all critical tables
   - ✅ Verify installation

4. **Test the Fix**
   After running the script:
   - Make a change in the system (e.g., edit a strategic plan or initiative)
   - Go to Admin → Audit Logs
   - You should now see audit log entries

### Option 2: Use the Test API Endpoint

1. **Visit the Test Endpoint**
   - While logged in as an admin, navigate to: `/api/test-audit`
   - This will show:
     - Current audit log count
     - Whether triggers are installed
     - Result of a test insert

2. **Analyze the Results**
   - If `auditLogCreated: false`, triggers are not working
   - If `triggers: "Unable to query triggers"`, you don't have RPC access
   - Follow Option 1 to install triggers manually

### Option 3: Run Migration Manually

If you have access to the database CLI:

```bash
# Apply the comprehensive audit triggers migration
npx supabase db push
```

## What the Fix Does

The script:

1. **Creates/Updates the Trigger Function**
   - Installs `audit_trigger_function()` that captures:
     - Table name
     - Record ID
     - Action (insert/update/delete)
     - Old and new values
     - User who made the change
     - Timestamp

2. **Installs Triggers on Critical Tables**
   - strategic_plans
   - initiatives
   - initiative_budgets
   - strategic_goals
   - municipalities
   - departments
   - fiscal_years
   - users
   - comments
   - council_goals
   - ai_analyses

3. **Sets Up Automatic Tracking**
   - All future INSERT, UPDATE, and DELETE operations on these tables will automatically create audit log entries

## Verification

After applying the fix:

1. **Check Audit Logs Count**
   ```sql
   SELECT COUNT(*) FROM audit_logs;
   ```

2. **Make a Test Change**
   - Edit any strategic plan, goal, or initiative
   - Check audit logs again - count should increase

3. **View Recent Audit Logs**
   ```sql
   SELECT 
     table_name,
     action,
     changed_at,
     u.email as changed_by_email
   FROM audit_logs al
   LEFT JOIN users u ON al.changed_by = u.id
   ORDER BY changed_at DESC
   LIMIT 10;
   ```

## Troubleshooting

### No Audit Logs After Fix
- Ensure you're logged in when making changes
- Check that `auth.uid()` returns a valid user ID
- Verify RLS policies allow reading audit_logs

### Permission Errors
- Make sure you have admin or city_manager role
- Check RLS policies on audit_logs table

### Triggers Not Installing
- Check for syntax errors in the SQL output
- Ensure all referenced tables exist
- Try dropping and recreating triggers manually

## Support

If you continue to experience issues:

1. Check the browser console for errors
2. Check server logs for database errors
3. Verify Supabase connection is working
4. Contact support with the output from `/api/test-audit`
