'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  Activity, 
  Zap, 
  Database, 
  Server, 
  Clock, 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Globe,
  Timer,
  Trash2,
  Archive,
  Download,
  Upload,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    performance?: {
      caching?: {
        enabled: boolean
        redis_url?: string
        cache_ttl?: number
        enable_query_cache?: boolean
        enable_page_cache?: boolean
        enable_api_cache?: boolean
      }
      database?: {
        enable_query_optimization?: boolean
        connection_pool_size?: number
        query_timeout?: number
        enable_slow_query_log?: boolean
        auto_vacuum?: boolean
      }
      monitoring?: {
        enabled: boolean
        log_level?: 'error' | 'warn' | 'info' | 'debug'
        enable_analytics?: boolean
        enable_error_tracking?: boolean
        performance_alerts?: boolean
        retention_days?: number
      }
      optimization?: {
        enable_compression?: boolean
        enable_minification?: boolean
        enable_lazy_loading?: boolean
        max_concurrent_requests?: number
        enable_cdn?: boolean
        cdn_url?: string
      }
    }
  } | null
}

interface PerformanceSettingsProps {
  municipality: Municipality
}

interface SystemMetrics {
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_io: { in: number; out: number }
  database_connections: number
  active_users: number
  response_time: number
  error_rate: number
  uptime: number
}

interface PerformanceStats {
  page_load_time: number
  api_response_time: number
  database_query_time: number
  cache_hit_rate: number
  total_requests: number
  successful_requests: number
  failed_requests: number
}

export function PerformanceSettings({ municipality }: PerformanceSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Mock system metrics (in real app, these would come from monitoring service)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 45,
    memory_usage: 62,
    disk_usage: 38,
    network_io: { in: 1.2, out: 0.8 },
    database_connections: 23,
    active_users: 142,
    response_time: 285,
    error_rate: 0.3,
    uptime: 99.8
  })

  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    page_load_time: 1.8,
    api_response_time: 120,
    database_query_time: 45,
    cache_hit_rate: 87,
    total_requests: 15420,
    successful_requests: 15374,
    failed_requests: 46
  })
  
  // Current performance settings
  const currentSettings = municipality.settings?.performance || {}
  const [settings, setSettings] = useState({
    caching: {
      enabled: true,
      redis_url: 'redis://localhost:6379',
      cache_ttl: 3600,
      enable_query_cache: true,
      enable_page_cache: true,
      enable_api_cache: true,
      ...currentSettings.caching
    },
    database: {
      enable_query_optimization: true,
      connection_pool_size: 20,
      query_timeout: 30000,
      enable_slow_query_log: true,
      auto_vacuum: true,
      ...currentSettings.database
    },
    monitoring: {
      enabled: true,
      log_level: 'info',
      enable_analytics: true,
      enable_error_tracking: true,
      performance_alerts: true,
      retention_days: 30,
      ...currentSettings.monitoring
    },
    optimization: {
      enable_compression: true,
      enable_minification: true,
      enable_lazy_loading: true,
      max_concurrent_requests: 100,
      enable_cdn: false,
      cdn_url: '',
      ...currentSettings.optimization
    }
  })

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { updatePerformanceSettings } = await import('@/app/actions/settings')
      const result = await updatePerformanceSettings(municipality.id, settings)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Performance settings updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to save performance settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const refreshMetrics = async () => {
    setRefreshing(true)
    try {
      // TODO: Implement actual metrics fetching
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate random metric updates
      setSystemMetrics(prev => ({
        ...prev,
        cpu_usage: Math.max(10, Math.min(90, prev.cpu_usage + (Math.random() - 0.5) * 10)),
        memory_usage: Math.max(20, Math.min(85, prev.memory_usage + (Math.random() - 0.5) * 8)),
        response_time: Math.max(100, Math.min(500, prev.response_time + (Math.random() - 0.5) * 50)),
        active_users: Math.max(50, prev.active_users + Math.floor((Math.random() - 0.5) * 20))
      }))
    } finally {
      setRefreshing(false)
    }
  }

  const clearCache = async () => {
    try {
      // TODO: Implement cache clearing
      await new Promise(resolve => setTimeout(resolve, 500))
      setSuccess('Cache cleared successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to clear cache')
    }
  }

  const optimizeDatabase = async () => {
    try {
      // TODO: Implement database optimization
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess('Database optimization completed!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Database optimization failed')
    }
  }

  // Auto-refresh metrics when monitoring is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isMonitoring) {
      interval = setInterval(() => {
        refreshMetrics()
      }, 10000) // Refresh every 10 seconds
    }
    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Performance Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor system performance, configure caching, and optimize application performance.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">{systemMetrics.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-600">{systemMetrics.active_users}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(systemMetrics.response_time, { good: 200, warning: 400 })}`}>
                  {systemMetrics.response_time}ms
                </p>
              </div>
              <Timer className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(systemMetrics.error_rate, { good: 1, warning: 3 })}`}>
                  {systemMetrics.error_rate}%
                </p>
              </div>
              {getStatusIcon(systemMetrics.error_rate, { good: 1, warning: 3 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="caching">Caching</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Live Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    System Resources
                  </CardTitle>
                  <CardDescription>Real-time system resource utilization</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className="flex items-center gap-2"
                  >
                    {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isMonitoring ? 'Stop' : 'Start'} Monitoring
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshMetrics}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        CPU Usage
                      </Label>
                      <span className={`font-semibold ${getStatusColor(systemMetrics.cpu_usage, { good: 50, warning: 80 })}`}>
                        {systemMetrics.cpu_usage}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.cpu_usage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4" />
                        Memory Usage
                      </Label>
                      <span className={`font-semibold ${getStatusColor(systemMetrics.memory_usage, { good: 60, warning: 80 })}`}>
                        {systemMetrics.memory_usage}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.memory_usage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Disk Usage
                      </Label>
                      <span className={`font-semibold ${getStatusColor(systemMetrics.disk_usage, { good: 50, warning: 80 })}`}>
                        {systemMetrics.disk_usage}%
                      </span>
                    </div>
                    <Progress value={systemMetrics.disk_usage} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Network I/O
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-green-50 rounded border">
                        <p className="text-xs text-gray-600">Inbound</p>
                        <p className="font-semibold text-green-700">{systemMetrics.network_io.in} MB/s</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded border">
                        <p className="text-xs text-gray-600">Outbound</p>
                        <p className="font-semibold text-blue-700">{systemMetrics.network_io.out} MB/s</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Database Connections
                    </Label>
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-2xl font-bold text-gray-700">{systemMetrics.database_connections}</p>
                      <p className="text-sm text-gray-500">Active connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Statistics
              </CardTitle>
              <CardDescription>Application performance metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Page Load Time</p>
                  <p className="text-xl font-bold text-blue-700">{performanceStats.page_load_time}s</p>
                  <Badge variant={performanceStats.page_load_time < 2 ? "default" : "destructive"} className="mt-1">
                    {performanceStats.page_load_time < 2 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                  <p className="text-xl font-bold text-green-700">{performanceStats.cache_hit_rate}%</p>
                  <Badge variant={performanceStats.cache_hit_rate > 80 ? "default" : "secondary"} className="mt-1">
                    {performanceStats.cache_hit_rate > 80 ? 'Excellent' : 'Fair'}
                  </Badge>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border">
                  <p className="text-sm text-gray-600">API Response</p>
                  <p className="text-xl font-bold text-purple-700">{performanceStats.api_response_time}ms</p>
                  <Badge variant={performanceStats.api_response_time < 200 ? "default" : "secondary"} className="mt-1">
                    {performanceStats.api_response_time < 200 ? 'Fast' : 'Average'}
                  </Badge>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border">
                  <p className="text-sm text-gray-600">DB Query Time</p>
                  <p className="text-xl font-bold text-orange-700">{performanceStats.database_query_time}ms</p>
                  <Badge variant={performanceStats.database_query_time < 50 ? "default" : "secondary"} className="mt-1">
                    {performanceStats.database_query_time < 50 ? 'Optimal' : 'Good'}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{performanceStats.total_requests.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Requests (24h)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{performanceStats.successful_requests.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Successful Requests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{performanceStats.failed_requests.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Failed Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Caching Tab */}
        <TabsContent value="caching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Cache Configuration
              </CardTitle>
              <CardDescription>
                Configure Redis caching and cache policies for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-gray-500">Use Redis for application caching</p>
                </div>
                <Switch 
                  checked={settings.caching.enabled}
                  onCheckedChange={(enabled) => 
                    setSettings(prev => ({
                      ...prev,
                      caching: { ...prev.caching, enabled }
                    }))
                  }
                />
              </div>

              {settings.caching.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Redis URL</Label>
                      <Input
                        value={settings.caching.redis_url}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          caching: { ...prev.caching, redis_url: e.target.value }
                        }))}
                        placeholder="redis://localhost:6379"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cache TTL (seconds)</Label>
                      <Input
                        type="number"
                        value={settings.caching.cache_ttl}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          caching: { ...prev.caching, cache_ttl: parseInt(e.target.value) || 3600 }
                        }))}
                        placeholder="3600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Cache Types</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Database Query Cache</Label>
                          <p className="text-sm text-gray-500">Cache database query results</p>
                        </div>
                        <Switch 
                          checked={settings.caching.enable_query_cache}
                          onCheckedChange={(enabled) => 
                            setSettings(prev => ({
                              ...prev,
                              caching: { ...prev.caching, enable_query_cache: enabled }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Page Cache</Label>
                          <p className="text-sm text-gray-500">Cache rendered page content</p>
                        </div>
                        <Switch 
                          checked={settings.caching.enable_page_cache}
                          onCheckedChange={(enabled) => 
                            setSettings(prev => ({
                              ...prev,
                              caching: { ...prev.caching, enable_page_cache: enabled }
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>API Response Cache</Label>
                          <p className="text-sm text-gray-500">Cache API endpoint responses</p>
                        </div>
                        <Switch 
                          checked={settings.caching.enable_api_cache}
                          onCheckedChange={(enabled) => 
                            setSettings(prev => ({
                              ...prev,
                              caching: { ...prev.caching, enable_api_cache: enabled }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={clearCache}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Cache
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Cache Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Database Optimization
              </CardTitle>
              <CardDescription>
                Configure database performance settings and optimization options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Query Optimization</Label>
                    <p className="text-sm text-gray-500">Enable automatic query optimization</p>
                  </div>
                  <Switch 
                    checked={settings.database.enable_query_optimization}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, enable_query_optimization: enabled }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slow Query Logging</Label>
                    <p className="text-sm text-gray-500">Log queries that take longer than usual</p>
                  </div>
                  <Switch 
                    checked={settings.database.enable_slow_query_log}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, enable_slow_query_log: enabled }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Vacuum</Label>
                    <p className="text-sm text-gray-500">Automatically optimize database storage</p>
                  </div>
                  <Switch 
                    checked={settings.database.auto_vacuum}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        database: { ...prev.database, auto_vacuum: enabled }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Connection Pool Size</Label>
                  <Input
                    type="number"
                    value={settings.database.connection_pool_size}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, connection_pool_size: parseInt(e.target.value) || 20 }
                    }))}
                    placeholder="20"
                  />
                  <p className="text-xs text-gray-500">Maximum number of database connections</p>
                </div>
                <div className="space-y-2">
                  <Label>Query Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={settings.database.query_timeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      database: { ...prev.database, query_timeout: parseInt(e.target.value) || 30000 }
                    }))}
                    placeholder="30000"
                  />
                  <p className="text-xs text-gray-500">Maximum time to wait for query execution</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={optimizeDatabase}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Optimize Database
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archive Old Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-600" />
                Application Optimization
              </CardTitle>
              <CardDescription>
                Configure application-level performance optimizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Compression</Label>
                    <p className="text-sm text-gray-500">Compress responses to reduce bandwidth</p>
                  </div>
                  <Switch 
                    checked={settings.optimization.enable_compression}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        optimization: { ...prev.optimization, enable_compression: enabled }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Minify Assets</Label>
                    <p className="text-sm text-gray-500">Minify CSS and JavaScript files</p>
                  </div>
                  <Switch 
                    checked={settings.optimization.enable_minification}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        optimization: { ...prev.optimization, enable_minification: enabled }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lazy Loading</Label>
                    <p className="text-sm text-gray-500">Load images and content on demand</p>
                  </div>
                  <Switch 
                    checked={settings.optimization.enable_lazy_loading}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        optimization: { ...prev.optimization, enable_lazy_loading: enabled }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable CDN</Label>
                    <p className="text-sm text-gray-500">Use Content Delivery Network for static assets</p>
                  </div>
                  <Switch 
                    checked={settings.optimization.enable_cdn}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        optimization: { ...prev.optimization, enable_cdn: enabled }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Concurrent Requests</Label>
                  <Input
                    type="number"
                    value={settings.optimization.max_concurrent_requests}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      optimization: { ...prev.optimization, max_concurrent_requests: parseInt(e.target.value) || 100 }
                    }))}
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500">Maximum simultaneous requests per user</p>
                </div>
                {settings.optimization.enable_cdn && (
                  <div className="space-y-2">
                    <Label>CDN URL</Label>
                    <Input
                      value={settings.optimization.cdn_url}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        optimization: { ...prev.optimization, cdn_url: e.target.value }
                      }))}
                      placeholder="https://cdn.example.com"
                    />
                    <p className="text-xs text-gray-500">CDN endpoint for static assets</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Monitoring & Analytics
              </CardTitle>
              <CardDescription>
                Configure performance monitoring and analytics collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Monitoring</Label>
                  <p className="text-sm text-gray-500">Track application performance and errors</p>
                </div>
                <Switch 
                  checked={settings.monitoring.enabled}
                  onCheckedChange={(enabled) => 
                    setSettings(prev => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, enabled }
                    }))
                  }
                />
              </div>

              {settings.monitoring.enabled && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Performance Analytics</Label>
                        <p className="text-sm text-gray-500">Collect user experience metrics</p>
                      </div>
                      <Switch 
                        checked={settings.monitoring.enable_analytics}
                        onCheckedChange={(enabled) => 
                          setSettings(prev => ({
                            ...prev,
                            monitoring: { ...prev.monitoring, enable_analytics: enabled }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Error Tracking</Label>
                        <p className="text-sm text-gray-500">Automatically log application errors</p>
                      </div>
                      <Switch 
                        checked={settings.monitoring.enable_error_tracking}
                        onCheckedChange={(enabled) => 
                          setSettings(prev => ({
                            ...prev,
                            monitoring: { ...prev.monitoring, enable_error_tracking: enabled }
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Performance Alerts</Label>
                        <p className="text-sm text-gray-500">Send alerts for performance issues</p>
                      </div>
                      <Switch 
                        checked={settings.monitoring.performance_alerts}
                        onCheckedChange={(enabled) => 
                          setSettings(prev => ({
                            ...prev,
                            monitoring: { ...prev.monitoring, performance_alerts: enabled }
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Log Level</Label>
                      <Select 
                        value={settings.monitoring.log_level}
                        onValueChange={(value: 'error' | 'warn' | 'info' | 'debug') => 
                          setSettings(prev => ({
                            ...prev,
                            monitoring: { ...prev.monitoring, log_level: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">Error Only</SelectItem>
                          <SelectItem value="warn">Warning & Above</SelectItem>
                          <SelectItem value="info">Info & Above</SelectItem>
                          <SelectItem value="debug">All Logs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Retention (days)</Label>
                      <Input
                        type="number"
                        value={settings.monitoring.retention_days}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          monitoring: { ...prev.monitoring, retention_days: parseInt(e.target.value) || 30 }
                        }))}
                        placeholder="30"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          <p>Performance changes may require application restart to take full effect.</p>
          <p>Some optimizations will be applied immediately upon saving.</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Save Performance Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
