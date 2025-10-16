


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE OR REPLACE FUNCTION "public"."audit_trigger_function"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'insert', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
END;
$$;


ALTER FUNCTION "public"."audit_trigger_function"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_manager"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT COALESCE(role IN ('admin', 'city_manager'), false)
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
$$;


ALTER FUNCTION "public"."is_admin_or_manager"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ai_analyses_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ai_analyses_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_department_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT department_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;


ALTER FUNCTION "public"."user_department_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_municipality_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT municipality_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;


ALTER FUNCTION "public"."user_municipality_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;


ALTER FUNCTION "public"."user_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid",
    "analysis_type" character varying(50) NOT NULL,
    "results" "jsonb" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_analyses_analysis_type_check" CHECK ((("analysis_type")::"text" = ANY ((ARRAY['plan_analysis'::character varying, 'trend_analysis'::character varying, 'prediction_analysis'::character varying, 'recommendation_analysis'::character varying])::"text"[])))
);


ALTER TABLE "public"."ai_analyses" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_analyses" IS 'Stores AI-generated analysis results for strategic plans';



COMMENT ON COLUMN "public"."ai_analyses"."plan_id" IS 'Reference to the plan being analyzed (nullable for general analyses)';



COMMENT ON COLUMN "public"."ai_analyses"."analysis_type" IS 'Type of AI analysis performed';



COMMENT ON COLUMN "public"."ai_analyses"."results" IS 'JSON storage for analysis results and insights';



COMMENT ON COLUMN "public"."ai_analyses"."user_id" IS 'User who requested the analysis';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "old_values" "jsonb",
    "new_values" "jsonb",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    CONSTRAINT "audit_logs_action_check" CHECK (("action" = ANY (ARRAY['insert'::"text", 'update'::"text", 'delete'::"text"])))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Comprehensive audit trail for all changes';



CREATE TABLE IF NOT EXISTS "public"."backups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "size" bigint DEFAULT 0,
    "duration" integer DEFAULT 0,
    "file_count" integer DEFAULT 0,
    "file_path" "text",
    "checksum" "text",
    "includes" "jsonb" DEFAULT '[]'::"jsonb",
    "error_message" "text",
    "municipality_id" "uuid" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "backups_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text"]))),
    CONSTRAINT "backups_type_check" CHECK (("type" = ANY (ARRAY['full'::"text", 'incremental'::"text", 'differential'::"text"])))
);


ALTER TABLE "public"."backups" OWNER TO "postgres";


COMMENT ON TABLE "public"."backups" IS 'Stores backup records and metadata';



COMMENT ON COLUMN "public"."backups"."file_path" IS 'Path to backup file in Supabase Storage';



COMMENT ON COLUMN "public"."backups"."checksum" IS 'SHA-256 checksum for integrity verification';



COMMENT ON COLUMN "public"."backups"."includes" IS 'JSON array of backup content types (database, files, settings, user_data, logs)';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "parent_comment_id" "uuid",
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "comments_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['strategic_plan'::"text", 'initiative'::"text", 'goal'::"text", 'milestone'::"text"])))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."comments" IS 'Threaded comments for collaboration and review';



CREATE TABLE IF NOT EXISTS "public"."council_goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "key_points" "text"[] DEFAULT '{}'::"text"[],
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "council_goals_category_check" CHECK (("category" = ANY (ARRAY['core_value'::"text", 'focus_area'::"text"])))
);


ALTER TABLE "public"."council_goals" OWNER TO "postgres";


COMMENT ON TABLE "public"."council_goals" IS 'City council strategic goals and core values that departments align with';



COMMENT ON COLUMN "public"."council_goals"."category" IS 'Type: core_value (Hospitality, Optimize, etc.) or focus_area (specific strategic focus)';



COMMENT ON COLUMN "public"."council_goals"."key_points" IS 'Array of key bullet points/sub-goals under this category';



CREATE TABLE IF NOT EXISTS "public"."dashboard_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "location" "text" NOT NULL,
    "heading" "text" NOT NULL,
    "message" "text" NOT NULL,
    "bg_color" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "dashboard_messages_bg_color_check" CHECK (("bg_color" = ANY (ARRAY['green'::"text", 'yellow'::"text", 'blue'::"text"])))
);


ALTER TABLE "public"."dashboard_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "director_name" "text",
    "director_email" "text",
    "mission_statement" "text",
    "core_services" "jsonb" DEFAULT '[]'::"jsonb",
    "current_staffing" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


COMMENT ON TABLE "public"."departments" IS 'City departments that create strategic plans';



CREATE TABLE IF NOT EXISTS "public"."document_embeddings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "content_type" "text" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "content_text" "text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "document_embeddings_type_check" CHECK (("content_type" = ANY (ARRAY['strategic_plan'::"text", 'initiative'::"text", 'goal'::"text", 'uploaded_pdf'::"text", 'comment'::"text"])))
);


ALTER TABLE "public"."document_embeddings" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_embeddings" IS 'Vector embeddings for semantic search and RAG';



CREATE TABLE IF NOT EXISTS "public"."fiscal_years" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "year" integer NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_current" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "fiscal_years_dates_valid" CHECK (("end_date" > "start_date"))
);


ALTER TABLE "public"."fiscal_years" OWNER TO "postgres";


COMMENT ON TABLE "public"."fiscal_years" IS 'Fiscal year periods for budget tracking';



CREATE TABLE IF NOT EXISTS "public"."initiative_budgets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "initiative_id" "uuid" NOT NULL,
    "fiscal_year_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "funding_source" "text",
    "funding_status" "text" DEFAULT 'projected'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "initiative_budgets_category_check" CHECK (("category" = ANY (ARRAY['personnel'::"text", 'equipment'::"text", 'services'::"text", 'training'::"text", 'materials'::"text", 'other'::"text"]))),
    CONSTRAINT "initiative_budgets_funding_status_check" CHECK (("funding_status" = ANY (ARRAY['secured'::"text", 'requested'::"text", 'pending'::"text", 'projected'::"text"])))
);


ALTER TABLE "public"."initiative_budgets" OWNER TO "postgres";


COMMENT ON TABLE "public"."initiative_budgets" IS 'Normalized budget entries for aggregation and reporting';



CREATE TABLE IF NOT EXISTS "public"."initiative_collaborators" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "initiative_id" "uuid" NOT NULL,
    "department_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "resources_committed" "text",
    "budget_share" numeric(12,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "initiative_collaborators_role_check" CHECK (("role" = ANY (ARRAY['lead'::"text", 'support'::"text", 'contributor'::"text"])))
);


ALTER TABLE "public"."initiative_collaborators" OWNER TO "postgres";


COMMENT ON TABLE "public"."initiative_collaborators" IS 'Multi-department collaboration on initiatives';



CREATE TABLE IF NOT EXISTS "public"."initiative_dependencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "initiative_id" "uuid" NOT NULL,
    "depends_on_initiative_id" "uuid" NOT NULL,
    "dependency_type" "text",
    "nature_of_dependency" "text",
    "is_critical_path" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "initiative_dependencies_not_self" CHECK (("initiative_id" <> "depends_on_initiative_id")),
    CONSTRAINT "initiative_dependencies_type_check" CHECK (("dependency_type" = ANY (ARRAY['internal'::"text", 'external'::"text", 'resource_sharing'::"text"])))
);


ALTER TABLE "public"."initiative_dependencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."initiative_dependencies" IS 'Initiative prerequisite relationships';



CREATE TABLE IF NOT EXISTS "public"."initiative_kpis" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "initiative_id" "uuid",
    "strategic_goal_id" "uuid",
    "strategic_plan_id" "uuid",
    "metric_name" "text" NOT NULL,
    "measurement_frequency" "text",
    "baseline_value" "text",
    "year_1_target" "text",
    "year_2_target" "text",
    "year_3_target" "text",
    "data_source" "text",
    "responsible_party" "text",
    "actual_values" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "initiative_kpis_frequency_check" CHECK (("measurement_frequency" = ANY (ARRAY['monthly'::"text", 'quarterly'::"text", 'annual'::"text", 'continuous'::"text"]))),
    CONSTRAINT "initiative_kpis_level_check" CHECK (((("initiative_id" IS NOT NULL) AND ("strategic_goal_id" IS NULL) AND ("strategic_plan_id" IS NULL)) OR (("initiative_id" IS NULL) AND ("strategic_goal_id" IS NOT NULL) AND ("strategic_plan_id" IS NULL)) OR (("initiative_id" IS NULL) AND ("strategic_goal_id" IS NULL) AND ("strategic_plan_id" IS NOT NULL))))
);


ALTER TABLE "public"."initiative_kpis" OWNER TO "postgres";


COMMENT ON TABLE "public"."initiative_kpis" IS 'Performance metrics at initiative, goal, or plan level';



CREATE TABLE IF NOT EXISTS "public"."initiatives" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "strategic_goal_id" "uuid" NOT NULL,
    "lead_department_id" "uuid" NOT NULL,
    "fiscal_year_id" "uuid" NOT NULL,
    "initiative_number" "text" NOT NULL,
    "name" "text" NOT NULL,
    "priority_level" "text" NOT NULL,
    "rank_within_priority" integer DEFAULT 0,
    "description" "text",
    "rationale" "text",
    "expected_outcomes" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "financial_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "roi_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "cost_benefit_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "implementation_timeline" "jsonb" DEFAULT '{}'::"jsonb",
    "dependencies" "jsonb" DEFAULT '{}'::"jsonb",
    "risks" "jsonb" DEFAULT '[]'::"jsonb",
    "total_year_1_cost" numeric(12,2) DEFAULT 0,
    "total_year_2_cost" numeric(12,2) DEFAULT 0,
    "total_year_3_cost" numeric(12,2) DEFAULT 0,
    "responsible_party" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "budget_validated_by" "uuid",
    "budget_validated_at" timestamp with time zone,
    CONSTRAINT "initiatives_priority_check" CHECK (("priority_level" = ANY (ARRAY['NEED'::"text", 'WANT'::"text", 'NICE_TO_HAVE'::"text"]))),
    CONSTRAINT "initiatives_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'at_risk'::"text", 'completed'::"text", 'deferred'::"text"])))
);


ALTER TABLE "public"."initiatives" OWNER TO "postgres";


COMMENT ON TABLE "public"."initiatives" IS 'Individual strategic initiatives (e.g., 1.1, 2.3)';



COMMENT ON COLUMN "public"."initiatives"."budget_validated_by" IS 'Finance user who validated this initiative budget';



COMMENT ON COLUMN "public"."initiatives"."budget_validated_at" IS 'Timestamp when budget was validated by Finance';



CREATE TABLE IF NOT EXISTS "public"."municipalities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "state" "text" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."municipalities" OWNER TO "postgres";


COMMENT ON TABLE "public"."municipalities" IS 'Municipal governments using the strategic planning system';



CREATE TABLE IF NOT EXISTS "public"."quarterly_milestones" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "initiative_id" "uuid" NOT NULL,
    "fiscal_year_id" "uuid" NOT NULL,
    "quarter" integer NOT NULL,
    "milestone_description" "text" NOT NULL,
    "responsible_party" "text",
    "budget_impact" numeric(12,2) DEFAULT 0,
    "status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "completion_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quarterly_milestones_quarter_check" CHECK ((("quarter" >= 1) AND ("quarter" <= 4))),
    CONSTRAINT "quarterly_milestones_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text", 'delayed'::"text"])))
);


ALTER TABLE "public"."quarterly_milestones" OWNER TO "postgres";


COMMENT ON TABLE "public"."quarterly_milestones" IS 'Implementation timeline tracking';



CREATE TABLE IF NOT EXISTS "public"."strategic_goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "strategic_plan_id" "uuid" NOT NULL,
    "goal_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "city_priority_alignment" "text",
    "objectives" "jsonb" DEFAULT '[]'::"jsonb",
    "success_measures" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_order" integer NOT NULL,
    "created_by" "uuid",
    CONSTRAINT "strategic_goals_number_positive" CHECK (("goal_number" > 0))
);


ALTER TABLE "public"."strategic_goals" OWNER TO "postgres";


COMMENT ON TABLE "public"."strategic_goals" IS 'Major strategic goals (3-5 per plan)';



COMMENT ON COLUMN "public"."strategic_goals"."display_order" IS 'Order in which goals are displayed (allows reordering without changing goal_number)';



COMMENT ON COLUMN "public"."strategic_goals"."created_by" IS 'User who created this goal';



CREATE TABLE IF NOT EXISTS "public"."strategic_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "department_id" "uuid" NOT NULL,
    "start_fiscal_year_id" "uuid" NOT NULL,
    "end_fiscal_year_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "version" "text" DEFAULT '1.0'::"text",
    "executive_summary" "text",
    "department_vision" "text",
    "swot_analysis" "jsonb" DEFAULT '{"threats": [], "strengths": [], "weaknesses": [], "opportunities": []}'::"jsonb",
    "environmental_scan" "jsonb" DEFAULT '{}'::"jsonb",
    "benchmarking_data" "jsonb" DEFAULT '{}'::"jsonb",
    "total_investment_amount" numeric(12,2) DEFAULT 0,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "published_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "strategic_plans_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'under_review'::"text", 'approved'::"text", 'active'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."strategic_plans" OWNER TO "postgres";


COMMENT ON TABLE "public"."strategic_plans" IS 'Strategic planning documents (single or multi-year)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "role" "text" DEFAULT 'staff'::"text" NOT NULL,
    "full_name" "text",
    "title" "text",
    "email" "text",
    "avatar_url" "text",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text",
    "mobile" "text",
    "reports_to" "uuid",
    "two_factor_secret" "text",
    "two_factor_enabled" boolean DEFAULT false,
    "two_factor_backup_codes" "text"[],
    CONSTRAINT "users_no_self_report" CHECK (("id" <> "reports_to")),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'department_director'::"text", 'staff'::"text", 'city_manager'::"text", 'finance'::"text", 'council'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'User profiles and role assignments';



COMMENT ON COLUMN "public"."users"."phone" IS 'User primary phone number';



COMMENT ON COLUMN "public"."users"."mobile" IS 'User mobile/cell phone number';



COMMENT ON COLUMN "public"."users"."reports_to" IS 'ID of the user this person reports to (supervisor) for strategic plan review workflows';



COMMENT ON COLUMN "public"."users"."two_factor_secret" IS 'Encrypted TOTP secret for 2FA authentication';



COMMENT ON COLUMN "public"."users"."two_factor_enabled" IS 'Whether 2FA is enabled for this user';



COMMENT ON COLUMN "public"."users"."two_factor_backup_codes" IS 'Array of hashed backup codes for 2FA recovery';



ALTER TABLE ONLY "public"."ai_analyses"
    ADD CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."backups"
    ADD CONSTRAINT "backups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."council_goals"
    ADD CONSTRAINT "council_goals_municipality_id_category_sort_order_key" UNIQUE ("municipality_id", "category", "sort_order");



ALTER TABLE ONLY "public"."council_goals"
    ADD CONSTRAINT "council_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_messages"
    ADD CONSTRAINT "dashboard_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_municipality_slug_unique" UNIQUE ("municipality_id", "slug");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_embeddings"
    ADD CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiscal_years"
    ADD CONSTRAINT "fiscal_years_municipality_year_unique" UNIQUE ("municipality_id", "year");



ALTER TABLE ONLY "public"."fiscal_years"
    ADD CONSTRAINT "fiscal_years_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."initiative_budgets"
    ADD CONSTRAINT "initiative_budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."initiative_collaborators"
    ADD CONSTRAINT "initiative_collaborators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."initiative_collaborators"
    ADD CONSTRAINT "initiative_collaborators_unique" UNIQUE ("initiative_id", "department_id");



ALTER TABLE ONLY "public"."initiative_dependencies"
    ADD CONSTRAINT "initiative_dependencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."initiative_dependencies"
    ADD CONSTRAINT "initiative_dependencies_unique" UNIQUE ("initiative_id", "depends_on_initiative_id");



ALTER TABLE ONLY "public"."initiative_kpis"
    ADD CONSTRAINT "initiative_kpis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."initiatives"
    ADD CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipalities"
    ADD CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipalities"
    ADD CONSTRAINT "municipalities_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."quarterly_milestones"
    ADD CONSTRAINT "quarterly_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quarterly_milestones"
    ADD CONSTRAINT "quarterly_milestones_unique" UNIQUE ("initiative_id", "fiscal_year_id", "quarter");



ALTER TABLE ONLY "public"."strategic_goals"
    ADD CONSTRAINT "strategic_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."strategic_goals"
    ADD CONSTRAINT "strategic_goals_plan_number_unique" UNIQUE ("strategic_plan_id", "goal_number");



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_changed_at_idx" ON "public"."audit_logs" USING "btree" ("changed_at" DESC);



CREATE INDEX "audit_logs_changed_by_idx" ON "public"."audit_logs" USING "btree" ("changed_by");



CREATE INDEX "audit_logs_table_record_idx" ON "public"."audit_logs" USING "btree" ("table_name", "record_id");



CREATE INDEX "comments_author_idx" ON "public"."comments" USING "btree" ("author_id");



CREATE INDEX "comments_entity_idx" ON "public"."comments" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "comments_parent_idx" ON "public"."comments" USING "btree" ("parent_comment_id");



CREATE INDEX "comments_unresolved_idx" ON "public"."comments" USING "btree" ("is_resolved") WHERE ("is_resolved" = false);



CREATE INDEX "council_goals_active_idx" ON "public"."council_goals" USING "btree" ("is_active");



CREATE INDEX "council_goals_municipality_category_idx" ON "public"."council_goals" USING "btree" ("municipality_id", "category");



CREATE INDEX "council_goals_sort_order_idx" ON "public"."council_goals" USING "btree" ("sort_order");



CREATE INDEX "dashboard_messages_location_idx" ON "public"."dashboard_messages" USING "btree" ("location");



CREATE INDEX "departments_is_active_idx" ON "public"."departments" USING "btree" ("is_active");



CREATE INDEX "departments_municipality_id_idx" ON "public"."departments" USING "btree" ("municipality_id");



CREATE INDEX "document_embeddings_content_idx" ON "public"."document_embeddings" USING "btree" ("content_type", "content_id");



CREATE INDEX "document_embeddings_vector_idx" ON "public"."document_embeddings" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "fiscal_years_is_current_idx" ON "public"."fiscal_years" USING "btree" ("is_current");



CREATE INDEX "fiscal_years_municipality_year_idx" ON "public"."fiscal_years" USING "btree" ("municipality_id", "year");



CREATE INDEX "idx_ai_analyses_created_at" ON "public"."ai_analyses" USING "btree" ("created_at");



CREATE INDEX "idx_ai_analyses_plan_id" ON "public"."ai_analyses" USING "btree" ("plan_id");



CREATE INDEX "idx_ai_analyses_plan_type_created" ON "public"."ai_analyses" USING "btree" ("plan_id", "analysis_type", "created_at" DESC);



CREATE INDEX "idx_ai_analyses_type" ON "public"."ai_analyses" USING "btree" ("analysis_type");



CREATE INDEX "idx_ai_analyses_user_id" ON "public"."ai_analyses" USING "btree" ("user_id");



CREATE INDEX "idx_backups_created_at" ON "public"."backups" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_backups_municipality_id" ON "public"."backups" USING "btree" ("municipality_id");



CREATE INDEX "idx_backups_status" ON "public"."backups" USING "btree" ("status");



CREATE INDEX "idx_backups_type" ON "public"."backups" USING "btree" ("type");



CREATE INDEX "initiative_budgets_fiscal_year_source_idx" ON "public"."initiative_budgets" USING "btree" ("fiscal_year_id", "funding_source");



CREATE INDEX "initiative_budgets_initiative_year_idx" ON "public"."initiative_budgets" USING "btree" ("initiative_id", "fiscal_year_id");



CREATE INDEX "initiative_collaborators_department_idx" ON "public"."initiative_collaborators" USING "btree" ("department_id");



CREATE INDEX "initiative_collaborators_initiative_idx" ON "public"."initiative_collaborators" USING "btree" ("initiative_id");



CREATE INDEX "initiative_dependencies_critical_idx" ON "public"."initiative_dependencies" USING "btree" ("is_critical_path") WHERE ("is_critical_path" = true);



CREATE INDEX "initiative_dependencies_depends_on_idx" ON "public"."initiative_dependencies" USING "btree" ("depends_on_initiative_id");



CREATE INDEX "initiative_dependencies_initiative_idx" ON "public"."initiative_dependencies" USING "btree" ("initiative_id");



CREATE INDEX "initiative_kpis_goal_idx" ON "public"."initiative_kpis" USING "btree" ("strategic_goal_id");



CREATE INDEX "initiative_kpis_initiative_idx" ON "public"."initiative_kpis" USING "btree" ("initiative_id");



CREATE INDEX "initiative_kpis_plan_idx" ON "public"."initiative_kpis" USING "btree" ("strategic_plan_id");



CREATE INDEX "initiatives_budget_validated_idx" ON "public"."initiatives" USING "btree" ("budget_validated_by") WHERE ("budget_validated_by" IS NOT NULL);



CREATE INDEX "initiatives_fiscal_year_idx" ON "public"."initiatives" USING "btree" ("fiscal_year_id");



CREATE INDEX "initiatives_goal_id_idx" ON "public"."initiatives" USING "btree" ("strategic_goal_id");



CREATE INDEX "initiatives_lead_department_idx" ON "public"."initiatives" USING "btree" ("lead_department_id");



CREATE INDEX "initiatives_priority_rank_idx" ON "public"."initiatives" USING "btree" ("priority_level", "rank_within_priority");



CREATE INDEX "initiatives_status_idx" ON "public"."initiatives" USING "btree" ("status");



CREATE INDEX "municipalities_slug_idx" ON "public"."municipalities" USING "btree" ("slug");



CREATE INDEX "quarterly_milestones_initiative_idx" ON "public"."quarterly_milestones" USING "btree" ("initiative_id");



CREATE INDEX "quarterly_milestones_status_idx" ON "public"."quarterly_milestones" USING "btree" ("status");



CREATE INDEX "strategic_goals_display_order_idx" ON "public"."strategic_goals" USING "btree" ("strategic_plan_id", "display_order");



CREATE INDEX "strategic_goals_plan_id_idx" ON "public"."strategic_goals" USING "btree" ("strategic_plan_id");



CREATE INDEX "strategic_plans_created_by_idx" ON "public"."strategic_plans" USING "btree" ("created_by");



CREATE INDEX "strategic_plans_department_status_idx" ON "public"."strategic_plans" USING "btree" ("department_id", "status");



CREATE INDEX "strategic_plans_start_year_idx" ON "public"."strategic_plans" USING "btree" ("start_fiscal_year_id");



CREATE INDEX "users_department_id_idx" ON "public"."users" USING "btree" ("department_id");



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_mobile_idx" ON "public"."users" USING "btree" ("mobile") WHERE ("mobile" IS NOT NULL);



CREATE INDEX "users_municipality_role_idx" ON "public"."users" USING "btree" ("municipality_id", "role");



CREATE INDEX "users_phone_idx" ON "public"."users" USING "btree" ("phone") WHERE ("phone" IS NOT NULL);



CREATE INDEX "users_reports_to_idx" ON "public"."users" USING "btree" ("reports_to");



CREATE INDEX "users_two_factor_enabled_idx" ON "public"."users" USING "btree" ("two_factor_enabled");



CREATE OR REPLACE TRIGGER "comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "council_goals_updated_at" BEFORE UPDATE ON "public"."council_goals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "dashboard_messages_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."dashboard_messages" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "dashboard_messages_updated_at" BEFORE UPDATE ON "public"."dashboard_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "departments_updated_at" BEFORE UPDATE ON "public"."departments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "initiative_budgets_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."initiative_budgets" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "initiative_budgets_updated_at" BEFORE UPDATE ON "public"."initiative_budgets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "initiative_kpis_updated_at" BEFORE UPDATE ON "public"."initiative_kpis" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "initiatives_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."initiatives" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "initiatives_updated_at" BEFORE UPDATE ON "public"."initiatives" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "municipalities_updated_at" BEFORE UPDATE ON "public"."municipalities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "quarterly_milestones_updated_at" BEFORE UPDATE ON "public"."quarterly_milestones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_backups_updated_at" BEFORE UPDATE ON "public"."backups" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "strategic_goals_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."strategic_goals" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "strategic_goals_updated_at" BEFORE UPDATE ON "public"."strategic_goals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "strategic_plans_audit" AFTER INSERT OR DELETE OR UPDATE ON "public"."strategic_plans" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "strategic_plans_updated_at" BEFORE UPDATE ON "public"."strategic_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_ai_analyses_updated_at" BEFORE UPDATE ON "public"."ai_analyses" FOR EACH ROW EXECUTE FUNCTION "public"."update_ai_analyses_updated_at"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_analyses"
    ADD CONSTRAINT "ai_analyses_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."strategic_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_analyses"
    ADD CONSTRAINT "ai_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."backups"
    ADD CONSTRAINT "backups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."backups"
    ADD CONSTRAINT "backups_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."council_goals"
    ADD CONSTRAINT "council_goals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."council_goals"
    ADD CONSTRAINT "council_goals_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fiscal_years"
    ADD CONSTRAINT "fiscal_years_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_budgets"
    ADD CONSTRAINT "initiative_budgets_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."initiative_budgets"
    ADD CONSTRAINT "initiative_budgets_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_collaborators"
    ADD CONSTRAINT "initiative_collaborators_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_collaborators"
    ADD CONSTRAINT "initiative_collaborators_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_dependencies"
    ADD CONSTRAINT "initiative_dependencies_depends_on_initiative_id_fkey" FOREIGN KEY ("depends_on_initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_dependencies"
    ADD CONSTRAINT "initiative_dependencies_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_kpis"
    ADD CONSTRAINT "initiative_kpis_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_kpis"
    ADD CONSTRAINT "initiative_kpis_strategic_goal_id_fkey" FOREIGN KEY ("strategic_goal_id") REFERENCES "public"."strategic_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiative_kpis"
    ADD CONSTRAINT "initiative_kpis_strategic_plan_id_fkey" FOREIGN KEY ("strategic_plan_id") REFERENCES "public"."strategic_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."initiatives"
    ADD CONSTRAINT "initiatives_budget_validated_by_fkey" FOREIGN KEY ("budget_validated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."initiatives"
    ADD CONSTRAINT "initiatives_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."initiatives"
    ADD CONSTRAINT "initiatives_lead_department_id_fkey" FOREIGN KEY ("lead_department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."initiatives"
    ADD CONSTRAINT "initiatives_strategic_goal_id_fkey" FOREIGN KEY ("strategic_goal_id") REFERENCES "public"."strategic_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quarterly_milestones"
    ADD CONSTRAINT "quarterly_milestones_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."quarterly_milestones"
    ADD CONSTRAINT "quarterly_milestones_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strategic_goals"
    ADD CONSTRAINT "strategic_goals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."strategic_goals"
    ADD CONSTRAINT "strategic_goals_strategic_plan_id_fkey" FOREIGN KEY ("strategic_plan_id") REFERENCES "public"."strategic_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_end_fiscal_year_id_fkey" FOREIGN KEY ("end_fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."strategic_plans"
    ADD CONSTRAINT "strategic_plans_start_fiscal_year_id_fkey" FOREIGN KEY ("start_fiscal_year_id") REFERENCES "public"."fiscal_years"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_reports_to_fkey" FOREIGN KEY ("reports_to") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can delete ai_analyses" ON "public"."ai_analyses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can delete backups" ON "public"."backups" FOR DELETE USING (("municipality_id" IN ( SELECT "users"."municipality_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"text", 'manager'::"text"]))))));



CREATE POLICY "Admins can insert backups" ON "public"."backups" FOR INSERT WITH CHECK (("municipality_id" IN ( SELECT "users"."municipality_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"text", 'manager'::"text"]))))));



CREATE POLICY "Admins can update backups" ON "public"."backups" FOR UPDATE USING (("municipality_id" IN ( SELECT "users"."municipality_id"
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"text", 'manager'::"text"]))))));



CREATE POLICY "Council goals are viewable by municipality users" ON "public"."council_goals" FOR SELECT USING (("municipality_id" IN ( SELECT "users"."municipality_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



CREATE POLICY "Only admins can modify council goals" ON "public"."council_goals" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"text") AND ("users"."municipality_id" = "council_goals"."municipality_id")))));



CREATE POLICY "Users can create ai_analyses" ON "public"."ai_analyses" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = ANY (ARRAY['admin'::"text", 'finance'::"text", 'city_manager'::"text", 'department_head'::"text", 'staff'::"text"])))))));



CREATE POLICY "Users can update their own ai_analyses" ON "public"."ai_analyses" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view ai_analyses for their department" ON "public"."ai_analyses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role" = 'admin'::"text") OR (("ai_analyses"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM ("public"."strategic_plans" "p"
             JOIN "public"."users" "pu" ON (("p"."department_id" = "pu"."department_id")))
          WHERE (("p"."id" = "ai_analyses"."plan_id") AND ("pu"."id" = "auth"."uid"()))))))))));



CREATE POLICY "Users can view backups from their municipality" ON "public"."backups" FOR SELECT USING (("municipality_id" IN ( SELECT "users"."municipality_id"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."ai_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."backups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "comments_insert" ON "public"."comments" FOR INSERT WITH CHECK ((("author_id" = "auth"."uid"()) AND ((("entity_type" = 'strategic_plan'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."strategic_plans" "sp"
     JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
  WHERE (("sp"."id" = "comments"."entity_id") AND ("d"."municipality_id" = "public"."user_municipality_id"()))))) OR (("entity_type" = 'initiative'::"text") AND (EXISTS ( SELECT 1
   FROM ((("public"."initiatives" "i"
     JOIN "public"."strategic_goals" "sg" ON (("i"."strategic_goal_id" = "sg"."id")))
     JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
     JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
  WHERE (("i"."id" = "comments"."entity_id") AND ("d"."municipality_id" = "public"."user_municipality_id"()))))) OR (("entity_type" = 'goal'::"text") AND (EXISTS ( SELECT 1
   FROM (("public"."strategic_goals" "sg"
     JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
     JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
  WHERE (("sg"."id" = "comments"."entity_id") AND ("d"."municipality_id" = "public"."user_municipality_id"()))))) OR (("entity_type" = 'milestone'::"text") AND (EXISTS ( SELECT 1
   FROM (((("public"."quarterly_milestones" "qm"
     JOIN "public"."initiatives" "i" ON (("qm"."initiative_id" = "i"."id")))
     JOIN "public"."strategic_goals" "sg" ON (("i"."strategic_goal_id" = "sg"."id")))
     JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
     JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
  WHERE (("qm"."id" = "comments"."entity_id") AND ("d"."municipality_id" = "public"."user_municipality_id"()))))))));



ALTER TABLE "public"."council_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_embeddings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_embeddings_insert" ON "public"."document_embeddings" FOR INSERT WITH CHECK (true);



CREATE POLICY "document_embeddings_select" ON "public"."document_embeddings" FOR SELECT USING (true);



ALTER TABLE "public"."fiscal_years" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."initiative_budgets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."initiative_collaborators" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."initiative_dependencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."initiative_kpis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."initiatives" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "initiatives_delete" ON "public"."initiatives" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"text") AND (EXISTS ( SELECT 1
           FROM (("public"."strategic_goals" "sg"
             JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
             JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
          WHERE (("sg"."id" = "initiatives"."strategic_goal_id") AND ("d"."municipality_id" = "u"."municipality_id"))))))));



CREATE POLICY "initiatives_insert" ON "public"."initiatives" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = ANY (ARRAY['admin'::"text", 'city_manager'::"text", 'department_director'::"text", 'staff'::"text"])) AND (EXISTS ( SELECT 1
           FROM (("public"."strategic_goals" "sg"
             JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
             JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
          WHERE (("sg"."id" = "initiatives"."strategic_goal_id") AND ("d"."municipality_id" = "u"."municipality_id"))))))));



CREATE POLICY "initiatives_select" ON "public"."initiatives" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."strategic_goals" "sg"
     JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
     JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
  WHERE (("sg"."id" = "initiatives"."strategic_goal_id") AND ("d"."municipality_id" = ( SELECT "users"."municipality_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"())
         LIMIT 1))))));



CREATE POLICY "initiatives_update" ON "public"."initiatives" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = ANY (ARRAY['admin'::"text", 'city_manager'::"text", 'department_director'::"text", 'staff'::"text"])) AND (EXISTS ( SELECT 1
           FROM (("public"."strategic_goals" "sg"
             JOIN "public"."strategic_plans" "sp" ON (("sg"."strategic_plan_id" = "sp"."id")))
             JOIN "public"."departments" "d" ON (("sp"."department_id" = "d"."id")))
          WHERE (("sg"."id" = "initiatives"."strategic_goal_id") AND ("d"."municipality_id" = "u"."municipality_id"))))))));



ALTER TABLE "public"."municipalities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quarterly_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."strategic_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."strategic_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_select_all" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_update_admin" ON "public"."users" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"text") AND ("u"."municipality_id" = "users"."municipality_id")))));



CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ai_analyses_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ai_analyses_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ai_analyses_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_department_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_department_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_department_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_municipality_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_municipality_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_municipality_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";









GRANT ALL ON TABLE "public"."ai_analyses" TO "anon";
GRANT ALL ON TABLE "public"."ai_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."backups" TO "anon";
GRANT ALL ON TABLE "public"."backups" TO "authenticated";
GRANT ALL ON TABLE "public"."backups" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."council_goals" TO "anon";
GRANT ALL ON TABLE "public"."council_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."council_goals" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_messages" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_messages" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."document_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."document_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."document_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."fiscal_years" TO "anon";
GRANT ALL ON TABLE "public"."fiscal_years" TO "authenticated";
GRANT ALL ON TABLE "public"."fiscal_years" TO "service_role";



GRANT ALL ON TABLE "public"."initiative_budgets" TO "anon";
GRANT ALL ON TABLE "public"."initiative_budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."initiative_budgets" TO "service_role";



GRANT ALL ON TABLE "public"."initiative_collaborators" TO "anon";
GRANT ALL ON TABLE "public"."initiative_collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."initiative_collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."initiative_dependencies" TO "anon";
GRANT ALL ON TABLE "public"."initiative_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."initiative_dependencies" TO "service_role";



GRANT ALL ON TABLE "public"."initiative_kpis" TO "anon";
GRANT ALL ON TABLE "public"."initiative_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."initiative_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."initiatives" TO "anon";
GRANT ALL ON TABLE "public"."initiatives" TO "authenticated";
GRANT ALL ON TABLE "public"."initiatives" TO "service_role";



GRANT ALL ON TABLE "public"."municipalities" TO "anon";
GRANT ALL ON TABLE "public"."municipalities" TO "authenticated";
GRANT ALL ON TABLE "public"."municipalities" TO "service_role";



GRANT ALL ON TABLE "public"."quarterly_milestones" TO "anon";
GRANT ALL ON TABLE "public"."quarterly_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."quarterly_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."strategic_goals" TO "anon";
GRANT ALL ON TABLE "public"."strategic_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."strategic_goals" TO "service_role";



GRANT ALL ON TABLE "public"."strategic_plans" TO "anon";
GRANT ALL ON TABLE "public"."strategic_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."strategic_plans" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
