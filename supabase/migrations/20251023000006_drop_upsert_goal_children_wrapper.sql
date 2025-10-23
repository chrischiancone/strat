-- Drop the 2-arg overload to avoid PostgREST ambiguity
DROP FUNCTION IF EXISTS public.upsert_goal_children(p_goal_id uuid, p_objectives jsonb);