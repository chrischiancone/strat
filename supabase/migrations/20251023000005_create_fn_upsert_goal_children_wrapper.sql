-- Wrapper overload for upsert_goal_children with two parameters
DROP FUNCTION IF EXISTS public.upsert_goal_children(p_goal_id uuid, p_objectives jsonb);
CREATE OR REPLACE FUNCTION public.upsert_goal_children(
  p_goal_id uuid,
  p_objectives jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.upsert_goal_children(p_goal_id, p_objectives, false);
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_goal_children(uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.upsert_goal_children(uuid, jsonb) TO authenticated;