'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Save,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Move,
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Gauge,
  TrendingUp,
  Hash,
  Filter,
  Download,
  Share2,
  Layout as LayoutIcon,
  Grid3x3,
  Layers,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { type Dashboard, type Widget, type FilterConfig } from '@/lib/reporting/dashboard-engine'
import { DashboardWidget } from './DashboardWidget'
import { WidgetConfigDialog } from './WidgetConfigDialog'
import { FilterBar } from './FilterBar'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DashboardBuilderProps {
  dashboard?: Dashboard
  onSave: (dashboard: Dashboard) => void
  onCancel: () => void
  readOnly?: boolean
}

const WIDGET_TYPES = [
  { type: 'metric', icon: Hash, label: 'Metric', description: 'Display a single key metric' },
  { type: 'chart', icon: BarChart3, label: 'Chart', description: 'Various chart types for data visualization' },
  { type: 'table', icon: Table, label: 'Table', description: 'Tabular data display with sorting and filtering' },
  { type: 'gauge', icon: Gauge, label: 'Gauge', description: 'Progress gauge with thresholds' },
  { type: 'kpi', icon: TrendingUp, label: 'KPI', description: 'Key performance indicator with trend' },
  { type: 'progress', icon: LineChart, label: 'Progress', description: 'Progress bar with target comparison' },
]

export function DashboardBuilder({ dashboard: initialDashboard, onSave, onCancel, readOnly = false }: DashboardBuilderProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(
    initialDashboard || {
      id: '',
      name: 'New Dashboard',
      description: '',
      widgets: [],
      layout: 'grid',
      filters: [],
      permissions: { view: [], edit: [], admin: [] },
      isPublic: false,
      tags: [],
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  )

  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [showWidgetDialog, setShowWidgetDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})
  const [widgetData, setWidgetData] = useState<Record<string, unknown[]>>({})
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const gridRef = useRef<any>(null)

  // Convert widgets to grid layout format
  const getLayoutFromWidgets = useCallback((widgets: Widget[]) => {
    return widgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.width,
      h: widget.position.height,
      minW: 2,
      minH: 2,
    }))
  }, [])

  const [layouts, setLayouts] = useState(() => ({
    lg: getLayoutFromWidgets(dashboard.widgets),
  }))

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback((layout: Layout[]) => {
    if (readOnly) return

    setLayouts({ lg: layout })
    
    const updatedWidgets = dashboard.widgets.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          },
        }
      }
      return widget
    })

    setDashboard(prev => ({ ...prev, widgets: updatedWidgets }))
  }, [dashboard.widgets, readOnly])

  // Add new widget
  const handleAddWidget = useCallback((type: Widget['type']) => {
    if (readOnly) return

    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: {
        x: 0,
        y: Infinity,
        width: 6,
        height: 4,
      },
      config: {},
      dataSource: {
        type: 'static',
        staticData: [],
      },
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }))

    setLayouts(prev => ({
      ...prev,
      lg: [...prev.lg, {
        i: newWidget.id,
        x: 0,
        y: Infinity,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
      }],
    }))

    setSelectedWidget(newWidget)
    setShowWidgetDialog(true)
  }, [readOnly])

  // Edit widget
  const handleEditWidget = useCallback((widget: Widget) => {
    if (readOnly) return
    setSelectedWidget(widget)
    setShowWidgetDialog(true)
  }, [readOnly])

  // Update widget
  const handleUpdateWidget = useCallback((updatedWidget: Widget) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w),
    }))
    setSelectedWidget(null)
    setShowWidgetDialog(false)
    toast({
      title: 'Widget updated',
      description: 'Widget configuration has been saved.',
    })
  }, [toast])

  // Delete widget
  const handleDeleteWidget = useCallback((widgetId: string) => {
    if (readOnly) return
    
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
    }))

    setLayouts(prev => ({
      ...prev,
      lg: prev.lg.filter(item => item.i !== widgetId),
    }))

    toast({
      title: 'Widget deleted',
      description: 'Widget has been removed from the dashboard.',
    })
  }, [readOnly, toast])

  // Toggle widget visibility
  const handleToggleVisibility = useCallback((widgetId: string) => {
    if (readOnly) return
    
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      ),
    }))
  }, [readOnly])

  // Load widget data
  const loadWidgetData = useCallback(async (widget: Widget) => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboards/widget-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          widget,
          filters: activeFilters,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWidgetData(prev => ({ ...prev, [widget.id]: data.data }))
      }
    } catch (error) {
      console.error('Failed to load widget data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeFilters])

  // Load all widget data
  useEffect(() => {
    dashboard.widgets.forEach(widget => {
      if (widget.visible) {
        loadWidgetData(widget)
      }
    })
  }, [dashboard.widgets, loadWidgetData])

  // Handle filter changes
  const handleFilterChange = useCallback((filters: Record<string, unknown>) => {
    setActiveFilters(filters)
  }, [])

  // Save dashboard
  const handleSave = useCallback(() => {
    const updatedDashboard = {
      ...dashboard,
      updatedAt: new Date(),
    }
    onSave(updatedDashboard)
    toast({
      title: 'Dashboard saved',
      description: 'Your dashboard has been saved successfully.',
    })
  }, [dashboard, onSave, toast])

  if (previewMode) {
    return (
      <div className="h-full flex flex-col">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            <h1 className="text-2xl font-bold">{dashboard.name}</h1>
            {dashboard.description && (
              <p className="text-gray-600 text-sm">{dashboard.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Preview Mode</Badge>
            <Button variant="outline" onClick={() => setPreviewMode(false)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Filters */}
        {dashboard.filters.length > 0 && (
          <div className="p-4 border-b bg-gray-50">
            <FilterBar
              filters={dashboard.filters}
              values={activeFilters}
              onChange={handleFilterChange}
            />
          </div>
        )}

        {/* Dashboard Content */}
        <div className="flex-1 p-4">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            isDraggable={false}
            isResizable={false}
            margin={[16, 16]}
          >
            {dashboard.widgets
              .filter(widget => widget.visible)
              .map(widget => (
                <div key={widget.id}>
                  <DashboardWidget
                    widget={widget}
                    data={widgetData[widget.id] || []}
                    loading={loading}
                    readOnly={true}
                  />
                </div>
              ))}
          </ResponsiveGridLayout>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Dashboard Builder</h2>
          <p className="text-sm text-gray-600">Drag and drop widgets to build your dashboard</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="widgets" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Widget Types */}
          <TabsContent value="widgets" className="flex-1 p-4 space-y-2">
            <h3 className="font-medium mb-3">Add Widgets</h3>
            {WIDGET_TYPES.map(({ type, icon: Icon, label, description }) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleAddWidget(type as Widget['type'])}
                disabled={readOnly}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{description}</div>
                </div>
              </Button>
            ))}

            <Separator className="my-4" />

            {/* Widget List */}
            <h3 className="font-medium mb-3">Current Widgets ({dashboard.widgets.length})</h3>
            <div className="space-y-1">
              {dashboard.widgets.map(widget => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{widget.title}</div>
                      <div className="text-xs text-gray-500 capitalize">{widget.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(widget.id)}
                      disabled={readOnly}
                    >
                      {widget.visible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditWidget(widget)}
                      disabled={readOnly}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteWidget(widget.id)}
                      disabled={readOnly}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {dashboard.widgets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Grid3x3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No widgets added yet</p>
                  <p className="text-xs">Click on a widget type above to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Filters */}
          <TabsContent value="filters" className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Dashboard Filters</h3>
                <Button size="sm" disabled={readOnly}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
              </div>
              
              {dashboard.filters.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No filters configured</p>
                  <p className="text-xs">Add filters to enable interactive data exploration</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input
                  id="dashboard-name"
                  value={dashboard.name}
                  onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
                  disabled={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="dashboard-description">Description</Label>
                <Textarea
                  id="dashboard-description"
                  value={dashboard.description || ''}
                  onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
                  disabled={readOnly}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public-dashboard"
                  checked={dashboard.isPublic}
                  onCheckedChange={(checked) => setDashboard(prev => ({ ...prev, isPublic: checked }))}
                  disabled={readOnly}
                />
                <Label htmlFor="public-dashboard">Public Dashboard</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          <Button 
            className="w-full" 
            onClick={() => setPreviewMode(true)}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          {!readOnly && (
            <>
              <Button className="w-full" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Dashboard
              </Button>
              <Button className="w-full" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">{dashboard.name}</h1>
            <Badge variant="secondary">
              {dashboard.widgets.filter(w => w.visible).length} widgets
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" disabled={readOnly}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button size="sm" variant="outline" disabled={readOnly}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="outline" disabled={readOnly}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 bg-gray-50">
          {dashboard.widgets.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Start Building Your Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Add widgets from the sidebar to create your custom dashboard
                </p>
                <div className="flex justify-center space-x-2">
                  {WIDGET_TYPES.slice(0, 3).map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddWidget(type as Widget['type'])}
                      disabled={readOnly}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveGridLayout
              ref={gridRef}
              className="layout"
              layouts={layouts}
              onLayoutChange={handleLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              isDraggable={!readOnly}
              isResizable={!readOnly}
              margin={[16, 16]}
            >
              {dashboard.widgets
                .filter(widget => widget.visible)
                .map(widget => (
                  <div key={widget.id}>
                    <DashboardWidget
                      widget={widget}
                      data={widgetData[widget.id] || []}
                      loading={loading}
                      onEdit={() => handleEditWidget(widget)}
                      onDelete={() => handleDeleteWidget(widget.id)}
                      readOnly={readOnly}
                    />
                  </div>
                ))}
            </ResponsiveGridLayout>
          )}
        </div>
      </div>

      {/* Widget Configuration Dialog */}
      <WidgetConfigDialog
        widget={selectedWidget}
        open={showWidgetDialog}
        onOpenChange={setShowWidgetDialog}
        onSave={handleUpdateWidget}
      />
    </div>
  )
}