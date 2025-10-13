'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Widget, type DataSourceConfig, type WidgetConfig } from '@/lib/reporting/dashboard-engine'
import { Save, X, Database, Code, BarChart3, Settings2 } from 'lucide-react'

interface WidgetConfigDialogProps {
  widget: Widget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (widget: Widget) => void
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'donut', label: 'Donut Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
]

const DATA_SOURCE_TYPES = [
  { value: 'query', label: 'Database Query', icon: Database },
  { value: 'api', label: 'API Endpoint', icon: Code },
  { value: 'static', label: 'Static Data', icon: BarChart3 },
]

const FORMAT_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percentage', label: 'Percentage' },
]

const COLOR_SCHEMES = [
  { value: 'default', label: 'Default', colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'] },
  { value: 'blue', label: 'Blue', colors: ['#dbeafe', '#3b82f6', '#1d4ed8', '#1e40af'] },
  { value: 'green', label: 'Green', colors: ['#dcfce7', '#22c55e', '#15803d', '#166534'] },
  { value: 'purple', label: 'Purple', colors: ['#f3e8ff', '#a855f7', '#7c3aed', '#6d28d9'] },
]

export function WidgetConfigDialog({ widget, open, onOpenChange, onSave }: WidgetConfigDialogProps) {
  const [localWidget, setLocalWidget] = useState<Widget | null>(null)

  useEffect(() => {
    if (widget) {
      setLocalWidget({ ...widget })
    }
  }, [widget])

  if (!localWidget) {
    return null
  }

  const updateWidget = (updates: Partial<Widget>) => {
    setLocalWidget(prev => prev ? { ...prev, ...updates } : null)
  }

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setLocalWidget(prev => prev ? {
      ...prev,
      config: { ...prev.config, ...updates }
    } : null)
  }

  const updateDataSource = (updates: Partial<DataSourceConfig>) => {
    setLocalWidget(prev => prev ? {
      ...prev,
      dataSource: { ...prev.dataSource, ...updates }
    } : null)
  }

  const handleSave = () => {
    if (localWidget) {
      onSave(localWidget)
    }
  }

  const renderBasicSettings = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="widget-title">Widget Title</Label>
        <Input
          id="widget-title"
          value={localWidget.title}
          onChange={(e) => updateWidget({ title: e.target.value })}
          placeholder="Enter widget title"
        />
      </div>
      
      <div>
        <Label htmlFor="widget-description">Description</Label>
        <Textarea
          id="widget-description"
          value={localWidget.description || ''}
          onChange={(e) => updateWidget({ description: e.target.value })}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="widget-visible"
          checked={localWidget.visible}
          onCheckedChange={(checked) => updateWidget({ visible: checked })}
        />
        <Label htmlFor="widget-visible">Visible</Label>
      </div>
    </div>
  )

  const renderChartSettings = () => {
    if (localWidget.type !== 'chart') return null

    return (
      <div className="space-y-4">
        <div>
          <Label>Chart Type</Label>
          <Select
            value={localWidget.config.chartType || 'bar'}
            onValueChange={(value) => updateConfig({ chartType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              {CHART_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>X-Axis Field</Label>
            <Input
              value={localWidget.config.xAxis || ''}
              onChange={(e) => updateConfig({ xAxis: e.target.value })}
              placeholder="e.g., date, name"
            />
          </div>
          
          <div>
            <Label>Y-Axis Field</Label>
            <Input
              value={localWidget.config.yAxis || ''}
              onChange={(e) => updateConfig({ yAxis: e.target.value })}
              placeholder="e.g., value, amount"
            />
          </div>
        </div>

        <div>
          <Label>Color Scheme</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {COLOR_SCHEMES.map(scheme => (
              <Button
                key={scheme.value}
                variant={localWidget.config.colorScheme === scheme.value ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => updateConfig({ colorScheme: scheme.value })}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {scheme.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span>{scheme.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-grid"
              checked={localWidget.config.showGrid || false}
              onCheckedChange={(checked) => updateConfig({ showGrid: checked })}
            />
            <Label htmlFor="show-grid">Show Grid</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-legend"
              checked={localWidget.config.showLegend || false}
              onCheckedChange={(checked) => updateConfig({ showLegend: checked })}
            />
            <Label htmlFor="show-legend">Show Legend</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-labels"
              checked={localWidget.config.showLabels || false}
              onCheckedChange={(checked) => updateConfig({ showLabels: checked })}
            />
            <Label htmlFor="show-labels">Show Labels</Label>
          </div>
        </div>
      </div>
    )
  }

  const renderMetricSettings = () => {
    if (!['metric', 'kpi', 'gauge'].includes(localWidget.type)) return null

    return (
      <div className="space-y-4">
        <div>
          <Label>Format</Label>
          <Select
            value={localWidget.config.format || 'number'}
            onValueChange={(value) => updateConfig({ format: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {FORMAT_TYPES.map(format => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Value</Label>
          <Input
            type="number"
            value={localWidget.config.target || ''}
            onChange={(e) => updateConfig({ target: parseFloat(e.target.value) || undefined })}
            placeholder="Optional target value"
          />
        </div>

        {localWidget.type === 'gauge' && (
          <div className="space-y-2">
            <Label>Thresholds</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Warning (%)</Label>
                <Input
                  type="number"
                  value={localWidget.config.thresholds?.warning || ''}
                  onChange={(e) => updateConfig({ 
                    thresholds: { 
                      ...localWidget.config.thresholds, 
                      warning: parseFloat(e.target.value) || 70 
                    } 
                  })}
                  placeholder="70"
                />
              </div>
              <div>
                <Label className="text-xs">Critical (%)</Label>
                <Input
                  type="number"
                  value={localWidget.config.thresholds?.critical || ''}
                  onChange={(e) => updateConfig({ 
                    thresholds: { 
                      ...localWidget.config.thresholds, 
                      critical: parseFloat(e.target.value) || 90 
                    } 
                  })}
                  placeholder="90"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDataSourceSettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Data Source Type</Label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {DATA_SOURCE_TYPES.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={localWidget.dataSource.type === value ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => updateDataSource({ type: value as any })}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {localWidget.dataSource.type === 'query' && (
        <div>
          <Label>Database Query</Label>
          <Textarea
            value={localWidget.dataSource.query || ''}
            onChange={(e) => updateDataSource({ query: e.target.value })}
            placeholder="SELECT * FROM table_name WHERE..."
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use SQL query to fetch data from the database
          </p>
        </div>
      )}

      {localWidget.dataSource.type === 'api' && (
        <div>
          <Label>API Endpoint</Label>
          <Input
            value={localWidget.dataSource.apiEndpoint || ''}
            onChange={(e) => updateDataSource({ apiEndpoint: e.target.value })}
            placeholder="https://api.example.com/data"
          />
          <p className="text-xs text-gray-500 mt-1">
            REST API endpoint that returns JSON data
          </p>
        </div>
      )}

      {localWidget.dataSource.type === 'static' && (
        <div>
          <Label>Static Data (JSON)</Label>
          <Textarea
            value={JSON.stringify(localWidget.dataSource.staticData || [], null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value)
                updateDataSource({ staticData: data })
              } catch (error) {
                // Ignore invalid JSON while typing
              }
            }}
            placeholder='[{"name": "Item 1", "value": 100}, {"name": "Item 2", "value": 200}]'
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            JSON array of data objects
          </p>
        </div>
      )}

      <div>
        <Label>Cache Time (minutes)</Label>
        <Input
          type="number"
          value={localWidget.dataSource.cacheTime || ''}
          onChange={(e) => updateDataSource({ cacheTime: parseInt(e.target.value) || undefined })}
          placeholder="5"
        />
        <p className="text-xs text-gray-500 mt-1">
          How long to cache the data before refreshing
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings2 className="w-5 h-5" />
            <span>Configure Widget</span>
            <Badge variant="secondary" className="capitalize">
              {localWidget.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Configure the widget settings, data source, and appearance
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="data">Data Source</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {renderBasicSettings()}
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              {renderChartSettings()}
              {renderMetricSettings()}
              {!['chart', 'metric', 'kpi', 'gauge'].includes(localWidget.type) && (
                <div className="text-center py-8 text-gray-500">
                  <Settings2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No configuration options for this widget type</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              {renderDataSourceSettings()}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Widget Preview</CardTitle>
                  <CardDescription>
                    Preview of how your widget will appear on the dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Preview will be available when widget data is configured</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}