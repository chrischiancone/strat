-- Sync any auth.users that don't have a corresponding public.users record
-- This handles cases where users are created directly in Supabase Auth dashboard

DO $$
DECLARE
  v_municipality_id UUID;
  v_dept_it_id UUID;
  v_auth_user RECORD;
BEGIN
  -- Get municipality ID
  SELECT id INTO v_municipality_id FROM municipalities LIMIT 1;

  -- Get IT department ID (default department for synced users)
  SELECT id INTO v_dept_it_id FROM departments WHERE slug = 'information-technology' LIMIT 1;

  -- Only proceed if municipality exists
  IF v_municipality_id IS NOT NULL THEN

    -- Loop through auth users that don't have a public.users record
    FOR v_auth_user IN
      SELECT au.id, au.email, au.raw_user_meta_data
      FROM auth.users au
      LEFT JOIN public.users pu ON au.id = pu.id
      WHERE pu.id IS NULL
      AND au.email IS NOT NULL
    LOOP
      -- Insert user record
      INSERT INTO public.users (
        id,
        municipality_id,
        full_name,
        email,
        role,
        title,
        is_active,
        department_id
      )
      VALUES (
        v_auth_user.id,
        v_municipality_id,
        COALESCE(
          v_auth_user.raw_user_meta_data->>'full_name',
          split_part(v_auth_user.email, '@', 1)
        ),
        v_auth_user.email,
        'admin', -- Default to admin role for manually created users
        'System Administrator',
        true,
        v_dept_it_id
      )
      ON CONFLICT (id) DO NOTHING;

      RAISE NOTICE 'Synced auth user % to public.users', v_auth_user.email;
    END LOOP;

  END IF;
END $$;
