import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Target, Plus, Edit, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { CollaborationWrapper } from '@/components/collaboration'
import { StatusBadge } from '@/components/plans/StatusBadge'
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { StrategicPlan, StrategicGoal } from '@/lib/types/plans'

interface GoalsPageProps {
  params: {
    id: string
  }
}

// Mock data for demonstration
const mockPlan: StrategicPlan = {
  id: 'plan-1',
  title: 'Water & Field Services Strategic Plan FY2025-2027',
  description: 'Comprehensive strategic plan for water infrastructure and field operations.',
  department_id: 'dept-1',
  start_fiscal_year_id: 'fy-1',
  end_fiscal_year_id: 'fy-3',
  status: 'active',
  created_at: '2024-12-15T10:00:00Z',
  updated_at: '2025-01-10T14:30:00Z',
  created_by: 'user-1',
  
  department: {
    id: 'dept-1',
    name: 'Water & Field Services',
    description: 'Water infrastructure and field operations'
  },
  start_fiscal_year: { id: 'fy-1', year: 2025 },
  end_fiscal_year: { id: 'fy-3', year: 2027 }
}

const mockGoals: StrategicGoal[] = [
  {
    id: 'goal-1',
    strategic_plan_id: 'plan-1',
    title: 'Infrastructure Modernization',
    description: 'Upgrade aging water infrastructure to improve reliability and efficiency across the entire service area.',
    target_outcome: 'Reduce water main breaks by 30% and improve system pressure consistency to 95% within target range.',
    success_metrics: ['Water main break reduction', 'System pressure consistency', 'Customer satisfaction scores', 'Response time improvements'],
    priority: 'high',
    status: 'in_progress',
    target_completion_date: '2027-06-30',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2025-01-05T09:30:00Z',
    collaboration_stats: {
      total_comments: 12,
      unread_comments: 2
    },
    initiatives: [
      {
        id: 'init-1',
        strategic_goal_id: 'goal-1',
        initiative_number: 'WFS-001',
        name: 'Water Main Replacement Program',
        description: 'Replace aging water mains in critical areas',
        justification: 'Aging infrastructure causing frequent breaks',
        priority_level: 'NEEDS',
        department_priority_rank: 1,
        total_year_1_cost: 2500000,
        total_year_2_cost: 3000000,
        total_year_3_cost: 2000000,
        ongoing_operational_impact: 150000,
        status: 'in_progress',
        created_at: '2024-12-16T10:00:00Z',
        updated_at: '2025-01-03T14:20:00Z',
        collaboration_stats: {
          total_comments: 8,
          unread_comments: 1
        }
      }
    ]
  },
  {
    id: 'goal-2',
    strategic_plan_id: 'plan-1',
    title: 'Service Excellence',
    description: 'Enhance customer service delivery and response times for all field operations and service requests.',
    target_outcome: 'Achieve 95% customer satisfaction rating and maintain 24-hour response time for non-emergency requests.',
    success_metrics: ['Customer satisfaction scores', 'Response time metrics', 'First-call resolution rate', 'Service request completion rate'],
    priority: 'high',
    status: 'in_progress',
    target_completion_date: '2026-12-31',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2025-01-08T15:45:00Z',
    collaboration_stats: {
      total_comments: 8,
      unread_comments: 1
    },
    initiatives: [
      {
        id: 'init-2',
        strategic_goal_id: 'goal-2',
        initiative_number: 'WFS-002',
        name: 'Customer Service Portal Enhancement',
        description: 'Develop enhanced online portal for service requests',
        justification: 'Improve customer experience and operational efficiency',
        priority_level: 'WANTS',
        department_priority_rank: 2,
        total_year_1_cost: 150000,
        total_year_2_cost: 50000,
        total_year_3_cost: 25000,
        ongoing_operational_impact: 30000,
        status: 'under_review',
        created_at: '2024-12-18T11:30:00Z',
        updated_at: '2025-01-07T16:10:00Z',
        collaboration_stats: {
          total_comments: 5,
          unread_comments: 0
        }
      }
    ]
  },
  {
    id: 'goal-3',
    strategic_plan_id: 'plan-1',
    title: 'Environmental Sustainability',
    description: 'Implement sustainable practices and reduce the environmental impact of department operations.',
    target_outcome: 'Reduce water loss by 15% and successfully implement 3 major sustainability initiatives.',
    success_metrics: ['Water loss reduction percentage', 'Energy efficiency improvements', 'Sustainability initiatives completed', 'Carbon footprint reduction'],
    priority: 'medium',
    status: 'not_started',
    target_completion_date: '2027-03-31',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-20T11:15:00Z',
    collaboration_stats: {
      total_comments: 3,
      unread_comments: 0
    },
    initiatives: []
  }
]

function GoalsHeader({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href={`/plans/${plan.id}`} className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Plan
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Strategic Goals</h1>
            <StatusBadge status={plan.status} type="plan" />
          </div>
          
          <div className="text-lg text-gray-600 max-w-4xl mb-2">
            <Link href={`/plans/${plan.id}`} className="hover:underline font-medium">
              {plan.title}
            </Link>
          </div>
          
          <p className="text-gray-600">
            Manage and track the strategic goals that drive this plan's success
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>
    </div>
  )
}

function GoalCard({ goal }: { goal: StrategicGoal }) {
  const hasUnreadComments = (goal.collaboration_stats?.unread_comments || 0) > 0
  const isOverdue = goal.target_completion_date && isBefore(new Date(goal.target_completion_date), new Date()) && goal.status !== 'completed'
  const isDueSoon = goal.target_completion_date && isAfter(new Date(goal.target_completion_date), new Date()) && 
                    isBefore(new Date(goal.target_completion_date), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  // Calculate progress based on status
  const getProgress = (status: StrategicGoal['status']) => {
    switch (status) {
      case 'completed': return 100
      case 'in_progress': return 60
      case 'on_hold': return 30
      case 'not_started': return 0
      default: return 0
    }
  }

  const progress = getProgress(goal.status)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {goal.title}
              </h3>
              <StatusBadge status={goal.priority} type="goal-priority" />
              <StatusBadge status={goal.status} type="goal" />
              {hasUnreadComments && (
                <div className="w-2 h-2 bg-red-500 rounded-full" title="New comments" />
              )}
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {goal.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Target Outcome */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Target Outcome</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{goal.target_outcome}</p>
          </div>
          
          {/* Success Metrics */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Success Metrics</h4>
            <div className="flex flex-wrap gap-1">
              {goal.success_metrics.slice(0, 3).map((metric, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {metric}
                </Badge>
              ))}
              {goal.success_metrics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{goal.success_metrics.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Initiatives Count */}
          {goal.initiatives && goal.initiatives.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">
                    {goal.initiatives.length} Initiative{goal.initiatives.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ${goal.initiatives.reduce((sum, init) => sum + init.total_year_1_cost, 0).toLocaleString()} Year 1
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {goal.target_completion_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className={cn(
                    isOverdue && 'text-red-600 font-medium',
                    isDueSoon && 'text-orange-600 font-medium'
                  )}>
                    Due {format(new Date(goal.target_completion_date), 'MMM d, yyyy')}
                  </span>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      Overdue
                    </Badge>
                  )}
                  {isDueSoon && (
                    <Badge variant="outline" className="text-xs ml-1 border-orange-300 text-orange-700">
                      Due Soon
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{goal.collaboration_stats?.total_comments || 0} comments</span>
                {hasUnreadComments && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {goal.collaboration_stats.unread_comments} new
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/goals/${goal.id}/edit`}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/goals/${goal.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Import cn function for className utilities
import { cn } from '@/lib/utils'

function GoalsSummary({ goals }: { goals: StrategicGoal[] }) {
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const inProgressGoals = goals.filter(g => g.status === 'in_progress').length
  const notStartedGoals = goals.filter(g => g.status === 'not_started').length
  const onHoldGoals = goals.filter(g => g.status === 'on_hold').length
  
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-blue-600">{totalGoals}</div>
          <div className="text-sm text-gray-600">Total Goals</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-gray-600">{notStartedGoals}</div>
          <div className="text-sm text-gray-600">Not Started</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion</div>
        </CardContent>
      </Card>
    </div>
  )
}

async function GoalsContent({ params }: GoalsPageProps) {
  // TODO: Replace with real data fetching
  const plan = mockPlan
  const goals = mockGoals
  
  // Mock current user for collaboration
  const currentUser = {
    id: 'user-1',
    name: 'John Smith',
    avatar: 'https://avatar.vercel.sh/john'
  }

  return (
    <CollaborationWrapper
      resourceId={plan.id}
      resourceType="plan"
      currentUserId={currentUser.id}
      currentUserName={currentUser.name}
      currentUserAvatar={currentUser.avatar}
      onNavigate={(type, id) => {
        switch (type) {
          case 'goal':
            return `/goals/${id}`
          case 'initiative':
            return `/initiatives/${id}`
          case 'plan':
            return `/plans/${id}`
          default:
            return `/${type}s/${id}`
        }
      }}
      onInviteUser={() => {
        console.log('Invite user clicked')
      }}
      onMention={(userId) => {
        console.log('Mention user:', userId)
      }}
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <GoalsHeader plan={plan} />
        
        <GoalsSummary goals={goals} />

        {goals.length > 0 ? (
          <div className="grid gap-6">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Target className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Strategic Goals</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Strategic goals define the key objectives and outcomes this plan aims to achieve. 
                Add your first goal to get started.
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CollaborationWrapper>
  )
}

export default function GoalsPage({ params }: GoalsPageProps) {
  return (
    <Suspense fallback={<div>Loading strategic goals...</div>}>
      <GoalsContent params={params} />
    </Suspense>
  )
}