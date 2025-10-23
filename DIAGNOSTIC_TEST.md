# Diagnostic Test for Objectives & Deliverables

## Step 1: Check if Tables Exist

Run this in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('strategic_objectives', 'strategic_deliverables');
```

**Expected Result**: You should see both tables listed.

---

## Step 2: Check RLS Policies

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('strategic_objectives', 'strategic_deliverables')
ORDER BY tablename, policyname;
```

**Expected Result**: You should see policies for SELECT, INSERT, UPDATE, DELETE on both tables.

---

## Step 3: Test Direct Insert (Bypass RLS)

First, get a valid goal ID and user ID:

```sql
-- Get a strategic goal ID
SELECT id, title FROM strategic_goals LIMIT 1;

-- Get your user ID
SELECT id, email, role, department_id FROM users WHERE email = 'your-email@example.com';
```

Then try to insert an objective directly (as admin, bypassing RLS temporarily):

```sql
-- Disable RLS temporarily for testing
ALTER TABLE strategic_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_deliverables DISABLE ROW LEVEL SECURITY;

-- Try to insert
INSERT INTO strategic_objectives (
    strategic_goal_id,
    objective_number,
    title,
    description,
    display_order,
    created_by
) VALUES (
    'YOUR_GOAL_ID_HERE',  -- Replace with actual goal ID
    'O1',
    'Test Objective',
    'Test Description',
    1,
    'YOUR_USER_ID_HERE'  -- Replace with actual user ID
) RETURNING *;

-- If that worked, try a deliverable
INSERT INTO strategic_deliverables (
    strategic_objective_id,
    deliverable_number,
    title,
    description,
    display_order,
    created_by
) 
SELECT 
    id,
    'D1',
    'Test Deliverable',
    'Test Description',
    1,
    'YOUR_USER_ID_HERE'  -- Replace with actual user ID
FROM strategic_objectives 
WHERE objective_number = 'O1' 
LIMIT 1
RETURNING *;

-- Re-enable RLS
ALTER TABLE strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_deliverables ENABLE ROW LEVEL SECURITY;
```

---

## Step 4: Check Browser Console

Open your browser console (F12 or Cmd+Option+I) and look for:

1. **Red errors** - These indicate what's failing
2. **Console.log messages** - The updated form now logs each step
3. **Network tab** - Check for failed API calls (look for 4xx or 5xx status codes)

Common errors to look for:
- `permission denied for table strategic_objectives`
- `null value in column "created_by" violates not-null constraint`
- `Could not find the table 'strategic_objectives'`

---

## Step 5: Test with Logging

Try creating a goal and check the console output. You should see:

```
Creating objectives for goal: [some-uuid]
Valid objectives: [array of objectives]
Creating objective: O1 [title]
Objective created with ID: [some-uuid]
Creating deliverables for objective: [some-uuid] 1
Creating deliverable: D1 [title]
Deliverable created successfully
All objectives and deliverables created successfully
```

If the logging stops somewhere, that's where the error is occurring.

---

## Common Issues and Fixes

### Issue 1: RLS Permission Denied

**Symptom**: Error mentions "permission denied" or "RLS policy"

**Fix**: Check that your user has the correct role and department_id:

```sql
-- Check your user
SELECT id, email, role, department_id FROM users WHERE id = auth.uid();

-- Check the plan's department
SELECT sp.id, sp.department_id, d.name as department_name
FROM strategic_plans sp
JOIN departments d ON sp.department_id = d.id
WHERE sp.id = 'YOUR_PLAN_ID';

-- Make sure they match or you're admin/city_manager
```

### Issue 2: Created_by is NULL

**Symptom**: Error about `created_by` column

**Fix**: The `auth.uid()` might not be working. Check:

```sql
SELECT auth.uid();  -- Should return your user ID, not NULL
```

### Issue 3: Foreign Key Violation

**Symptom**: Error about "violates foreign key constraint"

**Fix**: Make sure the goal ID exists:

```sql
SELECT id FROM strategic_goals WHERE id = 'YOUR_GOAL_ID';
```

---

## Quick Fix: Temporary Simplified RLS

If RLS is the issue, you can temporarily simplify the policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS strategic_objectives_select_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_insert_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_update_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_delete_policy ON strategic_objectives;

DROP POLICY IF EXISTS strategic_deliverables_select_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_insert_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_update_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_delete_policy ON strategic_deliverables;

-- Create simplified policies (AUTHENTICATED USERS CAN DO EVERYTHING)
-- WARNING: Only for testing! Remove in production!
CREATE POLICY strategic_objectives_all_policy ON strategic_objectives
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY strategic_deliverables_all_policy ON strategic_deliverables
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
```

After testing, re-apply the proper policies from the migration file.
