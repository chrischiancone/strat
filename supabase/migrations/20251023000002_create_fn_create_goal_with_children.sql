-- Function: create_goal_with_children
-- Purpose: Atomically create a goal with nested objectives and deliverables with full authorization checks
-- Run this in a migration

-- Safety: drop if exists (idempotent during development)
DROP FUNCTION IF EXISTS public.create_goal_with_children(
  p_plan_id uuid,
  p_goal_number int,
  p_title text,
  p_description text,
  p_city_priority_alignment text,
  p_objectives jsonb
);

CREATE OR REPLACE FUNCTION public.create_goal_with_children(
  p_plan_id uuid,
  p_goal_number int,
  p_title text,
  p_description text,
  p_city_priority_alignment text,
  p_objectives jsonb -- [{ objective_number, title, description, deliverables: [{ deliverable_number, title, description, target_date }] }]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_user_department uuid;
  v_plan_department uuid;
  v_goal_id uuid;
  v_next_goal_display_order int;
  v_obj jsonb;
  v_del jsonb;
  v_objective_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Fetch requester role and department
  SELECT role, department_id INTO v_user_role, v_user_department
  FROM users WHERE id = v_user_id;

  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Fetch plan department
  SELECT department_id INTO v_plan_department
  FROM strategic_plans WHERE id = p_plan_id;

  IF v_plan_department IS NULL THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;

  -- Authorization: admin, city_manager, or same department
  IF NOT (v_user_role IN ('admin','city_manager') OR v_user_department = v_plan_department) THEN
    RAISE EXCEPTION 'You do not have permission to add goals to this plan';
  END IF;

  -- Enforce max goals = 5
  IF (SELECT COUNT(*) FROM strategic_goals WHERE strategic_plan_id = p_plan_id) >= 5 THEN
    RAISE EXCEPTION 'Cannot add more than 5 goals to a strategic plan';
  END IF;

  -- Next display order for goals
  SELECT COALESCE(MAX(display_order),0)+1 INTO v_next_goal_display_order
  FROM strategic_goals WHERE strategic_plan_id = p_plan_id;

  -- Create goal
  INSERT INTO strategic_goals (
    strategic_plan_id, goal_number, title, description, city_priority_alignment,
    objectives, success_measures, display_order, created_by
  ) VALUES (
    p_plan_id, p_goal_number, p_title, p_description, p_city_priority_alignment,
    '[]'::jsonb, '[]'::jsonb, v_next_goal_display_order, v_user_id
  ) RETURNING id INTO v_goal_id;

  -- Create objectives and deliverables
  IF p_objectives IS NOT NULL THEN
    FOR v_obj IN SELECT * FROM jsonb_array_elements(p_objectives)
    LOOP
      INSERT INTO strategic_objectives (
        strategic_goal_id, objective_number, title, description, display_order, created_by
      ) VALUES (
        v_goal_id,
        COALESCE(v_obj->>'objective_number', 'O'||(
          SELECT COALESCE(MAX(CAST(substring(objective_number from 2) AS int)),0)+1 FROM strategic_objectives WHERE strategic_goal_id = v_goal_id
        )),
        COALESCE(v_obj->>'title',''),
        COALESCE(v_obj->>'description',''),
        (
          SELECT COALESCE(MAX(display_order),0)+1 FROM strategic_objectives WHERE strategic_goal_id = v_goal_id
        ),
        v_user_id
      ) RETURNING id INTO v_objective_id;

      -- Deliverables for this objective
      IF (v_obj ? 'deliverables') THEN
        FOR v_del IN SELECT * FROM jsonb_array_elements(v_obj->'deliverables')
        LOOP
          INSERT INTO strategic_deliverables (
            strategic_objective_id, deliverable_number, title, description, target_date, status, display_order, created_by
          ) VALUES (
            v_objective_id,
            COALESCE(v_del->>'deliverable_number', 'D'||(
              SELECT COALESCE(MAX(CAST(substring(deliverable_number from 2) AS int)),0)+1 FROM strategic_deliverables WHERE strategic_objective_id = v_objective_id
            )),
            COALESCE(v_del->>'title',''),
            COALESCE(v_del->>'description',''),
            CASE WHEN (v_del ? 'target_date') THEN (v_del->>'target_date')::date ELSE NULL END,
            COALESCE(v_del->>'status','not_started'),
            (
              SELECT COALESCE(MAX(display_order),0)+1 FROM strategic_deliverables WHERE strategic_objective_id = v_objective_id
            ),
            v_user_id
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_goal_id;
END;
$$;

-- Restrict execution to authenticated users
REVOKE ALL ON FUNCTION public.create_goal_with_children(uuid,int,text,text,text,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_goal_with_children(uuid,int,text,text,text,jsonb) TO authenticated;
