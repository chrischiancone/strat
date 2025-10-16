-- Fix comments insert policy to allow users to comment on entities they can access

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS comments_insert ON comments;

-- Create a new policy that allows commenting on accessible entities
CREATE POLICY comments_insert ON comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND (
            -- Can comment on strategic plans you can access
            (entity_type = 'strategic_plan' AND EXISTS (
                SELECT 1 FROM strategic_plans sp
                JOIN departments d ON sp.department_id = d.id
                WHERE sp.id = entity_id
                AND d.municipality_id = public.user_municipality_id()
            ))
            OR 
            -- Can comment on initiatives you can access
            (entity_type = 'initiative' AND EXISTS (
                SELECT 1 FROM initiatives i
                JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE i.id = entity_id
                AND d.municipality_id = public.user_municipality_id()
            ))
            OR 
            -- Can comment on goals you can access
            (entity_type = 'goal' AND EXISTS (
                SELECT 1 FROM strategic_goals sg
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE sg.id = entity_id
                AND d.municipality_id = public.user_municipality_id()
            ))
            OR
            -- Can comment on milestones you can access (mapped from dashboard resourceType)
            (entity_type = 'milestone' AND EXISTS (
                SELECT 1 FROM quarterly_milestones qm
                JOIN initiatives i ON qm.initiative_id = i.id
                JOIN strategic_goals sg ON i.strategic_goal_id = sg.id
                JOIN strategic_plans sp ON sg.strategic_plan_id = sp.id
                JOIN departments d ON sp.department_id = d.id
                WHERE qm.id = entity_id
                AND d.municipality_id = public.user_municipality_id()
            ))
        )
    );