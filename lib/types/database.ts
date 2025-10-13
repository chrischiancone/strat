/**
 * Database entity types for the Strategic Planning application
 * These types mirror the Supabase database schema
 */

// Base types
export type UUID = string
export type DatabaseDate = string
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// User and Authentication
export interface User {
  id: UUID
  municipality_id: UUID
  full_name: string | null
  email: string | null
  role: UserRole
  title: string | null
  department_id: UUID | null
  is_active: boolean | null
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

export type UserRole = 'admin' | 'finance' | 'city_manager' | 'department_head' | 'staff'

export interface UserWithDepartment extends User {
  department_name: string | null
}

// Department
export interface Department {
  id: UUID
  municipality_id: UUID
  name: string
  description: string | null
  is_active: boolean
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Municipality
export interface Municipality {
  id: UUID
  name: string
  state: string | null
  created_at: DatabaseDate
}

// Fiscal Year
export interface FiscalYear {
  id: UUID
  municipality_id: UUID
  year: number
  start_date: DatabaseDate
  end_date: DatabaseDate
  is_current: boolean
  created_at: DatabaseDate
}

// Strategic Plan
export interface StrategicPlan {
  id: UUID
  municipality_id: UUID
  department_id: UUID
  title: string | null
  mission_statement: string | null
  vision_statement: string | null
  start_fiscal_year_id: UUID
  end_fiscal_year_id: UUID
  status: PlanStatus
  created_by: UUID
  swot_analysis: SwotAnalysis | null
  environmental_scan: EnvironmentalScan | null
  benchmarking_data: BenchmarkingData | null
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

export type PlanStatus = 'draft' | 'active' | 'inactive' | 'archived'

export interface SwotAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface EnvironmentalScan {
  political: string[]
  economic: string[]
  social: string[]
  technological: string[]
  environmental: string[]
  legal: string[]
}

export interface BenchmarkingData {
  competitors: Array<{
    name: string
    strengths: string[]
    metrics: Record<string, string | number>
  }>
  best_practices: string[]
}

// Strategic Goal
export interface StrategicGoal {
  id: UUID
  strategic_plan_id: UUID
  title: string
  description: string | null
  goal_order: number
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Initiative
export interface Initiative {
  id: UUID
  strategic_goal_id: UUID
  name: string
  description: string | null
  priority_level: PriorityLevel
  status: InitiativeStatus
  year_1_cost: number | null
  year_2_cost: number | null
  year_3_cost: number | null
  total_year_1_cost: number | null
  total_year_2_cost: number | null
  total_year_3_cost: number | null
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

export type PriorityLevel = 'NEED' | 'WANT' | 'NICE_TO_HAVE'
export type InitiativeStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'deferred'

// Initiative Budget
export interface InitiativeBudget {
  id: UUID
  initiative_id: UUID
  source_name: string
  amount: number
  year: number
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Initiative KPI
export interface InitiativeKpi {
  id: UUID
  strategic_plan_id: UUID | null
  strategic_goal_id: UUID | null
  initiative_id: UUID | null
  metric_name: string
  baseline_value: string
  year_1_target: string
  year_2_target: string
  year_3_target: string
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Council Goals
export interface CouncilGoal {
  id: UUID
  municipality_id: UUID
  title: string
  description: string | null
  goal_order: number
  is_active: boolean
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Comments
export interface Comment {
  id: UUID
  strategic_plan_id: UUID | null
  strategic_goal_id: UUID | null
  initiative_id: UUID | null
  user_id: UUID
  content: string
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Audit Logs
export interface AuditLog {
  id: UUID
  user_id: UUID | null
  action: string
  table_name: string | null
  record_id: UUID | null
  old_values: Json | null
  new_values: Json | null
  created_at: DatabaseDate
}

// Budget Category
export interface BudgetCategory {
  id: UUID
  municipality_id: UUID
  name: string
  description: string | null
  is_active: boolean
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Funding Source
export interface FundingSource {
  id: UUID
  municipality_id: UUID
  name: string
  description: string | null
  source_type: string | null
  is_active: boolean
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

// Dashboard Message
export interface DashboardMessage {
  id: UUID
  municipality_id: UUID
  title: string
  content: string
  priority: MessagePriority
  is_active: boolean
  starts_at: DatabaseDate | null
  ends_at: DatabaseDate | null
  created_by: UUID
  created_at: DatabaseDate
  updated_at: DatabaseDate | null
}

export type MessagePriority = 'low' | 'medium' | 'high'

// Extended types with relations
export interface StrategicPlanWithRelations extends StrategicPlan {
  departments: Pick<Department, 'name'>
  start_fiscal_year: Pick<FiscalYear, 'year'>
  end_fiscal_year: Pick<FiscalYear, 'year'>
  created_by_user?: Pick<User, 'full_name' | 'email'>
}

export interface StrategicGoalWithRelations extends StrategicGoal {
  strategic_plans: Pick<StrategicPlan, 'title'>
  initiatives?: InitiativeWithRelations[]
}

export interface InitiativeWithRelations extends Initiative {
  strategic_goals: Pick<StrategicGoal, 'title'>
  initiative_budgets?: InitiativeBudget[]
  initiative_kpis?: InitiativeKpi[]
}

export interface InitiativeKpiWithRelations extends InitiativeKpi {
  initiatives?: Pick<Initiative, 'name'>
  strategic_goals?: Pick<StrategicGoal, 'title'>
}

export interface CommentWithUser extends Comment {
  users: Pick<User, 'full_name' | 'email'>
}

// Form input types
export interface CreateStrategicPlanInput {
  title: string
  mission_statement?: string
  vision_statement?: string
  department_id: UUID
  start_fiscal_year_id: UUID
  end_fiscal_year_id: UUID
}

export interface UpdateStrategicPlanInput extends Partial<CreateStrategicPlanInput> {
  status?: PlanStatus
  swot_analysis?: SwotAnalysis
  environmental_scan?: EnvironmentalScan
  benchmarking_data?: BenchmarkingData
}

export interface CreateInitiativeInput {
  strategic_goal_id: UUID
  name: string
  description?: string
  priority_level: PriorityLevel
  year_1_cost?: number
  year_2_cost?: number
  year_3_cost?: number
}

export interface UpdateInitiativeInput extends Partial<CreateInitiativeInput> {
  status?: InitiativeStatus
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Query filter types
export interface BaseFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface PlanFilters extends BaseFilters {
  status?: PlanStatus
  department_id?: UUID
  fiscal_year_id?: UUID
}

export interface InitiativeFilters extends BaseFilters {
  status?: InitiativeStatus
  priority_level?: PriorityLevel
  strategic_goal_id?: UUID
  strategic_plan_id?: UUID
}

export interface UserFilters extends BaseFilters {
  role?: UserRole
  department_id?: UUID
  is_active?: boolean
}

// Dashboard types
export interface DashboardStats {
  totalPlans: number
  activePlans: number
  totalInitiatives: number
  activeInitiatives: number
  totalBudget: number
}

export interface InitiativesByPriority {
  NEED: number
  WANT: number
  NICE_TO_HAVE: number
}

export interface InitiativesByStatus {
  not_started: number
  in_progress: number
  at_risk: number
  completed: number
  deferred: number
}

export interface BudgetByYear {
  year_1: number
  year_2: number
  year_3: number
}

export interface BudgetByFundingSource {
  source_name: string
  total: number
}

// Utility types
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Database query result types (for handling Supabase responses)
export interface QueryResult<T> {
  data: T | null
  error: Error | null
}

export interface QueryListResult<T> {
  data: T[] | null
  error: Error | null
  count?: number | null
}

// Type guards
export function isValidUserRole(role: string): role is UserRole {
  return ['admin', 'finance', 'city_manager', 'department_head', 'staff'].includes(role)
}

export function isValidPlanStatus(status: string): status is PlanStatus {
  return ['draft', 'active', 'inactive', 'archived'].includes(status)
}

export function isValidInitiativeStatus(status: string): status is InitiativeStatus {
  return ['not_started', 'in_progress', 'at_risk', 'completed', 'deferred'].includes(status)
}

export function isValidPriorityLevel(priority: string): priority is PriorityLevel {
  return ['NEED', 'WANT', 'NICE_TO_HAVE'].includes(priority)
}