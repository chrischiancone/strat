-- Function: upsert_goal_children
-- Atomically upsert objectives and deliverables for a goal with auth checks

DROP FUNCTION IF EXISTS public.upsert_goal_children(
  p_goal_id uuid,
  p_objectives jsonb,
  p_delete_missing boolean
);

CREATE OR REPLACE FUNCTION public.upsert_goal_children(
  p_goal_id uuid,
  p_objectives jsonb, -- [{ objective_number, title, description, deliverables: [{ deliverable_number, title, description, target_date, status }] }]
  p_delete_missing boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_role text;
  v_user_department uuid;
  v_plan_department uuid;
  v_goal_plan uuid;
  v_obj jsonb;
  v_del jsonb;
  v_objective_id uuid;
  v_input_obj_numbers text[] := ARRAY[]::text[];
  v_input_del_numbers text[];
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

  -- Check goal and plan
  SELECT strategic_plan_id INTO v_goal_plan FROM strategic_goals WHERE id = p_goal_id;
  IF v_goal_plan IS NULL THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  SELECT department_id INTO v_plan_department FROM strategic_plans WHERE id = v_goal_plan;

  -- Authorization: admin, city_manager, or same department
  IF NOT (v_user_role IN ('admin','city_manager') OR v_user_department = v_plan_department) THEN
    RAISE EXCEPTION 'You do not have permission to update this goal';
  END IF;

  -- Upsert each objective
  IF p_objectives IS NOT NULL THEN
    FOR v_obj IN SELECT * FROM jsonb_array_elements(p_objectives)
    LOOP
      v_input_obj_numbers := array_append(v_input_obj_numbers, v_obj->>'objective_number');

      -- Upsert objective by (goal_id, objective_number)
      INSERT INTO strategic_objectives (
        strategic_goal_id, objective_number, title, description, display_order, created_by
      ) VALUES (
        p_goal_id,
        v_obj->>'objective_number',
        COALESCE(v_obj->>'title',''),
        COALESCE(v_obj->>'description',''),
        (
          SELECT COALESCE(MAX(display_order),0)+1 FROM strategic_objectives WHERE strategic_goal_id = p_goal_id
        ),
        v_user_id
      )
      ON CONFLICT (strategic_goal_id, objective_number)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = NOW()
      RETURNING id INTO v_objective_id;

      -- Deliverables for this objective
      v_input_del_numbers := ARRAY[]::text[];
      IF (v_obj ? 'deliverables') THEN
        FOR v_del IN SELECT * FROM jsonb_array_elements(v_obj->'deliverables')
        LOOP
          v_input_del_numbers := array_append(v_input_del_numbers, v_del->>'deliverable_number');

          INSERT INTO strategic_deliverables (
            strategic_objective_id, deliverable_number, title, description, target_date, status, display_order, created_by
          ) VALUES (
            v_objective_id,
            v_del->>'deliverable_number',
            COALESCE(v_del->>'title',''),
            COALESCE(v_del->>'description',''),
            CASE WHEN (v_del ? 'target_date') THEN (v_del->>'target_date')::date ELSE NULL END,
            COALESCE(v_del->>'status','not_started'),
            (
              SELECT COALESCE(MAX(display_order),0)+1 FROM strategic_deliverables WHERE strategic_objective_id = v_objective_id
            ),
            v_user_id
          )
          ON CONFLICT (strategic_objective_id, deliverable_number)
          DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            target_date = EXCLUDED.target_date,
            status = EXCLUDED.status,
            updated_at = NOW();
        END LOOP;
      END IF;

      -- Optionally delete deliverables not in payload
      IF p_delete_missing THEN
        DELETE FROM strategic_deliverables sd
        WHERE sd.strategic_objective_id = v_objective_id
          AND (v_input_del_numbers IS NULL OR NOT (sd.deliverable_number = ANY(v_input_del_numbers)));
      END IF;
    END LOOP;
  END IF;

  -- Optionally delete objectives not in payload
  IF p_delete_missing THEN
    DELETE FROM strategic_objectives so
    WHERE so.strategic_goal_id = p_goal_id
      AND (v_input_obj_numbers IS NULL OR NOT (so.objective_number = ANY(v_input_obj_numbers)));
  END IF;

END;
$$;

REVOKE ALL ON FUNCTION public.upsert_goal_children(uuid, jsonb, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.upsert_goal_children(uuid, jsonb, boolean) TO authenticated;
