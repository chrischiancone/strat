-- Fix Helper Functions to Properly Bypass RLS
-- The SECURITY DEFINER functions need to explicitly access the table
-- Using CREATE OR REPLACE to avoid dropping dependencies

CREATE OR REPLACE FUNCTION public.user_municipality_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_municipality_id UUID;
BEGIN
  SELECT municipality_id INTO v_municipality_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_municipality_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_department_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_department_id UUID;
BEGIN
  SELECT department_id INTO v_department_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_department_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_role IN ('admin', 'city_manager', 'department_director');
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_municipality_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO authenticated;
