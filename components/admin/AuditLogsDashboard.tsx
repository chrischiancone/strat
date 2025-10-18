'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangleIcon,
  ActivityIcon,
  UsersIcon,
  ShieldIcon,
  TrendingUpIcon,
  ClockIcon,
  DatabaseIcon,
  EyeIcon
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { getAuditDashboardStats, getUserActivitySummary, detectSecurityEvents } from '@/app/actions/audit-dashboard'

type UserActivitySummary = {
  user_id: string
  user_name: string | null
  action_count: number
  last_activity: string
}

type SecurityEvent = {
  type: string
  severity: string
  description: string
  timestamp: string
  user_id: string | null
  user_name: string | null
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardStats {
  totalLogs: number
  logsToday: number
  logsThisWeek: number
  activeUsers: number
  topActions: Array<{ action: string; count: number }>
  recentActivity: Array<{
    id: string
    table_name: string
    action: string
    user_name: string | null
    changed_at: string
  }>
}

export function AuditLogsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivitySummary[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, userActivityData, securityEventsData] = await Promise.all([
        getAuditDashboardStats(),
        getUserActivitySummary(10),
        detectSecurityEvents(24)
      ])

      setStats(dashboardStats)
      setUserActivity(userActivityData)
      setSecurityEvents(securityEventsData)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load audit dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'insert': return 'bg-green-100 text-green-800'
      case 'update': return 'bg-blue-100 text-blue-800'
      case 'delete': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Chart data
  const actionsChartData = {
    labels: stats?.topActions.map(a => a.action.replace('_', ' ')) || [],
    datasets: [
      {
        label: 'Action Count',
        data: stats?.topActions.map(a => a.count) || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 0,
      },
    ],
  }

  const activityTrendData = {
    labels: Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }),
    datasets: [
      {
        label: 'Daily Activity',
        data: [65, 59, 80, 81, 56, 55, 40], // This would come from real data
        fill: false,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        tension: 0.1,
      },
    ],
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.logsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats && stats.logsToday > 0 ? '+' : ''}
              {((stats?.logsToday || 0) / Math.max(stats?.logsThisWeek || 1, 1) * 100).toFixed(1)}% of week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Actions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Actions (This Week)</CardTitle>
                <CardDescription>Most frequent audit log actions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topActions && stats.topActions.length > 0 ? (
                  <div className="h-64">
                    <Doughnut 
                      data={actionsChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest audit log entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={getActionColor(activity.action)}>
                          {activity.action}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.user_name || 'System'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.table_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.changed_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trend</CardTitle>
              <CardDescription>Daily audit log activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line 
                  data={activityTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
              <CardDescription>Most active users based on audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.tables_modified} tables modified
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold">{user.total_actions}</p>
                      <p className="text-xs text-muted-foreground">total actions</p>
                      <div className="flex space-x-1 text-xs">
                        <span className="text-green-600">{user.total_creates}C</span>
                        <span className="text-blue-600">{user.total_updates}U</span>
                        <span className="text-red-600">{user.total_deletes}D</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Detected security events from audit log analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length > 0 ? (
                <div className="space-y-4">
                  {securityEvents.map((event, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="font-medium">{event.type.replace('_', ' ')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.detected_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      {event.user_id && (
                        <p className="text-xs text-muted-foreground">
                          User: {event.user_id} • IP: {event.ip_address || 'Unknown'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No security events detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    System appears to be operating normally
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Reports</CardTitle>
              <CardDescription>Generate and download audit reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUpIcon className="h-6 w-6 mb-2" />
                  <span>Weekly Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <UsersIcon className="h-6 w-6 mb-2" />
                  <span>User Activity Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ShieldIcon className="h-6 w-6 mb-2" />
                  <span>Security Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ClockIcon className="h-6 w-6 mb-2" />
                  <span>Compliance Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}