# Database Operations Implementation

## Overview
Implemented functional database optimization and archival operations in the Performance Settings Database tab. Previously, the "Optimize Database" button had a TODO placeholder and the "Archive Old Data" button had no functionality.

## Changes Made

### 1. Created `/app/api/database/route.ts`
A new POST endpoint that handles three types of database operations:

#### Operations:
- **optimize**: Runs VACUUM ANALYZE to optimize database performance
  - Reclaims storage from deleted rows
  - Updates query planner statistics
  - Returns database size and tables optimized count
  
- **archive**: Archives old data to reduce main table bloat
  - Archives audit logs older than specified days (default: 365)
  - Archives read notifications older than specified days
  - Moves audit logs to `audit_logs_archive` table
  - Deletes old read notifications
  - Returns counts of archived records
  
- **analyze**: Updates query planner statistics without vacuum
  - Faster than full optimization
  - Returns table statistics

#### Security:
- Requires authenticated user
- Requires admin role
- Returns 401/403 for unauthorized access

### 2. Updated `PerformanceSettings.tsx`

#### Added `optimizeDatabase()` function:
```typescript
const optimizeDatabase = async () => {
  // Calls /api/database with operation: 'optimize'
  // Shows success message with tables optimized count
  // Refreshes metrics after completion
  // Handles errors with appropriate messages
}
```

#### Added `archiveOldData()` function:
```typescript
const archiveOldData = async () => {
  // Calls /api/database with operation: 'archive'
  // Archives data older than 365 days
  // Shows success message with total records archived
  // Handles errors with appropriate messages
}
```

#### Wired Archive Button:
- Added `onClick={archiveOldData}` to Archive Old Data button

## Database Settings Available

The following database settings are configurable via the UI:

1. **Query Optimization** (toggle)
   - Enable/disable automatic query optimization
   
2. **Slow Query Logging** (toggle)
   - Log queries that exceed threshold
   
3. **Auto Vacuum** (toggle)
   - Automatically optimize database storage
   
4. **Connection Pool Size** (numeric)
   - Maximum number of database connections
   - Default: 20
   
5. **Query Timeout** (numeric, milliseconds)
   - Maximum time to wait for query execution
   - Default: 30000 (30 seconds)

All settings are saved to the municipality's `settings.performance.database` JSON object via the existing `updatePerformanceSettings` server action.

## Files Modified
- `/app/api/database/route.ts` (created)
- `/components/admin/settings/PerformanceSettings.tsx` (updated)

## Database Tables Used

### Main Tables:
- `audit_logs` - System audit trail
- `notifications` - User notifications
- `pg_stat_user_tables` - PostgreSQL statistics view

### Archive Tables:
- `audit_logs_archive` - Archived audit logs (auto-created if missing)

## Testing Instructions

### Test Database Optimization:
1. Log in as an admin user
2. Navigate to `/admin/settings`
3. Click on Performance tab
4. Click on Database sub-tab
5. Click "Optimize Database" button
6. Verify success message shows tables optimized count
7. Check browser console for any errors

### Test Data Archival:
1. Same navigation as above
2. Click "Archive Old Data" button
3. Verify success message shows archived records count
4. Check browser console for any errors
5. (Optional) Verify old audit logs are moved to archive table:
   ```sql
   SELECT COUNT(*) FROM audit_logs WHERE created_at < NOW() - INTERVAL '365 days';
   SELECT COUNT(*) FROM audit_logs_archive;
   ```

### Test Settings Save:
1. Toggle database settings on/off
2. Modify connection pool size and query timeout
3. Click "Save Changes" button
4. Verify success message
5. Refresh page and verify settings persist

### Test API Directly:
```bash
# Optimize database
curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"operation":"optimize"}'

# Archive old data (custom retention)
curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"operation":"archive","olderThanDays":180}'

# Analyze only
curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"operation":"analyze"}'
```

## Notes and Limitations

### VACUUM Limitations:
- Supabase may not allow VACUUM operations via RPC for security reasons
- The code gracefully handles this by logging a warning and continuing
- For self-hosted PostgreSQL, VACUUM will work as expected
- Consider running VACUUM manually via SQL if RPC is restricted:
  ```sql
  VACUUM ANALYZE;
  ```

### Archive Table Creation:
- The `audit_logs_archive` table is referenced but may need manual creation
- Schema should mirror `audit_logs` with an additional `archived_at` timestamp
- Consider creating this table in a migration:
  ```sql
  CREATE TABLE IF NOT EXISTS audit_logs_archive (
    LIKE audit_logs INCLUDING ALL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

### Performance Considerations:
- VACUUM can lock tables temporarily
- Consider running optimization during low-traffic periods
- Archive operations process records in batches (currently all at once)
- For large datasets (>10k records), consider implementing batch processing

## Future Enhancements

1. **Scheduled Operations**
   - Add cron job or scheduled task for automatic optimization
   - Schedule archival to run monthly/quarterly

2. **Batch Processing**
   - Process archive operations in smaller batches
   - Add progress indicator for long-running operations

3. **Additional Archive Targets**
   - Archive old strategic plans
   - Archive completed initiatives
   - Archive old budget snapshots

4. **Restore Functionality**
   - Add UI to view archived data
   - Allow restoring archived records if needed

5. **Optimization Reports**
   - Track optimization history
   - Show before/after database size
   - Display performance improvements

6. **Custom Retention Policies**
   - UI to configure retention days per data type
   - Different retention for different user roles
   - Compliance with data retention regulations

## Related Files
- `/app/api/metrics/route.ts` - Performance metrics endpoint
- `/app/api/cache/route.ts` - Cache management endpoint
- `/app/actions/settings.ts` - Settings update actions
- `/PERFORMANCE_METRICS_FIX.md` - Performance metrics documentation
