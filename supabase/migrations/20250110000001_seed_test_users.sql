-- Seed test users for development
-- This migration can be rolled back in production

-- First create auth users, then public user profiles
DO $$
DECLARE
  v_municipality_id UUID;
  v_dept_it_id UUID;
  v_dept_parks_id UUID;
  v_dept_wfs_id UUID;
BEGIN
  -- Get municipality ID
  SELECT id INTO v_municipality_id FROM municipalities LIMIT 1;

  -- Get department IDs
  SELECT id INTO v_dept_it_id FROM departments WHERE slug = 'information-technology' LIMIT 1;
  SELECT id INTO v_dept_parks_id FROM departments WHERE slug = 'parks-recreation' LIMIT 1;
  SELECT id INTO v_dept_wfs_id FROM departments WHERE slug = 'water-field-services' LIMIT 1;

  -- Only proceed if municipality exists
  IF v_municipality_id IS NOT NULL THEN

    -- Create auth.users entries first (minimal required fields)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES
      ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'john.smith@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah.johnson@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mike.davis@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emily.wilson@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'robert.garcia@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'linda.martinez@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'david.lee@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
      ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'former@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
    ON CONFLICT (id) DO NOTHING;

    -- Now create public.users profiles
    -- Admin user
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000001',
        v_municipality_id,
        'System Administrator',
        'admin@carrollton.gov',
        'admin',
        'IT Director',
        true,
        v_dept_it_id
      )
    ON CONFLICT (id) DO NOTHING;

    -- Department Directors
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000002',
        v_municipality_id,
        'John Smith',
        'john.smith@carrollton.gov',
        'department_director',
        'Director of Parks & Recreation',
        true,
        v_dept_parks_id
      ),
      (
        '00000000-0000-0000-0000-000000000003',
        v_municipality_id,
        'Sarah Johnson',
        'sarah.johnson@carrollton.gov',
        'department_director',
        'Director of Water & Field Services',
        true,
        v_dept_wfs_id
      )
    ON CONFLICT (id) DO NOTHING;

    -- Staff members
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000004',
        v_municipality_id,
        'Mike Davis',
        'mike.davis@carrollton.gov',
        'staff',
        'Program Coordinator',
        true,
        v_dept_parks_id
      ),
      (
        '00000000-0000-0000-0000-000000000005',
        v_municipality_id,
        'Emily Wilson',
        'emily.wilson@carrollton.gov',
        'staff',
        'Budget Analyst',
        true,
        v_dept_wfs_id
      ),
      (
        '00000000-0000-0000-0000-000000000006',
        v_municipality_id,
        'Robert Garcia',
        'robert.garcia@carrollton.gov',
        'staff',
        'IT Support Specialist',
        true,
        v_dept_it_id
      )
    ON CONFLICT (id) DO NOTHING;

    -- City Manager
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000007',
        v_municipality_id,
        'Linda Martinez',
        'linda.martinez@carrollton.gov',
        'city_manager',
        'City Manager',
        true,
        NULL
      )
    ON CONFLICT (id) DO NOTHING;

    -- Finance
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000008',
        v_municipality_id,
        'David Lee',
        'david.lee@carrollton.gov',
        'finance',
        'Finance Director',
        true,
        NULL
      )
    ON CONFLICT (id) DO NOTHING;

    -- Inactive user (for testing filters)
    INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
    VALUES
      (
        '00000000-0000-0000-0000-000000000009',
        v_municipality_id,
        'Former Employee',
        'former@carrollton.gov',
        'staff',
        'Former Staff Member',
        false,
        v_dept_parks_id
      )
    ON CONFLICT (id) DO NOTHING;

  END IF;
END $$;
