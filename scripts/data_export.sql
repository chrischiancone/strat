SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict BSRflgPxA68HVl7cVS4X31EKD8aDod1aoM0jRtWCbmhu3y3QxYndZmKeGoxG7IY

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '5371f484-c9e0-4a37-abd5-e1f8032e707e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@carrollton.gov","user_id":"00000000-0000-0000-0000-000000000001","user_phone":""}}', '2025-10-13 16:43:22.310157+00', ''),
	('00000000-0000-0000-0000-000000000000', '2961f644-803c-4718-9058-8a36ca4134df', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@carrollton.gov","user_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","user_phone":""}}', '2025-10-13 16:43:22.388377+00', ''),
	('00000000-0000-0000-0000-000000000000', '2644fcce-0ae5-4ac8-ba87-b356e5fab6b3', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 16:43:35.145145+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f30a80c2-680e-41d4-8fee-ffaadb1266dc', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:01:48.083492+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd71d478d-4c77-4a16-aa43-af5440dc5eec', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:26:14.12943+00', ''),
	('00000000-0000-0000-0000-000000000000', '11ffaf7d-03d1-4b22-83ca-da9130a930ff', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:26:55.365099+00', ''),
	('00000000-0000-0000-0000-000000000000', '7cf76c7f-3864-4cec-b178-3af1e8541a80', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:28:51.14359+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fa7ecf21-2d28-4bb6-8371-46b72618a92b', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:30:03.905908+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc28df67-d17a-4689-983f-a8215d818b87', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:32:40.028638+00', ''),
	('00000000-0000-0000-0000-000000000000', '95f5a38e-5080-4c08-8a50-4d2e37909af7', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-13 17:35:28.145554+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e799238-7fe6-4d27-a080-c9146e5c9a0d', '{"action":"token_refreshed","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"token"}', '2025-10-14 18:03:17.616205+00', ''),
	('00000000-0000-0000-0000-000000000000', '20701c98-99bf-49ab-96b8-d980ca55706d', '{"action":"token_revoked","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"token"}', '2025-10-14 18:03:17.616785+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd95ff6d-ccd3-4195-bded-d2e55f994aaf', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:03:31.607405+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a846b718-3b88-4c57-a34d-c12f68db7e94', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:10:56.210098+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ae72fb2-3d45-446f-ae96-bcaae482ee98', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@example.com","user_id":"9b96d0e4-0822-4d59-93a0-dddd95cbd1c7","user_phone":""}}', '2025-10-14 18:13:56.731642+00', ''),
	('00000000-0000-0000-0000-000000000000', '024410d3-bc30-4dd1-97a6-2f97b9339591', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@example.com","user_id":"9b96d0e4-0822-4d59-93a0-dddd95cbd1c7","user_phone":""}}', '2025-10-14 18:13:56.754397+00', ''),
	('00000000-0000-0000-0000-000000000000', '5dd8494d-2ba3-4b3d-b381-893bc0731275', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"chris.chiancone@cityofcarrollton.com","user_id":"a2b8b885-4b06-428e-9143-4fff86d38def","user_phone":""}}', '2025-10-14 18:15:29.837422+00', ''),
	('00000000-0000-0000-0000-000000000000', '279e6520-4fa6-473a-a894-1a0c36903165', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"samantha.dean@cityofcarrollton.com","user_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","user_phone":""}}', '2025-10-14 18:16:12.003713+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0e7efa6-7d6e-4439-a219-b17c0189981f', '{"action":"logout","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account"}', '2025-10-14 18:18:36.320801+00', ''),
	('00000000-0000-0000-0000-000000000000', '154ba32b-00fa-404f-ba5b-00027ed187ea', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:18:48.617085+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7ff4087-b637-4d1a-b0ca-fdb64ab67552', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:23:39.077008+00', ''),
	('00000000-0000-0000-0000-000000000000', 'adab26db-b411-4504-a3ab-da32498fefb3', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:30:01.255516+00', ''),
	('00000000-0000-0000-0000-000000000000', '5fea0854-5165-4965-b347-955195ac421f', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:36:16.052554+00', ''),
	('00000000-0000-0000-0000-000000000000', '81aaba02-95e6-4b5b-8e5f-ed93e4edfc00', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:52:11.770081+00', ''),
	('00000000-0000-0000-0000-000000000000', '9af4eb78-067a-4169-99b4-e53b57790dd8', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 18:59:08.311934+00', ''),
	('00000000-0000-0000-0000-000000000000', '00e726fa-c80c-425f-a500-89d90ee0a152', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 19:13:20.495987+00', ''),
	('00000000-0000-0000-0000-000000000000', '355a64f8-99b9-4196-af0a-78858903b236', '{"action":"login","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 19:28:34.635001+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4ca7b89-48a9-424d-9092-bff4903e6072', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"erin.rinehart@cityofcarrollton.com","user_id":"08b11091-5921-4476-8e94-351b89bb0495","user_phone":""}}', '2025-10-14 19:43:04.325471+00', ''),
	('00000000-0000-0000-0000-000000000000', '143b48b9-18e9-4a42-85e2-4ac7a8cbcc3d', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 20:17:10.332839+00', ''),
	('00000000-0000-0000-0000-000000000000', '8bbbdc44-d30d-4e75-a3e3-15de800d74f6', '{"action":"logout","actor_id":"56fc7071-1040-43a7-aeb5-79ad81012b00","actor_name":"Samantha Dean","actor_username":"samantha.dean@cityofcarrollton.com","actor_via_sso":false,"log_type":"account"}', '2025-10-14 19:36:13.576792+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b8214b17-f140-4793-a858-701de6618f9c', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 19:36:28.140979+00', ''),
	('00000000-0000-0000-0000-000000000000', '09d061c8-c306-4307-9a2e-8dc507ba765e', '{"action":"login","actor_id":"39fd24c4-5770-4e66-9d6c-3d7c279d03a5","actor_name":"System Administrator","actor_username":"admin@carrollton.gov","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-10-14 19:38:29.796621+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b8fee456-4523-4120-95ae-0e59db0b0e03', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"chrystal.davis@cityofcarrollton.com","user_id":"06079a69-43f5-44a8-92f2-39d7ba9176e5","user_phone":""}}', '2025-10-14 19:40:38.883761+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'john.smith@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sarah.johnson@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'mike.davis@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'emily.wilson@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'robert.garcia@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'linda.martinez@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'david.lee@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'former@carrollton.gov', '$2a$10$abcdefghijklmnopqrstuv', '2025-10-13 16:40:33.768208+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-10-13 16:40:33.768208+00', '2025-10-13 16:40:33.768208+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '06079a69-43f5-44a8-92f2-39d7ba9176e5', 'authenticated', 'authenticated', 'chrystal.davis@cityofcarrollton.com', '$2a$10$NlL2qotWBUVbodgAXflPUuePQi0B3gQNJDg2yWZbSy1rxZcR8Wfh.', '2025-10-14 19:40:38.884513+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chrystal Davis", "email_verified": true}', NULL, '2025-10-14 19:40:38.882673+00', '2025-10-14 19:40:38.884831+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '08b11091-5921-4476-8e94-351b89bb0495', 'authenticated', 'authenticated', 'erin.rinehart@cityofcarrollton.com', '$2a$10$EBOpNLQUvEolnWs4hozA0O5E6XnpJYF8iE11dOwyo/cxMj/xZkkLi', '2025-10-14 19:43:04.325945+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": " Erin Rinehart", "email_verified": true}', NULL, '2025-10-14 19:43:04.324444+00', '2025-10-14 19:43:04.326257+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', 'authenticated', 'authenticated', 'admin@carrollton.gov', '$2a$10$Fn2wgsXt6RH/Ok6AZsKNSuV6ffjs1L0Pc5NYoFMUExeweGYCW6ErO', '2025-10-13 16:43:22.389029+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-14 20:17:10.333272+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "System Administrator", "email_verified": true}', NULL, '2025-10-13 16:43:22.387232+00', '2025-10-14 20:17:10.334252+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a2b8b885-4b06-428e-9143-4fff86d38def', 'authenticated', 'authenticated', 'chris.chiancone@cityofcarrollton.com', '$2a$10$e5T4m5stZSQrT.5SoMlOg.NQdcrGpNwTuoNMpS62jprd0OKm0pU.S', '2025-10-14 18:15:29.837912+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Chris Chiancone", "email_verified": true}', NULL, '2025-10-14 18:15:29.836365+00', '2025-10-14 18:15:29.838211+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '56fc7071-1040-43a7-aeb5-79ad81012b00', 'authenticated', 'authenticated', 'samantha.dean@cityofcarrollton.com', '$2a$10$rrWZegNbSRGqUP/wh97CuupyDS2GINhJuj6cM80c9XXiOctNmeIzK', '2025-10-14 18:16:12.004227+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-10-14 19:28:34.635624+00', '{"provider": "email", "providers": ["email"]}', '{"full_name": "Samantha Dean", "email_verified": true}', NULL, '2025-10-14 18:16:12.002549+00', '2025-10-14 19:28:34.636479+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '{"sub": "39fd24c4-5770-4e66-9d6c-3d7c279d03a5", "email": "admin@carrollton.gov", "email_verified": false, "phone_verified": false}', 'email', '2025-10-13 16:43:22.387861+00', '2025-10-13 16:43:22.387884+00', '2025-10-13 16:43:22.387884+00', '192a2cca-6c0d-4152-8297-fd315bd4a797'),
	('a2b8b885-4b06-428e-9143-4fff86d38def', 'a2b8b885-4b06-428e-9143-4fff86d38def', '{"sub": "a2b8b885-4b06-428e-9143-4fff86d38def", "email": "chris.chiancone@cityofcarrollton.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-14 18:15:29.836988+00', '2025-10-14 18:15:29.83701+00', '2025-10-14 18:15:29.83701+00', '151cd872-021e-4e6e-81a8-7fbae6601a46'),
	('56fc7071-1040-43a7-aeb5-79ad81012b00', '56fc7071-1040-43a7-aeb5-79ad81012b00', '{"sub": "56fc7071-1040-43a7-aeb5-79ad81012b00", "email": "samantha.dean@cityofcarrollton.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-14 18:16:12.003203+00', '2025-10-14 18:16:12.003224+00', '2025-10-14 18:16:12.003224+00', '60959d21-0480-4509-817c-c6609f80611a'),
	('06079a69-43f5-44a8-92f2-39d7ba9176e5', '06079a69-43f5-44a8-92f2-39d7ba9176e5', '{"sub": "06079a69-43f5-44a8-92f2-39d7ba9176e5", "email": "chrystal.davis@cityofcarrollton.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-14 19:40:38.883238+00', '2025-10-14 19:40:38.883255+00', '2025-10-14 19:40:38.883255+00', 'b4f20e69-4113-4833-97f7-0f3b4102ce52'),
	('08b11091-5921-4476-8e94-351b89bb0495', '08b11091-5921-4476-8e94-351b89bb0495', '{"sub": "08b11091-5921-4476-8e94-351b89bb0495", "email": "erin.rinehart@cityofcarrollton.com", "email_verified": false, "phone_verified": false}', 'email', '2025-10-14 19:43:04.325045+00', '2025-10-14 19:43:04.325064+00', '2025-10-14 19:43:04.325064+00', '5e7653cb-e9a9-4ae8-a56a-5295575fb0cd');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id") VALUES
	('1aedee47-c12a-4f45-a629-d49641193826', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-14 19:36:28.141615+00', '2025-10-14 19:36:28.141615+00', NULL, 'aal1', NULL, NULL, 'node', '173.194.208.95', NULL, NULL),
	('1b2fc617-8815-43ed-8341-b8a9677accb4', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-14 19:38:29.797106+00', '2025-10-14 19:38:29.797106+00', NULL, 'aal1', NULL, NULL, 'node', '173.194.208.95', NULL, NULL),
	('db37f998-d112-4dc9-95bc-6d72d5b73f70', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-14 20:17:10.333314+00', '2025-10-14 20:17:10.333314+00', NULL, 'aal1', NULL, NULL, 'node', '173.194.208.95', NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('1aedee47-c12a-4f45-a629-d49641193826', '2025-10-14 19:36:28.142821+00', '2025-10-14 19:36:28.142821+00', 'password', '5714be19-a784-4f6e-aa42-af7ed04314db'),
	('1b2fc617-8815-43ed-8341-b8a9677accb4', '2025-10-14 19:38:29.798214+00', '2025-10-14 19:38:29.798214+00', 'password', '571e9daf-e41e-42a6-912e-0c8667149fed'),
	('db37f998-d112-4dc9-95bc-6d72d5b73f70', '2025-10-14 20:17:10.334411+00', '2025-10-14 20:17:10.334411+00', 'password', 'dc9cff00-c6d2-47b9-9914-64800f35cf5c');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 20, 'mjs7pragsugg', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', false, '2025-10-14 19:36:28.142175+00', '2025-10-14 19:36:28.142175+00', NULL, '1aedee47-c12a-4f45-a629-d49641193826'),
	('00000000-0000-0000-0000-000000000000', 21, 'ydxcz2mamjoc', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', false, '2025-10-14 19:38:29.797594+00', '2025-10-14 19:38:29.797594+00', NULL, '1b2fc617-8815-43ed-8341-b8a9677accb4'),
	('00000000-0000-0000-0000-000000000000', 22, 'mnjpmdkmam4u', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', false, '2025-10-14 20:17:10.333768+00', '2025-10-14 20:17:10.333768+00', NULL, 'db37f998-d112-4dc9-95bc-6d72d5b73f70');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: municipalities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."municipalities" ("id", "name", "slug", "state", "settings", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000001', 'City of Carrollton', 'carrollton', 'TX', '{"currency": "USD", "features": {"ai_assistance": true, "public_dashboard": true, "multi_department_collaboration": true}, "security": {"auth": {"ssoEnabled": false, "maxLoginAttempts": 5, "minPasswordLength": 8, "requireSpecialChars": true, "requireTwoFactorAdmin": false, "passwordExpirationDays": 90}, "audit": {"retentionDays": 365, "dataExportLogging": true, "enableAuditLogging": true, "failedLoginNotifications": true}, "access": {"allowedIPs": [], "defaultUserRole": "staff", "ipWhitelistEnabled": false, "autoApproveRegistration": true}, "session": {"rememberMeDays": 30, "timeoutMinutes": 60, "maxConcurrentSessions": 3}}, "timezone": "America/Chicago", "appearance": {"logo_url": "http://127.0.0.1:54321/storage/v1/object/public/branding/00000000-0000-0000-0000-000000000001/logo-1760376939378.png", "custom_css": "", "theme_mode": "light", "favicon_url": "", "font_family": "Inter", "accent_color": "#059669", "primary_color": "#2563eb", "secondary_color": "#64748b", "show_municipality_branding": true}, "website_url": "https://www.cityofcarrollton.com/", "contact_name": "Chris Chiancone", "contact_email": "chris.chiancone@cityofcarrollton.com", "contact_phone": null, "fiscal_year_start_month": 10}', '2025-10-13 16:40:33.764082+00', '2025-10-14 20:01:33.952878+00');


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."departments" ("id", "municipality_id", "name", "slug", "director_name", "director_email", "mission_statement", "core_services", "current_staffing", "is_active", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Water & Field Services', 'water-field-services', 'John Smith', 'jsmith@cityofcarrollton.com', 'To provide safe, reliable water services and maintain quality field operations for Carrollton residents.', '[]', '{}', true, '2025-10-13 16:40:33.764082+00', '2025-10-13 16:40:33.764082+00'),
	('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Parks & Recreation', 'parks-recreation', 'Sarah Johnson', 'sjohnson@cityofcarrollton.com', 'To enhance quality of life through exceptional parks, recreation programs, and community spaces.', '[]', '{}', true, '2025-10-13 16:40:33.764082+00', '2025-10-13 16:40:33.764082+00'),
	('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Information Technology', 'information-technology', 'Michael Chen', 'mchen@cityofcarrollton.com', 'To deliver innovative technology solutions that enable efficient city operations and excellent citizen services.', '[]', '{}', true, '2025-10-13 16:40:33.764082+00', '2025-10-13 16:40:33.764082+00'),
	('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Finance', 'finance', 'Amanda Rodriguez', 'arodriguez@cityofcarrollton.com', 'To ensure fiscal responsibility and provide financial expertise supporting city operations.', '[]', '{}', true, '2025-10-13 16:40:33.764082+00', '2025-10-13 16:40:33.764082+00'),
	('46bcb764-df30-479c-b8c4-02cd44ed8bb8', '00000000-0000-0000-0000-000000000001', 'Workforce Services', 'workforce-services', 'Samantha Dean', 'samantha.dean@cityofcarrollton.com', 'The mission of the Carrollton Workforce Services Department is to provide efficient and
exceptional service to our customers while contributing to the strategic goals of the City Manager’s Office and City Council.', '[]', '{}', true, '2025-10-14 18:13:12.098867+00', '2025-10-14 18:16:32.824831+00'),
	('c097f47d-140a-4001-a80c-be1b7c01c54b', '00000000-0000-0000-0000-000000000001', 'City Managers Office', 'city-managers-office', 'Erin Rinehart', 'Erin.Rinehart@cityofcarrollton.com', NULL, '[]', '{}', true, '2025-10-14 19:41:52.339522+00', '2025-10-14 19:41:52.339522+00');


--
-- Data for Name: fiscal_years; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fiscal_years" ("id", "municipality_id", "year", "start_date", "end_date", "is_current", "created_at") VALUES
	('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 2025, '2024-10-01', '2025-09-30', false, '2025-10-13 16:40:33.764082+00'),
	('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 2026, '2025-10-01', '2026-09-30', false, '2025-10-13 16:40:33.764082+00'),
	('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 2027, '2026-10-01', '2027-09-30', true, '2025-10-13 16:40:33.764082+00'),
	('6ff3dbb3-fac1-4f7a-b0a4-bb3a2b270f71', '00000000-0000-0000-0000-000000000001', 2028, '2027-10-01', '2028-09-30', false, '2025-10-13 17:17:10.048768+00');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "municipality_id", "department_id", "role", "full_name", "title", "email", "avatar_url", "preferences", "is_active", "created_at", "updated_at", "phone", "mobile", "reports_to") VALUES
	('39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'admin', 'System Administrator', 'IT Director', 'admin@carrollton.gov', NULL, '{}', true, '2025-10-13 16:43:22.407394+00', '2025-10-13 16:43:22.407394+00', NULL, NULL, NULL),
	('a2b8b885-4b06-428e-9143-4fff86d38def', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'admin', 'Chris Chiancone', 'CIO', 'chris.chiancone@cityofcarrollton.com', NULL, '{}', true, '2025-10-14 18:15:29.841624+00', '2025-10-14 18:15:29.841624+00', NULL, NULL, NULL),
	('56fc7071-1040-43a7-aeb5-79ad81012b00', '00000000-0000-0000-0000-000000000001', '46bcb764-df30-479c-b8c4-02cd44ed8bb8', 'department_director', 'Samantha Dean', 'Workforce Services Director', 'samantha.dean@cityofcarrollton.com', NULL, '{"phone": "972-466-3093", "mobile": "469-986-6251"}', true, '2025-10-14 18:16:12.012601+00', '2025-10-14 19:41:00.86636+00', NULL, NULL, '06079a69-43f5-44a8-92f2-39d7ba9176e5'),
	('08b11091-5921-4476-8e94-351b89bb0495', '00000000-0000-0000-0000-000000000001', 'c097f47d-140a-4001-a80c-be1b7c01c54b', 'city_manager', ' Erin Rinehart', 'City Manager', 'erin.rinehart@cityofcarrollton.com', NULL, '{}', true, '2025-10-14 19:43:04.334681+00', '2025-10-14 19:43:04.334681+00', NULL, NULL, NULL),
	('06079a69-43f5-44a8-92f2-39d7ba9176e5', '00000000-0000-0000-0000-000000000001', 'c097f47d-140a-4001-a80c-be1b7c01c54b', 'city_manager', 'Chrystal Davis', 'Assistant City Manager', 'Chrystal.Davis@cityofcarrollton.com', NULL, '{}', true, '2025-10-14 19:40:38.891859+00', '2025-10-14 19:43:20.086397+00', NULL, NULL, '08b11091-5921-4476-8e94-351b89bb0495');


--
-- Data for Name: strategic_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."strategic_plans" ("id", "department_id", "start_fiscal_year_id", "end_fiscal_year_id", "title", "status", "version", "executive_summary", "department_vision", "swot_analysis", "environmental_scan", "benchmarking_data", "total_investment_amount", "approved_by", "approved_at", "published_at", "created_by", "created_at", "updated_at") VALUES
	('d531e5de-41c1-4b83-a268-734f0075c11a', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', '6ff3dbb3-fac1-4f7a-b0a4-bb3a2b270f71', 'FYundefined Strategic Plan', 'draft', '1.0', NULL, NULL, '{"threats": [], "strengths": [], "weaknesses": [], "opportunities": []}', '{}', '{}', 0.00, NULL, NULL, NULL, '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-14 18:04:25.749204+00', '2025-10-14 18:04:25.749204+00'),
	('0defac96-39b0-4723-b524-d8ea961c75d7', '46bcb764-df30-479c-b8c4-02cd44ed8bb8', '00000000-0000-0000-0000-000000000203', '6ff3dbb3-fac1-4f7a-b0a4-bb3a2b270f71', 'FYundefined Strategic Plan', 'draft', '1.0', NULL, NULL, '{"threats": [], "strengths": [], "weaknesses": [], "opportunities": []}', '{}', '{}', 0.00, NULL, NULL, NULL, '56fc7071-1040-43a7-aeb5-79ad81012b00', '2025-10-14 18:26:03.229243+00', '2025-10-14 18:26:03.229243+00');


--
-- Data for Name: ai_analyses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."audit_logs" ("id", "table_name", "record_id", "action", "old_values", "new_values", "changed_by", "changed_at", "ip_address", "user_agent") VALUES
	('5c64b78b-cde1-4a5f-b352-f55bd560ebe1', 'dashboard_messages', '81aeec77-684c-48d4-acc8-c0f10c893827', 'insert', NULL, '{"id": "81aeec77-684c-48d4-acc8-c0f10c893827", "heading": "Getting Started with Initiatives", "message": "Each initiative should have clear expected outcomes, resource requirements, and success metrics.", "bg_color": "blue", "location": "initiatives_footer", "created_at": "2025-10-13T16:40:33.765867+00:00", "updated_at": "2025-10-13T16:40:33.765867+00:00"}', NULL, '2025-10-13 16:40:33.765867+00', NULL, NULL),
	('36c4eebe-b694-4521-b4ce-386cb4ec4c47', 'strategic_plans', 'd531e5de-41c1-4b83-a268-734f0075c11a', 'insert', NULL, '{"id": "d531e5de-41c1-4b83-a268-734f0075c11a", "title": "FYundefined Strategic Plan", "status": "draft", "version": "1.0", "created_at": "2025-10-14T18:04:25.749204+00:00", "created_by": "39fd24c4-5770-4e66-9d6c-3d7c279d03a5", "updated_at": "2025-10-14T18:04:25.749204+00:00", "approved_at": null, "approved_by": null, "published_at": null, "department_id": "00000000-0000-0000-0000-000000000103", "swot_analysis": {"threats": [], "strengths": [], "weaknesses": [], "opportunities": []}, "benchmarking_data": {}, "department_vision": null, "executive_summary": null, "end_fiscal_year_id": "6ff3dbb3-fac1-4f7a-b0a4-bb3a2b270f71", "environmental_scan": {}, "start_fiscal_year_id": "00000000-0000-0000-0000-000000000203", "total_investment_amount": 0.00}', NULL, '2025-10-14 18:04:25.749204+00', NULL, NULL),
	('d6fc5627-bcfb-4da3-8349-b769be67bb05', 'strategic_plans', '0defac96-39b0-4723-b524-d8ea961c75d7', 'insert', NULL, '{"id": "0defac96-39b0-4723-b524-d8ea961c75d7", "title": "FYundefined Strategic Plan", "status": "draft", "version": "1.0", "created_at": "2025-10-14T18:26:03.229243+00:00", "created_by": "56fc7071-1040-43a7-aeb5-79ad81012b00", "updated_at": "2025-10-14T18:26:03.229243+00:00", "approved_at": null, "approved_by": null, "published_at": null, "department_id": "46bcb764-df30-479c-b8c4-02cd44ed8bb8", "swot_analysis": {"threats": [], "strengths": [], "weaknesses": [], "opportunities": []}, "benchmarking_data": {}, "department_vision": null, "executive_summary": null, "end_fiscal_year_id": "6ff3dbb3-fac1-4f7a-b0a4-bb3a2b270f71", "environmental_scan": {}, "start_fiscal_year_id": "00000000-0000-0000-0000-000000000203", "total_investment_amount": 0.00}', NULL, '2025-10-14 18:26:03.229243+00', NULL, NULL);


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."backups" ("id", "name", "type", "status", "size", "duration", "file_count", "file_path", "checksum", "includes", "error_message", "municipality_id", "created_by", "created_at", "completed_at", "updated_at") VALUES
	('85fac561-b267-40e4-9293-9a1e14014a23', 'Full Backup - 2025-10-13', 'full', 'completed', 8279, 300, 13, '00000000-0000-0000-0000-000000000001/backup-85fac561-b267-40e4-9293-9a1e14014a23-1760374930505.json', 'ac55731483ec309b4d29512361eab46326230b93624f4c26ea72c58f21262ff3', '["database", "files", "settings", "user_data"]', NULL, '00000000-0000-0000-0000-000000000001', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-13 17:02:10.463277+00', '2025-10-13 17:02:10.73+00', '2025-10-13 17:02:10.738885+00'),
	('7f617559-8385-403e-93f7-f43c23e1ff69', 'Full Backup - 2025-10-14', 'full', 'completed', 5171, 300, 9, '00000000-0000-0000-0000-000000000001/backup-7f617559-8385-403e-93f7-f43c23e1ff69-1760471112124.json', '8a216c0472ac7713312102bae477b9a1de70e0f6296f97319f527172e0aa63ee', '["database", "files", "settings", "user_data"]', NULL, '00000000-0000-0000-0000-000000000001', '39fd24c4-5770-4e66-9d6c-3d7c279d03a5', '2025-10-14 19:45:12.068351+00', '2025-10-14 19:45:12.331+00', '2025-10-14 19:45:12.339242+00');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: council_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: dashboard_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."dashboard_messages" ("id", "location", "heading", "message", "bg_color", "created_at", "updated_at") VALUES
	('81aeec77-684c-48d4-acc8-c0f10c893827', 'initiatives_footer', 'Getting Started with Initiatives', 'Each initiative should have clear expected outcomes, resource requirements, and success metrics.', 'blue', '2025-10-13 16:40:33.765867+00', '2025-10-13 16:40:33.765867+00');


--
-- Data for Name: document_embeddings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: strategic_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: initiatives; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: initiative_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: initiative_collaborators; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: initiative_dependencies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: initiative_kpis; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quarterly_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('carrollton-backups', 'carrollton-backups', NULL, '2025-10-13 16:49:26.075578+00', '2025-10-13 16:49:26.075578+00', false, false, 52428800, '{application/json,application/zip,application/x-tar,application/gzip}', NULL, 'STANDARD'),
	('branding', 'branding', NULL, '2025-10-13 17:26:22.734166+00', '2025-10-13 17:26:22.734166+00', true, false, 2097152, '{image/png,image/jpeg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp}', NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('7723c137-1852-41a4-9a20-2262ec18a0b3', 'carrollton-backups', '00000000-0000-0000-0000-000000000001/backup-85fac561-b267-40e4-9293-9a1e14014a23-1760374930505.json', NULL, '2025-10-13 17:02:10.720777+00', '2025-10-13 17:02:10.720777+00', '2025-10-13 17:02:10.720777+00', '{"eTag": "\"5435f7b117be4fb08928394922df22b0\"", "size": 8279, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:02:10.716Z", "contentLength": 8279, "httpStatusCode": 200}', 'b3e5e6ee-0e9e-4753-b2d2-08b032279ab9', NULL, '{}', 2),
	('0f67f3a2-22da-46e7-acc7-e79fd139bfe7', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376425995.png', NULL, '2025-10-13 17:27:06.212795+00', '2025-10-13 17:27:06.212795+00', '2025-10-13 17:27:06.212795+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:27:06.209Z", "contentLength": 23375, "httpStatusCode": 200}', 'da18fedb-28b8-4154-b2ea-aa55bed17e19', NULL, '{}', 2),
	('1a80596a-1cd7-4c12-885b-37b154984c85', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376541350.png', NULL, '2025-10-13 17:29:01.607811+00', '2025-10-13 17:29:01.607811+00', '2025-10-13 17:29:01.607811+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:29:01.604Z", "contentLength": 23375, "httpStatusCode": 200}', '79e8121d-324f-4091-857f-1ab3067e15e4', NULL, '{}', 2),
	('2af21157-214c-4aea-8682-9479a77a038c', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376615640.png', NULL, '2025-10-13 17:30:15.915581+00', '2025-10-13 17:30:15.915581+00', '2025-10-13 17:30:15.915581+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:30:15.913Z", "contentLength": 23375, "httpStatusCode": 200}', 'a04ba692-4dbb-4880-b670-bf1f1026d119', NULL, '{}', 2),
	('d89b0edc-f3e3-48c0-b976-9f5030ff655a', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376773610.png', NULL, '2025-10-13 17:32:53.903537+00', '2025-10-13 17:32:53.903537+00', '2025-10-13 17:32:53.903537+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:32:53.902Z", "contentLength": 23375, "httpStatusCode": 200}', '104044d4-f30e-482d-95b6-f7ff6b5160af', NULL, '{}', 2),
	('30f1fb09-f4e5-4fab-8236-0b5877a1a912', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376864409.png', NULL, '2025-10-13 17:34:24.643302+00', '2025-10-13 17:34:24.643302+00', '2025-10-13 17:34:24.643302+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:34:24.641Z", "contentLength": 23375, "httpStatusCode": 200}', '73e3d3a6-8c3b-4ef0-ba22-9d9e0c090c74', NULL, '{}', 2),
	('58823eef-ffbf-4d36-9b4f-7486bc7d44ea', 'branding', '00000000-0000-0000-0000-000000000001/logo-1760376939378.png', NULL, '2025-10-13 17:35:39.649728+00', '2025-10-13 17:35:39.649728+00', '2025-10-13 17:35:39.649728+00', '{"eTag": "\"62dcc4ce518c8dafae0e7fb68aab36e1\"", "size": 23375, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-10-13T17:35:39.647Z", "contentLength": 23375, "httpStatusCode": 200}', '8f7faa2f-bb11-4587-baf4-ddb6e4c91d8c', NULL, '{}', 2),
	('071e4668-b472-493b-a051-4ff8ebcee1d8', 'carrollton-backups', '00000000-0000-0000-0000-000000000001/backup-7f617559-8385-403e-93f7-f43c23e1ff69-1760471112124.json', NULL, '2025-10-14 19:45:12.324841+00', '2025-10-14 19:45:12.324841+00', '2025-10-14 19:45:12.324841+00', '{"eTag": "\"5ac0fc0e34526a695914e6bde79e2ede\"", "size": 5171, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-10-14T19:45:12.320Z", "contentLength": 5171, "httpStatusCode": 200}', 'bd8d3d72-473b-4414-827c-e10601a1859d', NULL, '{}', 2);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('carrollton-backups', '00000000-0000-0000-0000-000000000001', '2025-10-13 17:02:10.720777+00', '2025-10-13 17:02:10.720777+00'),
	('branding', '00000000-0000-0000-0000-000000000001', '2025-10-13 17:27:06.212795+00', '2025-10-13 17:27:06.212795+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 22, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict BSRflgPxA68HVl7cVS4X31EKD8aDod1aoM0jRtWCbmhu3y3QxYndZmKeGoxG7IY

RESET ALL;
