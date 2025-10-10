export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_resolved: boolean | null
          parent_comment_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_resolved?: boolean | null
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          core_services: Json | null
          created_at: string | null
          current_staffing: Json | null
          director_email: string | null
          director_name: string | null
          id: string
          is_active: boolean | null
          mission_statement: string | null
          municipality_id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          core_services?: Json | null
          created_at?: string | null
          current_staffing?: Json | null
          director_email?: string | null
          director_name?: string | null
          id?: string
          is_active?: boolean | null
          mission_statement?: string | null
          municipality_id: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          core_services?: Json | null
          created_at?: string | null
          current_staffing?: Json | null
          director_email?: string | null
          director_name?: string | null
          id?: string
          is_active?: boolean | null
          mission_statement?: string | null
          municipality_id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      document_embeddings: {
        Row: {
          content_id: string
          content_text: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content_id: string
          content_text: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content_id?: string
          content_text?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      fiscal_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_current: boolean | null
          municipality_id: string
          start_date: string
          year: number
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          municipality_id: string
          start_date: string
          year: number
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          municipality_id?: string
          start_date?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_years_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_budgets: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          fiscal_year_id: string
          funding_source: string | null
          funding_status: string | null
          id: string
          initiative_id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          fiscal_year_id: string
          funding_source?: string | null
          funding_status?: string | null
          id?: string
          initiative_id: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          fiscal_year_id?: string
          funding_source?: string | null
          funding_status?: string | null
          id?: string
          initiative_id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_budgets_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_budgets_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_collaborators: {
        Row: {
          budget_share: number | null
          created_at: string | null
          department_id: string
          id: string
          initiative_id: string
          resources_committed: string | null
          role: string
        }
        Insert: {
          budget_share?: number | null
          created_at?: string | null
          department_id: string
          id?: string
          initiative_id: string
          resources_committed?: string | null
          role: string
        }
        Update: {
          budget_share?: number | null
          created_at?: string | null
          department_id?: string
          id?: string
          initiative_id?: string
          resources_committed?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_collaborators_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_collaborators_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_initiative_id: string
          id: string
          initiative_id: string
          is_critical_path: boolean | null
          nature_of_dependency: string | null
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_initiative_id: string
          id?: string
          initiative_id: string
          is_critical_path?: boolean | null
          nature_of_dependency?: string | null
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_initiative_id?: string
          id?: string
          initiative_id?: string
          is_critical_path?: boolean | null
          nature_of_dependency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_dependencies_depends_on_initiative_id_fkey"
            columns: ["depends_on_initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_dependencies_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_kpis: {
        Row: {
          actual_values: Json | null
          baseline_value: string | null
          created_at: string | null
          data_source: string | null
          id: string
          initiative_id: string | null
          measurement_frequency: string | null
          metric_name: string
          responsible_party: string | null
          strategic_goal_id: string | null
          strategic_plan_id: string | null
          updated_at: string | null
          year_1_target: string | null
          year_2_target: string | null
          year_3_target: string | null
        }
        Insert: {
          actual_values?: Json | null
          baseline_value?: string | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          initiative_id?: string | null
          measurement_frequency?: string | null
          metric_name: string
          responsible_party?: string | null
          strategic_goal_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
          year_1_target?: string | null
          year_2_target?: string | null
          year_3_target?: string | null
        }
        Update: {
          actual_values?: Json | null
          baseline_value?: string | null
          created_at?: string | null
          data_source?: string | null
          id?: string
          initiative_id?: string | null
          measurement_frequency?: string | null
          metric_name?: string
          responsible_party?: string | null
          strategic_goal_id?: string | null
          strategic_plan_id?: string | null
          updated_at?: string | null
          year_1_target?: string | null
          year_2_target?: string | null
          year_3_target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_kpis_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_kpis_strategic_goal_id_fkey"
            columns: ["strategic_goal_id"]
            isOneToOne: false
            referencedRelation: "strategic_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_kpis_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          cost_benefit_analysis: Json | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          expected_outcomes: Json | null
          financial_analysis: Json | null
          fiscal_year_id: string
          id: string
          implementation_timeline: Json | null
          initiative_number: string
          lead_department_id: string
          name: string
          priority_level: string
          rank_within_priority: number | null
          rationale: string | null
          responsible_party: string | null
          risks: Json | null
          roi_analysis: Json | null
          status: string
          strategic_goal_id: string
          total_year_1_cost: number | null
          total_year_2_cost: number | null
          total_year_3_cost: number | null
          updated_at: string | null
        }
        Insert: {
          cost_benefit_analysis?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          expected_outcomes?: Json | null
          financial_analysis?: Json | null
          fiscal_year_id: string
          id?: string
          implementation_timeline?: Json | null
          initiative_number: string
          lead_department_id: string
          name: string
          priority_level: string
          rank_within_priority?: number | null
          rationale?: string | null
          responsible_party?: string | null
          risks?: Json | null
          roi_analysis?: Json | null
          status?: string
          strategic_goal_id: string
          total_year_1_cost?: number | null
          total_year_2_cost?: number | null
          total_year_3_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_benefit_analysis?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          expected_outcomes?: Json | null
          financial_analysis?: Json | null
          fiscal_year_id?: string
          id?: string
          implementation_timeline?: Json | null
          initiative_number?: string
          lead_department_id?: string
          name?: string
          priority_level?: string
          rank_within_priority?: number | null
          rationale?: string | null
          responsible_party?: string | null
          risks?: Json | null
          roi_analysis?: Json | null
          status?: string
          strategic_goal_id?: string
          total_year_1_cost?: number | null
          total_year_2_cost?: number | null
          total_year_3_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_lead_department_id_fkey"
            columns: ["lead_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_strategic_goal_id_fkey"
            columns: ["strategic_goal_id"]
            isOneToOne: false
            referencedRelation: "strategic_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      municipalities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          state: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          state: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quarterly_milestones: {
        Row: {
          budget_impact: number | null
          completion_date: string | null
          created_at: string | null
          fiscal_year_id: string
          id: string
          initiative_id: string
          milestone_description: string
          notes: string | null
          quarter: number
          responsible_party: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          budget_impact?: number | null
          completion_date?: string | null
          created_at?: string | null
          fiscal_year_id: string
          id?: string
          initiative_id: string
          milestone_description: string
          notes?: string | null
          quarter: number
          responsible_party?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          budget_impact?: number | null
          completion_date?: string | null
          created_at?: string | null
          fiscal_year_id?: string
          id?: string
          initiative_id?: string
          milestone_description?: string
          notes?: string | null
          quarter?: number
          responsible_party?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_milestones_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarterly_milestones_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_goals: {
        Row: {
          city_priority_alignment: string | null
          created_at: string | null
          description: string | null
          goal_number: number
          id: string
          objectives: Json | null
          strategic_plan_id: string
          success_measures: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          city_priority_alignment?: string | null
          created_at?: string | null
          description?: string | null
          goal_number: number
          id?: string
          objectives?: Json | null
          strategic_plan_id: string
          success_measures?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          city_priority_alignment?: string | null
          created_at?: string | null
          description?: string | null
          goal_number?: number
          id?: string
          objectives?: Json | null
          strategic_plan_id?: string
          success_measures?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_goals_strategic_plan_id_fkey"
            columns: ["strategic_plan_id"]
            isOneToOne: false
            referencedRelation: "strategic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          benchmarking_data: Json | null
          created_at: string | null
          created_by: string
          department_id: string
          department_vision: string | null
          end_fiscal_year_id: string
          environmental_scan: Json | null
          executive_summary: string | null
          id: string
          published_at: string | null
          start_fiscal_year_id: string
          status: string
          swot_analysis: Json | null
          title: string
          total_investment_amount: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          benchmarking_data?: Json | null
          created_at?: string | null
          created_by: string
          department_id: string
          department_vision?: string | null
          end_fiscal_year_id: string
          environmental_scan?: Json | null
          executive_summary?: string | null
          id?: string
          published_at?: string | null
          start_fiscal_year_id: string
          status?: string
          swot_analysis?: Json | null
          title: string
          total_investment_amount?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          benchmarking_data?: Json | null
          created_at?: string | null
          created_by?: string
          department_id?: string
          department_vision?: string | null
          end_fiscal_year_id?: string
          environmental_scan?: Json | null
          executive_summary?: string | null
          id?: string
          published_at?: string | null
          start_fiscal_year_id?: string
          status?: string
          swot_analysis?: Json | null
          title?: string
          total_investment_amount?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_end_fiscal_year_id_fkey"
            columns: ["end_fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_plans_start_fiscal_year_id_fkey"
            columns: ["start_fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          municipality_id: string
          preferences: Json | null
          role: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          municipality_id: string
          preferences?: Json | null
          role?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          municipality_id?: string
          preferences?: Json | null
          role?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin_or_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_department_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_municipality_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

