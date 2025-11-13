# Collaboration Feature Fix Guide

## Problem
The collaboration system is not working because the required database tables don't exist. When City Managers, Directors, and Staff try to collaborate on strategic plans, the system fails to create collaboration sessions.

## Solution
You need to create the collaboration system database tables.

## Steps to Fix

### Step 1: Run the SQL Script

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open the file: `COLLABORATION_TABLES_SETUP.sql` (in the root of your project)
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor

4. **Run the Script**
   - Click the "Run" button (or press Cmd+Enter on Mac)
   - Wait for the success message

### Step 2: Verify Tables Were Created

In the Supabase SQL Editor, run this query:

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

You should see all 5 tables listed.

### Step 3: Test the Collaboration Feature

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Log in as a Department Director**
   - Navigate to a strategic plan
   - Click "Edit Plan"

3. **Check for the Collaboration Sidebar**
   - You should see a "Collaborate" button in the top right
   - Click it to open the collaboration sidebar
   - You should see tabs for Comments, Alerts, and Activity

4. **Test Multi-User Collaboration** (if you have multiple test accounts)
   - Open the same plan in two different browsers (or incognito mode)
   - Log in as different users
   - You should see each other's presence indicators
   - Try adding comments

## What the Tables Do

### 1. **collaboration_sessions**
- Tracks active editing sessions
- Shows who is currently working on a plan
- Manages real-time presence

### 2. **comments**
- Stores comments and discussions
- Supports threaded conversations
- Allows mentioning other users
- Can be resolved when addressed

### 3. **notifications**
- Alerts users about mentions, comments, and updates
- Prioritizes important notifications
- Tracks read/unread status

### 4. **activity_log**
- Shows history of changes
- Tracks who did what and when
- Provides audit trail

### 5. **live_edits**
- Enables real-time collaborative editing
- Tracks individual edit operations
- Helps prevent conflicting changes

## Expected Behavior After Fix

### For Department Directors
- Can edit their strategic plan
- See when City Manager or Staff are viewing
- Leave comments and feedback
- Get notified of City Manager requests

### For City Managers
- Can view all department plans
- See who is working on each plan
- Leave comments and suggestions
- Request changes or approve sections

### For Staff Members
- Can assist Directors with plan creation
- See Director's edits in real-time
- Add comments and suggestions
- Collaborate on specific sections

## Troubleshooting

### If you still see errors after running the SQL:

1. **Check for user.full_name column**
   The collaboration system expects users to have a `full_name` column. If you don't have this, run:
   
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
   UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, email) WHERE full_name IS NULL;
   ```

2. **Check for user.avatar_url column**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
   ```

3. **Clear your browser cache**
   - Sometimes old JavaScript is cached
   - Do a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

4. **Check browser console for errors**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any error messages
   - Share them if you need more help

## Row Level Security (Future Enhancement)

The tables are created without RLS enabled for now. Once collaboration is working, you may want to add security policies:

```sql
-- Enable RLS
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_edits ENABLE ROW LEVEL SECURITY;

-- Example policy for comments (users can read comments on resources they have access to)
CREATE POLICY "Users can read comments on accessible resources"
ON comments FOR SELECT
USING (
    resource_id IN (
        SELECT id FROM strategic_plans WHERE department_id IN (
            SELECT id FROM departments WHERE municipality_id = (
                SELECT municipality_id FROM users WHERE id = auth.uid()
            )
        )
    )
);
```

## Need Help?

If you're still experiencing issues:
1. Share the exact error message from the browser console
2. Share the output of the verification query from Step 2
3. Let me know what role you're logged in as (Director, City Manager, Staff)
