/**
 * Advanced Dashboard & Reporting Engine
 * Provides dynamic dashboard creation, custom report building, and export capabilities
 */

import { logger } from '../logger'
import { createError } from '../errorHandler'
import { createServerSupabaseClient } from '../supabase/server'

// Types for Dashboard & Reporting
export interface Widget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'list' | 'progress' | 'gauge' | 'heatmap' | 'kpi'
  title: string
  description?: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: WidgetConfig
  dataSource: DataSourceConfig
  filters?: FilterConfig[]
  refreshInterval?: number // minutes
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WidgetConfig {
  // Chart specific
  chartType?: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'radar'
  xAxis?: string
  yAxis?: string
  groupBy?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  
  // Table specific
  columns?: TableColumn[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  pagination?: boolean
  pageSize?: number
  
  // Styling
  colorScheme?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  
  // KPI/Metric specific
  format?: 'number' | 'currency' | 'percentage'
  target?: number
  thresholds?: {
    warning: number
    critical: number
  }
}

export interface DataSourceConfig {
  type: 'query' | 'api' | 'static'
  query?: string
  apiEndpoint?: string
  staticData?: unknown[]
  parameters?: Record<string, unknown>
  cacheTime?: number // minutes
}

export interface TableColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'status' | 'link'
  width?: number
  sortable?: boolean
  filterable?: boolean
  format?: string
}

export interface FilterConfig {
  id: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text'
  field: string
  label: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: unknown
  required?: boolean
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: Widget[]
  layout: 'grid' | 'masonry' | 'tabs'
  filters: FilterConfig[]
  permissions: {
    view: string[]
    edit: string[]
    admin: string[]
  }
  isPublic: boolean
  tags: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  id: string
  name: string
  description?: string
  type: 'scheduled' | 'on-demand' | 'real-time'
  template: ReportTemplate
  parameters: Record<string, unknown>
  schedule?: ScheduleConfig
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  createdBy: string
  createdAt: Date
  lastRun?: Date
}

export interface ReportTemplate {
  sections: ReportSection[]
  header?: ReportHeader
  footer?: ReportFooter
  styling: ReportStyling
}

export interface ReportSection {
  id: string
  type: 'text' | 'chart' | 'table' | 'metrics' | 'image'
  title?: string
  content: unknown
  dataSource?: DataSourceConfig
  config?: WidgetConfig
}

export interface ReportHeader {
  logo?: string
  title: string
  subtitle?: string
  showDate: boolean
  showPageNumbers: boolean
}

export interface ReportFooter {
  text?: string
  showGenerated: boolean
  contactInfo?: string
}

export interface ReportStyling {
  theme: 'light' | 'dark' | 'branded'
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string // HH:MM format
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  timezone: string
}

// Main Dashboard Engine Class
export class DashboardEngine {
  private static instance: DashboardEngine
  
  static getInstance(): DashboardEngine {
    if (!DashboardEngine.instance) {
      DashboardEngine.instance = new DashboardEngine()
    }
    return DashboardEngine.instance
  }

  // Dashboard Management
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    try {
      const supabase = createServerSupabaseClient()
      
      const newDashboard: Dashboard = {
        ...dashboard,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { error } = await supabase
        .from('dashboards')
        .insert({
          id: newDashboard.id,
          name: newDashboard.name,
          description: newDashboard.description,
          widgets: newDashboard.widgets,
          layout: newDashboard.layout,
          filters: newDashboard.filters,
          permissions: newDashboard.permissions,
          is_public: newDashboard.isPublic,
          tags: newDashboard.tags,
          created_by: newDashboard.createdBy,
          created_at: newDashboard.createdAt,
          updated_at: newDashboard.updatedAt,
        })

      if (error) throw error

      logger.info('Dashboard created successfully', { 
        dashboardId: newDashboard.id,
        name: newDashboard.name 
      })

      return newDashboard
    } catch (error) {
      logger.error('Failed to create dashboard', { error })
      throw createError.server('Failed to create dashboard')
    }
  }

  async getDashboard(id: string, userId: string): Promise<Dashboard | null> {
    try {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Check permissions
      const dashboard: Dashboard = {
        id: data.id,
        name: data.name,
        description: data.description,
        widgets: data.widgets,
        layout: data.layout,
        filters: data.filters,
        permissions: data.permissions,
        isPublic: data.is_public,
        tags: data.tags,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      if (!this.hasPermission(dashboard, userId, 'view')) {
        throw createError.forbidden('Access denied to this dashboard')
      }

      return dashboard
    } catch (error) {
      logger.error('Failed to get dashboard', { error, dashboardId: id })
      throw createError.server('Failed to retrieve dashboard')
    }
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>, userId: string): Promise<Dashboard> {
    try {
      const dashboard = await this.getDashboard(id, userId)
      if (!dashboard) {
        throw createError.notFound('Dashboard not found')
      }

      if (!this.hasPermission(dashboard, userId, 'edit')) {
        throw createError.forbidden('No permission to edit this dashboard')
      }

      const supabase = createServerSupabaseClient()
      
      const updatedDashboard = {
        ...dashboard,
        ...updates,
        updatedAt: new Date(),
      }

      const { error } = await supabase
        .from('dashboards')
        .update({
          name: updatedDashboard.name,
          description: updatedDashboard.description,
          widgets: updatedDashboard.widgets,
          layout: updatedDashboard.layout,
          filters: updatedDashboard.filters,
          permissions: updatedDashboard.permissions,
          is_public: updatedDashboard.isPublic,
          tags: updatedDashboard.tags,
          updated_at: updatedDashboard.updatedAt,
        })
        .eq('id', id)

      if (error) throw error

      logger.info('Dashboard updated successfully', { 
        dashboardId: id,
        updatedBy: userId 
      })

      return updatedDashboard
    } catch (error) {
      logger.error('Failed to update dashboard', { error, dashboardId: id })
      throw createError.server('Failed to update dashboard')
    }
  }

  async deleteDashboard(id: string, userId: string): Promise<void> {
    try {
      const dashboard = await this.getDashboard(id, userId)
      if (!dashboard) {
        throw createError.notFound('Dashboard not found')
      }

      if (!this.hasPermission(dashboard, userId, 'admin')) {
        throw createError.forbidden('No permission to delete this dashboard')
      }

      const supabase = createServerSupabaseClient()
      
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id)

      if (error) throw error

      logger.info('Dashboard deleted successfully', { 
        dashboardId: id,
        deletedBy: userId 
      })
    } catch (error) {
      logger.error('Failed to delete dashboard', { error, dashboardId: id })
      throw createError.server('Failed to delete dashboard')
    }
  }

  // Widget Management
  async addWidget(dashboardId: string, widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Widget> {
    try {
      const dashboard = await this.getDashboard(dashboardId, userId)
      if (!dashboard) {
        throw createError.notFound('Dashboard not found')
      }

      if (!this.hasPermission(dashboard, userId, 'edit')) {
        throw createError.forbidden('No permission to edit this dashboard')
      }

      const newWidget: Widget = {
        ...widget,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      dashboard.widgets.push(newWidget)
      await this.updateDashboard(dashboardId, { widgets: dashboard.widgets }, userId)

      logger.info('Widget added to dashboard', { 
        dashboardId, 
        widgetId: newWidget.id,
        addedBy: userId 
      })

      return newWidget
    } catch (error) {
      logger.error('Failed to add widget', { error, dashboardId })
      throw createError.server('Failed to add widget')
    }
  }

  async updateWidget(dashboardId: string, widgetId: string, updates: Partial<Widget>, userId: string): Promise<Widget> {
    try {
      const dashboard = await this.getDashboard(dashboardId, userId)
      if (!dashboard) {
        throw createError.notFound('Dashboard not found')
      }

      if (!this.hasPermission(dashboard, userId, 'edit')) {
        throw createError.forbidden('No permission to edit this dashboard')
      }

      const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId)
      if (widgetIndex === -1) {
        throw createError.notFound('Widget not found')
      }

      const updatedWidget = {
        ...dashboard.widgets[widgetIndex],
        ...updates,
        updatedAt: new Date(),
      }

      dashboard.widgets[widgetIndex] = updatedWidget
      await this.updateDashboard(dashboardId, { widgets: dashboard.widgets }, userId)

      logger.info('Widget updated', { 
        dashboardId, 
        widgetId,
        updatedBy: userId 
      })

      return updatedWidget
    } catch (error) {
      logger.error('Failed to update widget', { error, dashboardId, widgetId })
      throw createError.server('Failed to update widget')
    }
  }

  async removeWidget(dashboardId: string, widgetId: string, userId: string): Promise<void> {
    try {
      const dashboard = await this.getDashboard(dashboardId, userId)
      if (!dashboard) {
        throw createError.notFound('Dashboard not found')
      }

      if (!this.hasPermission(dashboard, userId, 'edit')) {
        throw createError.forbidden('No permission to edit this dashboard')
      }

      dashboard.widgets = dashboard.widgets.filter(w => w.id !== widgetId)
      await this.updateDashboard(dashboardId, { widgets: dashboard.widgets }, userId)

      logger.info('Widget removed from dashboard', { 
        dashboardId, 
        widgetId,
        removedBy: userId 
      })
    } catch (error) {
      logger.error('Failed to remove widget', { error, dashboardId, widgetId })
      throw createError.server('Failed to remove widget')
    }
  }

  // Data Fetching for Widgets
  async getWidgetData(widget: Widget, filters: Record<string, unknown> = {}): Promise<unknown[]> {
    try {
      const { dataSource } = widget
      
      switch (dataSource.type) {
        case 'query':
          return await this.executeQuery(dataSource.query!, { ...dataSource.parameters, ...filters })
        
        case 'api':
          return await this.fetchApiData(dataSource.apiEndpoint!, { ...dataSource.parameters, ...filters })
        
        case 'static':
          return dataSource.staticData || []
        
        default:
          throw new Error(`Unsupported data source type: ${dataSource.type}`)
      }
    } catch (error) {
      logger.error('Failed to get widget data', { error, widgetId: widget.id })
      return []
    }
  }

  private async executeQuery(query: string, parameters: Record<string, unknown> = {}): Promise<unknown[]> {
    const supabase = createServerSupabaseClient()
    
    // Replace parameters in query
    let processedQuery = query
    Object.entries(parameters).forEach(([key, value]) => {
      processedQuery = processedQuery.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value))
    })

    const { data, error } = await supabase.rpc('execute_dashboard_query', { 
      query_text: processedQuery 
    })

    if (error) throw error
    return data || []
  }

  private async fetchApiData(endpoint: string, parameters: Record<string, unknown> = {}): Promise<unknown[]> {
    const url = new URL(endpoint)
    
    // Add parameters as query params
    Object.entries(parameters).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return await response.json()
  }

  // Report Management
  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'lastRun'>): Promise<Report> {
    try {
      const newReport: Report = {
        ...report,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      const supabase = createServerSupabaseClient()
      
      const { error } = await supabase
        .from('reports')
        .insert({
          id: newReport.id,
          name: newReport.name,
          description: newReport.description,
          type: newReport.type,
          template: newReport.template,
          parameters: newReport.parameters,
          schedule: newReport.schedule,
          recipients: newReport.recipients,
          format: newReport.format,
          created_by: newReport.createdBy,
          created_at: newReport.createdAt,
        })

      if (error) throw error

      logger.info('Report created successfully', { 
        reportId: newReport.id,
        name: newReport.name 
      })

      return newReport
    } catch (error) {
      logger.error('Failed to create report', { error })
      throw createError.server('Failed to create report')
    }
  }

  async generateReport(reportId: string, parameters: Record<string, unknown> = {}): Promise<Buffer> {
    try {
      const supabase = createServerSupabaseClient()
      
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) throw error

      // Generate report content based on template
      const reportData = await this.processReportTemplate(report.template, {
        ...report.parameters,
        ...parameters
      })

      // Convert to requested format
      const buffer = await this.exportReport(reportData, report.format, report.template.styling)

      // Update last run time
      await supabase
        .from('reports')
        .update({ last_run: new Date() })
        .eq('id', reportId)

      logger.info('Report generated successfully', { 
        reportId,
        format: report.format 
      })

      return buffer
    } catch (error) {
      logger.error('Failed to generate report', { error, reportId })
      throw createError.server('Failed to generate report')
    }
  }

  private async processReportTemplate(template: ReportTemplate, parameters: Record<string, unknown>): Promise<unknown> {
    const processedSections = await Promise.all(
      template.sections.map(async (section) => {
        if (section.dataSource) {
          const data = await this.getDataForReport(section.dataSource, parameters)
          return {
            ...section,
            data,
          }
        }
        return section
      })
    )

    return {
      ...template,
      sections: processedSections,
      generatedAt: new Date(),
      parameters,
    }
  }

  private async getDataForReport(dataSource: DataSourceConfig, parameters: Record<string, unknown>): Promise<unknown[]> {
    switch (dataSource.type) {
      case 'query':
        return await this.executeQuery(dataSource.query!, { ...dataSource.parameters, ...parameters })
      
      case 'api':
        return await this.fetchApiData(dataSource.apiEndpoint!, { ...dataSource.parameters, ...parameters })
      
      case 'static':
        return dataSource.staticData || []
      
      default:
        return []
    }
  }

  private async exportReport(data: unknown, format: string, styling: ReportStyling): Promise<Buffer> {
    // This would integrate with libraries like puppeteer (PDF), exceljs (Excel), etc.
    // For now, returning a simple JSON buffer as demonstration
    
    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(data, null, 2))
      
      case 'csv':
        // Would use a CSV library here
        return Buffer.from('CSV export not implemented yet')
      
      case 'excel':
        // Would use exceljs here
        return Buffer.from('Excel export not implemented yet')
      
      case 'pdf':
        // Would use puppeteer or similar here
        return Buffer.from('PDF export not implemented yet')
      
      default:
        return Buffer.from(JSON.stringify(data, null, 2))
    }
  }

  // Utility Methods
  private hasPermission(dashboard: Dashboard, userId: string, level: 'view' | 'edit' | 'admin'): boolean {
    if (dashboard.isPublic && level === 'view') return true
    if (dashboard.createdBy === userId) return true
    
    switch (level) {
      case 'view':
        return dashboard.permissions.view.includes(userId) || 
               dashboard.permissions.edit.includes(userId) ||
               dashboard.permissions.admin.includes(userId)
      
      case 'edit':
        return dashboard.permissions.edit.includes(userId) ||
               dashboard.permissions.admin.includes(userId)
      
      case 'admin':
        return dashboard.permissions.admin.includes(userId)
      
      default:
        return false
    }
  }

  // Dashboard Templates
  async getTemplates(): Promise<Dashboard[]> {
    return [
      {
        id: 'executive-overview',
        name: 'Executive Overview',
        description: 'High-level metrics and KPIs for executives',
        widgets: [
          {
            id: 'total-plans',
            type: 'metric',
            title: 'Total Strategic Plans',
            position: { x: 0, y: 0, width: 3, height: 2 },
            config: { format: 'number' },
            dataSource: {
              type: 'query',
              query: 'SELECT COUNT(*) as count FROM plans WHERE status != \'archived\''
            },
            visible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'budget-overview',
            type: 'chart',
            title: 'Budget Distribution',
            position: { x: 3, y: 0, width: 6, height: 4 },
            config: { 
              chartType: 'pie',
              xAxis: 'department',
              yAxis: 'budget',
              showLegend: true
            },
            dataSource: {
              type: 'query',
              query: `
                SELECT d.name as department, SUM(i.expected_costs) as budget
                FROM departments d
                JOIN plans p ON p.department_id = d.id
                JOIN goals g ON g.plan_id = p.id
                JOIN initiatives i ON i.goal_id = g.id
                GROUP BY d.name
              `
            },
            visible: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        layout: 'grid',
        filters: [],
        permissions: {
          view: [],
          edit: [],
          admin: []
        },
        isPublic: true,
        tags: ['template', 'executive'],
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }
}

// Export singleton instance
export const dashboardEngine = DashboardEngine.getInstance()