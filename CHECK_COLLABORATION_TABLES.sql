-- Run this in Supabase SQL Editor to check your collaboration tables

-- 1. Check which tables exist
SELECT 'Tables that exist:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'collaboration_sessions',
    'comments',
    'notifications',
    'activity_log',
    'live_edits'
)
ORDER BY table_name;

-- 2. Check comments table columns
SELECT '
' as spacer;
SELECT 'Comments table columns:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' 
ORDER BY ordinal_position;

-- 3. Check for the specific columns we need
SELECT '
' as spacer;
SELECT 'Checking for required columns:' as check_type;
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'entity_id') 
        THEN '✅ entity_id exists' 
        ELSE '❌ entity_id MISSING (should be entity_id not resource_id)' 
    END as entity_id_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'entity_type') 
        THEN '✅ entity_type exists' 
        ELSE '❌ entity_type MISSING (should be entity_type not resource_type)' 
    END as entity_type_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') 
        THEN '✅ parent_comment_id exists' 
        ELSE '❌ parent_comment_id MISSING (should be parent_comment_id not parent_id)' 
    END as parent_comment_id_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_resolved') 
        THEN '✅ is_resolved exists' 
        ELSE '❌ is_resolved MISSING (should be is_resolved not resolved)' 
    END as is_resolved_check;

-- 4. Check activity_log table exists
SELECT '
' as spacer;
SELECT 'Activity log table:' as check_type;
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log') 
        THEN '✅ activity_log table exists' 
        ELSE '❌ activity_log MISSING - should exist (not activity_feed)' 
    END as activity_log_check;

-- 5. Test if we can query comments
SELECT '
' as spacer;
SELECT 'Test query:' as check_type;
SELECT COUNT(*) as comment_count FROM comments;
