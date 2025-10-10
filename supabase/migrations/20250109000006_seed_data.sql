-- Strategic Planning System - Seed Data
-- Part 6: Sample data for development and testing

-- =====================================================
-- 1. INSERT MUNICIPALITY (City of Carrollton)
-- =====================================================
INSERT INTO municipalities (id, name, slug, state, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'City of Carrollton',
    'carrollton',
    'TX',
    '{
        "timezone": "America/Chicago",
        "fiscal_year_start_month": 10,
        "currency": "USD",
        "features": {
            "ai_assistance": true,
            "public_dashboard": true,
            "multi_department_collaboration": true
        }
    }'::jsonb
);

-- =====================================================
-- 2. INSERT DEPARTMENTS
-- =====================================================
INSERT INTO departments (id, municipality_id, name, slug, director_name, director_email, mission_statement, is_active)
VALUES
    (
        '00000000-0000-0000-0000-000000000101'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Water & Field Services',
        'water-field-services',
        'John Smith',
        'jsmith@cityofcarrollton.com',
        'To provide safe, reliable water services and maintain quality field operations for Carrollton residents.',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000102'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Parks & Recreation',
        'parks-recreation',
        'Sarah Johnson',
        'sjohnson@cityofcarrollton.com',
        'To enhance quality of life through exceptional parks, recreation programs, and community spaces.',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000103'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Information Technology',
        'information-technology',
        'Michael Chen',
        'mchen@cityofcarrollton.com',
        'To deliver innovative technology solutions that enable efficient city operations and excellent citizen services.',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000104'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        'Finance',
        'finance',
        'Amanda Rodriguez',
        'arodriguez@cityofcarrollton.com',
        'To ensure fiscal responsibility and provide financial expertise supporting city operations.',
        true
    );

-- =====================================================
-- 3. INSERT FISCAL YEARS (FY2025 - FY2027)
-- =====================================================
INSERT INTO fiscal_years (id, municipality_id, year, start_date, end_date, is_current)
VALUES
    (
        '00000000-0000-0000-0000-000000000201'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        2025,
        '2024-10-01',
        '2025-09-30',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000202'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        2026,
        '2025-10-01',
        '2026-09-30',
        false
    ),
    (
        '00000000-0000-0000-0000-000000000203'::uuid,
        '00000000-0000-0000-0000-000000000001'::uuid,
        2027,
        '2026-10-01',
        '2027-09-30',
        false
    );

-- =====================================================
-- 4. CREATE SAMPLE USER (Will be linked to Supabase auth)
-- =====================================================
-- Note: In production, users are created via Supabase Auth
-- This is just a placeholder showing the structure
-- INSERT INTO users (id, municipality_id, department_id, role, full_name, title, email)
-- VALUES (
--     auth.uid(), -- Will be set by Supabase Auth
--     '00000000-0000-0000-0000-000000000001'::uuid,
--     '00000000-0000-0000-0000-000000000101'::uuid,
--     'department_director',
--     'John Smith',
--     'Director of Water & Field Services',
--     'jsmith@cityofcarrollton.com'
-- );

-- =====================================================
-- 5. SAMPLE STRATEGIC PLAN (Water & Field Services FY25-27)
-- =====================================================
-- Commented out until we have authenticated users via Supabase Auth
-- INSERT INTO strategic_plans (
--     id,
--     department_id,
--     start_fiscal_year_id,
--     end_fiscal_year_id,
--     title,
--     status,
--     version,
--     executive_summary,
--     department_vision,
--     swot_analysis,
--     total_investment_amount,
--     created_by
-- )
-- VALUES (
--     '00000000-0000-0000-0000-000000000301'::uuid,
--     '00000000-0000-0000-0000-000000000101'::uuid,
--     '00000000-0000-0000-0000-000000000201'::uuid,
--     '00000000-0000-0000-0000-000000000203'::uuid,
--     'Water & Field Services Strategic Plan FY2025-2027',
--     'draft',
--     '1.0',
--     'This three-year strategic plan outlines critical infrastructure improvements, service enhancements, and operational efficiencies for the Water & Field Services Department.',
--     'By FY2027, Water & Field Services will be recognized as a leader in sustainable water management and customer service excellence.',
--     '{
--         "strengths": [
--             "Experienced technical staff with deep institutional knowledge",
--             "Modern SCADA systems for water distribution monitoring",
--             "Strong safety record and compliance history",
--             "Dedicated customer service team"
--         ],
--         "weaknesses": [
--             "Aging infrastructure in older neighborhoods",
--             "Limited GIS integration for asset management",
--             "Reactive maintenance approach in some areas",
--             "Manual work order processes"
--         ],
--         "opportunities": [
--             "Federal infrastructure funding through IIJA",
--             "Smart meter technology for leak detection",
--             "Regional partnerships for water supply resilience",
--             "AI-powered predictive maintenance"
--         ],
--         "threats": [
--             "Increasing regulatory compliance requirements",
--             "Climate change impacting water supply",
--             "Competition for skilled workforce",
--             "Rising costs of materials and equipment"
--         ]
--     }'::jsonb,
--     4250000.00,
--     '00000000-0000-0000-0000-000000000001'::uuid -- Placeholder, replace with actual user ID
-- );

-- =====================================================
-- 6. SAMPLE STRATEGIC GOALS
-- =====================================================
-- -- INSERT INTO strategic_goals (id, strategic_plan_id, goal_number, title, description, city_priority_alignment, objectives)
-- -- VALUES
--     (
--         '00000000-0000-0000-0000-000000000401'::uuid,
--         '00000000-0000-0000-0000-000000000301'::uuid,
--         1,
--         'Modernize Water Infrastructure',
--         'Upgrade aging water distribution systems to ensure reliability and reduce water loss.',
--         'Infrastructure Investment & Sustainability',
--         '[
--             "Replace 15 miles of aging water mains by end of Year 3",
--             "Reduce water loss from 12% to 8% system-wide",
--             "Implement smart meter technology on 50% of service connections"
--         ]'::jsonb
--     ),
--     (
--         '00000000-0000-0000-0000-000000000402'::uuid,
--         '00000000-0000-0000-0000-000000000301'::uuid,
--         2,
--         'Enhance Operational Efficiency',
--         'Implement technology and process improvements to optimize service delivery.',
--         'Operational Excellence',
--         '[
--             "Deploy mobile work order management system by Q2 FY2025",
--             "Reduce average service response time to under 4 hours",
--             "Achieve 95% first-time fix rate for standard repairs"
--         ]'::jsonb
--     ),
--     (
--         '00000000-0000-0000-0000-000000000403'::uuid,
--         '00000000-0000-0000-0000-000000000301'::uuid,
--         3,
--         'Improve Customer Experience',
--         'Enhance communication and service quality for water utility customers.',
--         'Citizen Engagement & Service Quality',
--         '[
--             "Launch customer self-service portal by Q3 FY2025",
--             "Increase customer satisfaction score from 78% to 90%",
--             "Reduce billing inquiries by 30% through proactive communication"
--         ]'::jsonb
--     );
-- 
-- -- =====================================================
-- -- 7. SAMPLE INITIATIVE
-- -- =====================================================
-- INSERT INTO initiatives (
--     id,
--     strategic_goal_id,
--     lead_department_id,
--     fiscal_year_id,
--     initiative_number,
--     name,
--     priority_level,
--     rank_within_priority,
--     description,
--     rationale,
--     expected_outcomes,
--     status,
--     financial_analysis,
--     roi_analysis,
--     total_year_1_cost,
--     responsible_party
-- )
-- VALUES (
--     '00000000-0000-0000-0000-000000000501'::uuid,
--     '00000000-0000-0000-0000-000000000401'::uuid,
--     '00000000-0000-0000-0000-000000000101'::uuid,
--     '00000000-0000-0000-0000-000000000201'::uuid,
--     '1.1',
--     'Smart Water Meter Deployment - Phase 1',
--     'NEED',
--     1,
--     'Deploy advanced metering infrastructure (AMI) to 5,000 residential and commercial customers in priority zones with highest water loss rates.',
--     'Current manual meter reading is labor-intensive and provides limited data for leak detection. Smart meters enable real-time monitoring, faster leak detection, and improved customer service through detailed usage data.',
--     '[
--         "Reduce water loss by 15% in deployment zones",
--         "Eliminate manual meter reading routes (save 400 staff hours/month)",
--         "Enable proactive leak alerts to customers",
--         "Improve billing accuracy and reduce disputes",
--         "Provide foundation for future demand management programs"
--     ]'::jsonb,
--     'not_started',
--     '{
--         "year_1": {
--             "personnel_costs": 85000,
--             "equipment_technology": 750000,
--             "professional_services": 125000,
--             "training_development": 15000,
--             "materials_supplies": 25000,
--             "other_costs": 0,
--             "total": 1000000
--         },
--         "funding_sources": [
--             {"source": "General Fund", "amount": 500000, "status": "secured"},
--             {"source": "EPA Water Infrastructure Grant", "amount": 400000, "status": "pending"},
--             {"source": "Water Utility Reserve", "amount": 100000, "status": "secured"}
--         ]
--     }'::jsonb,
--     '{
--         "financial": {
--             "projected_annual_savings": 180000,
--             "projected_revenue_generation": 0,
--             "payback_period_months": 67,
--             "three_year_net_impact": 540000
--         },
--         "non_financial": {
--             "service_quality_improvement": "Real-time usage data empowers customers to manage consumption",
--             "efficiency_gains": "Eliminate 400 hours/month of manual meter reading",
--             "risk_reduction": "Early leak detection prevents property damage and water loss",
--             "citizen_satisfaction": "Expected 20% increase in billing satisfaction scores",
--             "employee_impact": "Redeploy meter readers to higher-value maintenance activities"
--         }
--     }'::jsonb,
--     1000000.00,
--     'John Smith, Director'
-- );
-- 
-- -- =====================================================
-- -- 8. SAMPLE INITIATIVE BUDGET (Detailed breakdown)
-- -- =====================================================
-- INSERT INTO initiative_budgets (initiative_id, fiscal_year_id, category, amount, funding_source, funding_status, notes)
-- VALUES
--     ('00000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'equipment', 750000, 'General Fund', 'secured', 'Smart meters and communication infrastructure'),
--     ('00000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'services', 125000, 'EPA Water Infrastructure Grant', 'pending', 'Installation and system integration services'),
--     ('00000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'personnel', 85000, 'General Fund', 'secured', 'Project management and coordination'),
--     ('00000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'training', 15000, 'Water Utility Reserve', 'secured', 'Staff training on new system'),
--     ('00000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-0000-0000-000000000201'::uuid, 'materials', 25000, 'General Fund', 'secured', 'Installation materials and supplies');
-- 
-- -- =====================================================
-- -- 9. SAMPLE KPIs
-- -- =====================================================
-- INSERT INTO initiative_kpis (
--     initiative_id,
--     metric_name,
--     measurement_frequency,
--     baseline_value,
--     year_1_target,
--     year_2_target,
--     year_3_target,
--     data_source,
--     responsible_party
-- )
-- VALUES
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         'Number of Smart Meters Deployed',
--         'monthly',
--         '0',
--         '5,000',
--         '15,000',
--         '30,000',
--         'AMI system dashboard',
--         'Operations Manager'
--     ),
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         'Water Loss Percentage in AMI Zones',
--         'quarterly',
--         '12%',
--         '10%',
--         '8%',
--         '6%',
--         'Monthly water audit reports',
--         'Water Conservation Coordinator'
--     ),
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         'Customer Billing Satisfaction Score',
--         'quarterly',
--         '78%',
--         '82%',
--         '86%',
--         '90%',
--         'Customer satisfaction surveys',
--         'Customer Service Manager'
--     );
-- 
-- -- =====================================================
-- -- 10. SAMPLE QUARTERLY MILESTONES
-- -- =====================================================
-- INSERT INTO quarterly_milestones (initiative_id, fiscal_year_id, quarter, milestone_description, responsible_party, budget_impact, status)
-- VALUES
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         '00000000-0000-0000-0000-000000000201'::uuid,
--         1,
--         'Complete vendor selection and contract execution; Finalize deployment zones',
--         'Procurement Manager',
--         50000,
--         'not_started'
--     ),
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         '00000000-0000-0000-0000-000000000201'::uuid,
--         2,
--         'Deploy first 1,500 meters; Train field staff; Launch customer communication campaign',
--         'Operations Manager',
--         400000,
--         'not_started'
--     ),
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         '00000000-0000-0000-0000-000000000201'::uuid,
--         3,
--         'Deploy additional 2,000 meters; Integrate with billing system; Monitor early results',
--         'Operations Manager',
--         350000,
--         'not_started'
--     ),
--     (
--         '00000000-0000-0000-0000-000000000501'::uuid,
--         '00000000-0000-0000-0000-000000000201'::uuid,
--         4,
--         'Complete final 1,500 meters; Conduct performance evaluation; Plan Phase 2',
--         'Director',
--         200000,
--         'not_started'
--     );

-- =====================================================
-- NOTES
-- =====================================================
-- This seed data provides a realistic example of a Water & Field Services
-- strategic plan with one complete initiative including:
-- - Municipality and department setup
-- - 3-year fiscal year range
-- - Strategic plan with SWOT analysis
-- - Three strategic goals
-- - One fully detailed initiative with financial analysis
-- - Budget breakdown
-- - KPIs with targets
-- - Quarterly implementation milestones
--
-- Use this as a template for creating additional departments, plans, and initiatives.
