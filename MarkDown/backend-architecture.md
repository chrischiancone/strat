# Backend Architecture

## Supabase RLS (Row-Level Security)

**Core security layer**. All data access is controlled at the database level via RLS policies.

### RLS Helper Functions

```sql
-- Get current user's municipality
CREATE OR REPLACE FUNCTION auth.user_municipality_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT municipality_id FROM public.users WHERE id = auth.uid();
$$;

-- Get current user's department
CREATE OR REPLACE FUNCTION auth.user_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT department_id FROM public.users WHERE id = auth.uid();
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Check if user is admin or city manager
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT role IN ('admin', 'city_manager') FROM public.users WHERE id = auth.uid();
$$;
```

### RLS Policy Examples

**Strategic Plans - Department Scoped**:

```sql
-- Department users can view their own plans
CREATE POLICY "Users can view own department plans"
ON strategic_plans
FOR SELECT
USING (
  department_id = auth.user_department_id()
  OR auth.is_admin_or_manager()
);

-- Department directors can create plans
CREATE POLICY "Directors can create plans"
ON strategic_plans
FOR INSERT
WITH CHECK (
  department_id = auth.user_department_id()
  AND auth.user_role() IN ('admin', 'department_director')
);

-- Department directors can update their drafts
CREATE POLICY "Directors can update own drafts"
ON strategic_plans
FOR UPDATE
USING (
  department_id = auth.user_department_id()
  AND status IN ('draft', 'under_review')
  AND auth.user_role() IN ('admin', 'department_director')
);

-- City Manager can approve plans
CREATE POLICY "City Manager can approve plans"
ON strategic_plans
FOR UPDATE
USING (auth.user_role() = 'city_manager')
WITH CHECK (
  status IN ('approved', 'active')
  AND auth.user_role() = 'city_manager'
);
```

**Initiatives - Cross-Department Collaboration**:

```sql
-- Users can view initiatives from their department or collaborating departments
CREATE POLICY "Users can view accessible initiatives"
ON initiatives
FOR SELECT
USING (
  lead_department_id = auth.user_department_id()
  OR EXISTS (
    SELECT 1 FROM initiative_collaborators
    WHERE initiative_id = initiatives.id
    AND department_id = auth.user_department_id()
  )
  OR auth.is_admin_or_manager()
);
```

**Comments - Universal Access**:

```sql
-- Any authenticated user can view comments on entities they can access
CREATE POLICY "Users can view comments"
ON comments
FOR SELECT
USING (
  CASE entity_type
    WHEN 'strategic_plan' THEN EXISTS (
      SELECT 1 FROM strategic_plans
      WHERE id = comments.entity_id
      AND (department_id = auth.user_department_id() OR auth.is_admin_or_manager())
    )
    WHEN 'initiative' THEN EXISTS (
      SELECT 1 FROM initiatives
      WHERE id = comments.entity_id
      AND (lead_department_id = auth.user_department_id() OR auth.is_admin_or_manager())
    )
    ELSE false
  END
);

-- Users can create comments
CREATE POLICY "Authenticated users can create comments"
ON comments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
```

## Database Triggers

**Audit Log Trigger**:

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      to_jsonb(OLD),
      auth.uid(),
      now()
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'update',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      new_values,
      changed_by,
      changed_at
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      to_jsonb(NEW),
      auth.uid(),
      now()
    );
    RETURN NEW;
  END IF;
END;
$$;

-- Apply to strategic_plans
CREATE TRIGGER strategic_plans_audit
AFTER INSERT OR UPDATE OR DELETE ON strategic_plans
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Apply to initiatives
CREATE TRIGGER initiatives_audit
AFTER INSERT OR UPDATE OR DELETE ON initiatives
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Database Indexes

**Performance-critical indexes**:

```sql
-- Strategic Plans
CREATE INDEX idx_strategic_plans_department_status
ON strategic_plans(department_id, status);

CREATE INDEX idx_strategic_plans_fiscal_year
ON strategic_plans(start_fiscal_year_id);

-- Initiatives
CREATE INDEX idx_initiatives_goal
ON initiatives(strategic_goal_id);

CREATE INDEX idx_initiatives_priority_rank
ON initiatives(priority_level, rank_within_priority);

CREATE INDEX idx_initiatives_status
ON initiatives(status);

-- Initiative Budgets
CREATE INDEX idx_initiative_budgets_fiscal_year
ON initiative_budgets(fiscal_year_id, funding_source);

-- Comments
CREATE INDEX idx_comments_entity
ON comments(entity_type, entity_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_table_record
ON audit_logs(table_name, record_id);

CREATE INDEX idx_audit_logs_changed_at
ON audit_logs(changed_at DESC);
```

---
