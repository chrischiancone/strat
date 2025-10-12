-- Fix infinite recursion in initiatives RLS policies
-- The issue is likely that the policies are referencing related tables that also have RLS

-- Drop existing policies on initiatives
DROP POLICY IF EXISTS "initiatives_select_policy" ON public.initiatives;
DROP POLICY IF EXISTS "initiatives_insert_policy" ON public.initiatives;
DROP POLICY IF EXISTS "initiatives_update_policy" ON public.initiatives;
DROP POLICY IF EXISTS "initiatives_delete_policy" ON public.initiatives;

-- Recreate policies with simpler logic to avoid recursion
-- SELECT: Users can view initiatives for plans in their municipality
CREATE POLICY "initiatives_select_policy" ON public.initiatives
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.strategic_goals sg
      JOIN public.strategic_plans sp ON sg.strategic_plan_id = sp.id
      JOIN public.departments d ON sp.department_id = d.id
      WHERE sg.id = initiatives.strategic_goal_id
        AND d.municipality_id = public.user_municipality_id()
    )
  );

-- INSERT: Department directors and admins can create initiatives for their plans
CREATE POLICY "initiatives_insert_policy" ON public.initiatives
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin_or_manager()
    AND EXISTS (
      SELECT 1
      FROM public.strategic_goals sg
      JOIN public.strategic_plans sp ON sg.strategic_plan_id = sp.id
      JOIN public.departments d ON sp.department_id = d.id
      WHERE sg.id = initiatives.strategic_goal_id
        AND d.municipality_id = public.user_municipality_id()
    )
  );

-- UPDATE: Department directors and admins can update initiatives for their plans
CREATE POLICY "initiatives_update_policy" ON public.initiatives
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_manager()
    AND EXISTS (
      SELECT 1
      FROM public.strategic_goals sg
      JOIN public.strategic_plans sp ON sg.strategic_plan_id = sp.id
      JOIN public.departments d ON sp.department_id = d.id
      WHERE sg.id = initiatives.strategic_goal_id
        AND d.municipality_id = public.user_municipality_id()
    )
  )
  WITH CHECK (
    public.is_admin_or_manager()
    AND EXISTS (
      SELECT 1
      FROM public.strategic_goals sg
      JOIN public.strategic_plans sp ON sg.strategic_plan_id = sp.id
      JOIN public.departments d ON sp.department_id = d.id
      WHERE sg.id = initiatives.strategic_goal_id
        AND d.municipality_id = public.user_municipality_id()
    )
  );

-- DELETE: Department directors and admins can delete initiatives for their plans
CREATE POLICY "initiatives_delete_policy" ON public.initiatives
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin_or_manager()
    AND EXISTS (
      SELECT 1
      FROM public.strategic_goals sg
      JOIN public.strategic_plans sp ON sg.strategic_plan_id = sp.id
      JOIN public.departments d ON sp.department_id = d.id
      WHERE sg.id = initiatives.strategic_goal_id
        AND d.municipality_id = public.user_municipality_id()
    )
  );
