# Comment Error Fix

## Problem
You're getting an "Error posting comment" because:
1. The database tables were created but with the wrong column names
2. The `comments` table needs `entity_id` and `entity_type` columns (not `resource_id`/`resource_type`)
3. The `activity_log` table might be missing

## Quick Fix

### Option 1: Drop and Recreate Tables (Recommended if no data yet)

Run this in your Supabase SQL Editor:

```sql
-- Drop existing tables
DROP TABLE IF EXISTS live_edits CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS collaboration_sessions CASCADE;

-- Then run the updated COLLABORATION_TABLES_SETUP.sql script
-- (The file has been updated with the correct schema)
```

### Option 2: Alter Existing Tables (If you have data to preserve)

Run this in your Supabase SQL Editor:

```sql
-- Fix comments table
ALTER TABLE comments RENAME COLUMN resource_id TO entity_id;
ALTER TABLE comments RENAME COLUMN resource_type TO entity_type;
ALTER TABLE comments RENAME COLUMN parent_id TO parent_comment_id;
ALTER TABLE comments RENAME COLUMN resolved TO is_resolved;

-- Drop old indexes
DROP INDEX IF EXISTS comments_resource_idx;
DROP INDEX IF EXISTS comments_parent_idx;
DROP INDEX IF EXISTS comments_resolved_idx;

-- Create new indexes
CREATE INDEX comments_resource_idx ON comments(entity_id, entity_type);
CREATE INDEX comments_parent_idx ON comments(parent_comment_id);
CREATE INDEX comments_resolved_idx ON comments(is_resolved);

-- Rename activity_feed to activity_log (if it exists)
ALTER TABLE IF EXISTS activity_feed RENAME TO activity_log;

-- If activity_log doesn't exist, create it
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID,
    resource_type TEXT,
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_user_idx ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_resource_idx ON activity_log(resource_id, resource_type);
CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log(created_at DESC);
```

## After Running the Fix

1. **Restart your development server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear your browser cache**
   - Do a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. **Test commenting**
   - Log in to your application
   - Navigate to a strategic plan
   - Click "Edit Plan"
   - Open the collaboration sidebar
   - Try posting a comment

## What Changed

The updated `COLLABORATION_TABLES_SETUP.sql` file now has the correct schema that matches what the application code expects:

- ✅ `comments.entity_id` instead of `resource_id`
- ✅ `comments.entity_type` instead of `resource_type`
- ✅ `comments.parent_comment_id` instead of `parent_id`
- ✅ `comments.is_resolved` instead of `resolved`
- ✅ `activity_log` table instead of `activity_feed`

## Still Having Issues?

If you still get errors after applying this fix:

1. **Check browser console**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for specific error messages
   - Share them for further assistance

2. **Verify tables exist**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
       'collaboration_sessions',
       'comments',
       'notifications',
       'activity_log',
       'live_edits'
   );
   ```
   All 5 tables should be listed.

3. **Check column names**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'comments' 
   ORDER BY ordinal_position;
   ```
   You should see `entity_id`, `entity_type`, `parent_comment_id`, and `is_resolved`.
