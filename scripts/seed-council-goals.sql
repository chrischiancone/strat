-- Insert Council Goals Seed Data
-- Manually inserting since migration didn't run due to municipality name mismatch

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'core_value',
    'Hospitality',
    'We focus on quality of life in our community so all feel safe, valued, respected, and welcomed.',
    ARRAY[
        'Communicate and engage with the community',
        'Improve accessibility to the services we provide',
        'Enhance the perception of our brand',
        'Foster a sense of belonging by valuing diversity and inclusivity',
        'Foster a welcoming environment for businesses and residents',
        'Provide professional and courteous service',
        'Provide opportunities for a healthy lifestyle'
    ],
    1,
    '00000000-0000-0000-0000-000000000001'
);

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'core_value',
    'Optimize',
    'Our processes enable us to deliver high-quality, expedient, and friendly service.',
    ARRAY[
        'Allocate resources for optimal results',
        'Ensure processes for integrated, cross-functional planning and execution',
        'Leverage technology to improve our effectiveness and efficiency',
        'Adapt business practices to respond to changing conditions'
    ],
    2,
    '00000000-0000-0000-0000-000000000001'
);

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'core_value',
    'Motivate',
    'Our employees are empowered and trusted to work as a team to deliver exceptional service.',
    ARRAY[
        'Foster a positive workplace culture',
        'Ensure our employees have appropriate resources and exemplify the Vision',
        'Attract and retain a diverse, motivated, and qualified team',
        'Invest in the professional development of our employees'
    ],
    3,
    '00000000-0000-0000-0000-000000000001'
);

INSERT INTO council_goals (municipality_id, category, title, description, key_points, sort_order, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'core_value',
    'Economical',
    'We build and maintain a consistently thriving and diverse financial base while being outstanding stewards of City resources.',
    ARRAY[
        'Increase and stimulate the sales tax base',
        'Increase the property tax base',
        'Leverage opportunities around TODs',
        'Manage infrastructure with fiduciary care',
        'Ensure City services are an optimal value'
    ],
    4,
    '00000000-0000-0000-0000-000000000001'
);
