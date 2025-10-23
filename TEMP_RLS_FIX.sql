-- TEMPORARY FIX: Simplified RLS Policies for Objectives and Deliverables
-- This will help us test if RLS is the issue
-- Run this in Supabase SQL Editor

-- First, check current policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('strategic_objectives', 'strategic_deliverables')
ORDER BY tablename, policyname;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS strategic_objectives_select_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_insert_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_update_policy ON strategic_objectives;
DROP POLICY IF EXISTS strategic_objectives_delete_policy ON strategic_objectives;

DROP POLICY IF EXISTS strategic_deliverables_select_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_insert_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_update_policy ON strategic_deliverables;
DROP POLICY IF EXISTS strategic_deliverables_delete_policy ON strategic_deliverables;

-- Create simplified policies (any authenticated user can access)
-- WARNING: Only for testing! This allows all authenticated users full access

-- Strategic Objectives
CREATE POLICY strategic_objectives_select_policy ON strategic_objectives
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY strategic_objectives_insert_policy ON strategic_objectives
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY strategic_objectives_update_policy ON strategic_objectives
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY strategic_objectives_delete_policy ON strategic_objectives
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Strategic Deliverables
CREATE POLICY strategic_deliverables_select_policy ON strategic_deliverables
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY strategic_deliverables_insert_policy ON strategic_deliverables
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY strategic_deliverables_update_policy ON strategic_deliverables
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY strategic_deliverables_delete_policy ON strategic_deliverables
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Verify new policies were created
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('strategic_objectives', 'strategic_deliverables')
ORDER BY tablename, policyname;
