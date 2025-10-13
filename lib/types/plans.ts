export interface StrategicPlan {
  id: string
  title: string
  description: string
  department_id: string
  start_fiscal_year_id: string
  end_fiscal_year_id: string
  executive_summary?: string
  mission_statement?: string
  vision_statement?: string
  status: 'draft' | 'review' | 'approved' | 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
  created_by: string
  
  // Relations
  department?: {
    id: string
    name: string
    description: string
  }
  start_fiscal_year?: {
    id: string
    year: number
  }
  end_fiscal_year?: {
    id: string
    year: number
  }
  created_by_user?: {
    id: string
    full_name: string
    email: string
  }
  strategic_goals?: StrategicGoal[]
  
  // Collaboration metrics
  collaboration_stats?: {
    total_comments: number
    unread_comments: number
    active_collaborators: number
    last_activity: string
  }
}

export interface StrategicGoal {
  id: string
  strategic_plan_id: string
  title: string
  description: string
  target_outcome: string
  success_metrics: string[]
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold'
  target_completion_date?: string
  actual_completion_date?: string
  created_at: string
  updated_at: string
  
  // Relations
  initiatives?: Initiative[]
  
  // Collaboration metrics
  collaboration_stats?: {
    total_comments: number
    unread_comments: number
  }
}

export interface Initiative {
  id: string
  strategic_goal_id: string
  initiative_number: string
  name: string
  description: string
  justification: string
  priority_level: 'NEEDS' | 'WANTS' | 'NICE_TO_HAVES'
  department_priority_rank: number
  total_year_1_cost: number
  total_year_2_cost: number
  total_year_3_cost: number
  ongoing_operational_impact: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
  
  // Collaboration metrics
  collaboration_stats?: {
    total_comments: number
    unread_comments: number
  }
}

export interface PlanFilters {
  department_id?: string
  status?: StrategicPlan['status']
  fiscal_year?: string
  search?: string
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'status'
  sort_order?: 'asc' | 'desc'
}

export interface PlanFormData {
  title: string
  description: string
  department_id: string
  start_fiscal_year_id: string
  end_fiscal_year_id: string
  executive_summary?: string
  mission_statement?: string
  vision_statement?: string
  status: StrategicPlan['status']
}

export interface GoalFormData {
  title: string
  description: string
  target_outcome: string
  success_metrics: string[]
  priority: StrategicGoal['priority']
  target_completion_date?: string
}

export interface PlanCollaborationSession {
  sessionId: string
  resourceId: string
  resourceType: 'plan' | 'goal' | 'initiative'
  participants: Array<{
    userId: string
    name: string
    avatar?: string
    role: string
    presence: {
      status: 'active' | 'idle' | 'away'
      activity: 'viewing' | 'editing' | 'commenting'
      location: string
    }
  }>
}

// Plan status configuration
export const PLAN_STATUSES = {
  draft: { label: 'Draft', color: 'gray', description: 'Plan is being developed' },
  review: { label: 'Under Review', color: 'yellow', description: 'Plan is being reviewed' },
  approved: { label: 'Approved', color: 'green', description: 'Plan has been approved' },
  active: { label: 'Active', color: 'blue', description: 'Plan is currently active' },
  completed: { label: 'Completed', color: 'purple', description: 'Plan has been completed' },
  archived: { label: 'Archived', color: 'gray', description: 'Plan has been archived' }
} as const

// Goal priority configuration
export const GOAL_PRIORITIES = {
  high: { label: 'High Priority', color: 'red', description: 'Critical goal requiring immediate attention' },
  medium: { label: 'Medium Priority', color: 'yellow', description: 'Important goal with moderate urgency' },
  low: { label: 'Low Priority', color: 'green', description: 'Goal that can be addressed later' }
} as const

// Goal status configuration
export const GOAL_STATUSES = {
  not_started: { label: 'Not Started', color: 'gray', description: 'Goal has not been started' },
  in_progress: { label: 'In Progress', color: 'blue', description: 'Goal is actively being worked on' },
  completed: { label: 'Completed', color: 'green', description: 'Goal has been completed' },
  on_hold: { label: 'On Hold', color: 'orange', description: 'Goal is temporarily paused' }
} as const

// Initiative priority levels
export const INITIATIVE_PRIORITIES = {
  NEEDS: { label: 'Needs', color: 'red', description: 'Essential initiatives that must be funded' },
  WANTS: { label: 'Wants', color: 'yellow', description: 'Important initiatives that should be funded' },
  NICE_TO_HAVES: { label: 'Nice to Have', color: 'green', description: 'Desirable initiatives if funding allows' }
} as const