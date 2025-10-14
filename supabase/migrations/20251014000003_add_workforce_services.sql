-- Add Workforce Services department and user for testing

-- Add Workforce Services department
INSERT INTO departments (id, municipality_id, name, slug, director_name, director_email, mission_statement, is_active)
VALUES (
    '46bcb764-df30-479c-b8c4-02cd44ed8bb8'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Workforce Services',
    'workforce-services',
    'Samantha Dean',
    'samantha.dean@cityofcarrollton.com',
    'To develop and maintain a skilled workforce that supports city operations and serves the community effectively.',
    true
);

-- Add user for Workforce Services
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES (
    '56fc7071-1040-43a7-aeb5-79ad81012b00'::uuid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'samantha.dean@cityofcarrollton.com',
    '$2a$10$abcdefghijklmnopqrstuv',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- Add public user profile
INSERT INTO users (id, municipality_id, full_name, email, role, title, is_active, department_id)
VALUES (
    '56fc7071-1040-43a7-aeb5-79ad81012b00'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Samantha Dean',
    'samantha.dean@cityofcarrollton.com',
    'department_director',
    'Director of Workforce Services',
    true,
    '46bcb764-df30-479c-b8c4-02cd44ed8bb8'::uuid
)
ON CONFLICT (id) DO NOTHING;