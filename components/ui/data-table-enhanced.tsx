import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  SearchIcon, 
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  ArrowUpDownIcon
} from 'lucide-react'
import { ContentCard } from '@/components/layouts/PageContainer'

export interface Column<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  width?: string
}

export interface TableAction<T = any> {
  label: string
  onClick: (row: T) => void
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: (row: T) => boolean
}

export interface FilterOption {
  label: string
  value: string | number
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  actions?: TableAction<T>[]
  searchPlaceholder?: string
  showSearch?: boolean
  showFilters?: boolean
  showPagination?: boolean
  pageSize?: number
  className?: string
  emptyState?: {
    title: string
    description: string
    action?: React.ReactNode
  }
  filters?: Record<string, FilterOption[]>
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchPlaceholder = 'Search...',
  showSearch = true,
  showFilters = false,
  showPagination = true,
  pageSize = 10,
  className,
  emptyState,
  filters = {}
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchQuery) {
      const searchableColumns = columns.filter(col => col.searchable !== false)
      filtered = filtered.filter(row =>
        searchableColumns.some(col => {
          const value = row[col.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => row[key]?.toString() === value)
      }
    })

    return filtered
  }, [data, searchQuery, activeFilters, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === bVal) return 0
      
      let comparison = 0
      if (aVal > bVal) {
        comparison = 1
      } else if (aVal < bVal) {
        comparison = -1
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, showPagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: keyof T) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }

  const getSortIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDownIcon className="h-4 w-4 text-gray-400" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4 text-primary-600" />
      : <ChevronDownIcon className="h-4 w-4 text-primary-600" />
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!data || data.length === 0) {
    return (
      <ContentCard className={className}>
        {(showSearch || showFilters) && (
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {showSearch && (
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}
              
              {showFilters && Object.keys(filters).length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-center py-12">
          {emptyState ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyState.title}</h3>
              <p className="text-gray-600 mb-4">{emptyState.description}</p>
              {emptyState.action}
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">There are no items to display at this time.</p>
            </div>
          )}
        </div>
      </ContentCard>
    )
  }

  return (
    <ContentCard className={cn('overflow-hidden', className)}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {paginatedData.length} of {sortedData.length} results
              </span>
              
              {showFilters && Object.keys(filters).length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Filters
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-4 space-y-4">
                        {Object.entries(filters).map(([key, options]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {columns.find(col => col.key === key)?.title || key}
                            </label>
                            <select
                              value={activeFilters[key] || ''}
                              onChange={(e) => setActiveFilters(prev => ({
                                ...prev,
                                [key]: e.target.value
                              }))}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="">All</option>
                              {options.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-semibold text-gray-700',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-sm text-gray-900',
                      column.className
                    )}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '-')
                    }
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          disabled={action.disabled?.(row)}
                          className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-offset-2',
                            action.variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
                            action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
                            (!action.variant || action.variant === 'secondary') && 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
                            action.disabled?.(row) && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i
                if (page > totalPages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors',
                      'focus:ring-2 focus:ring-primary-500',
                      currentPage === page
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </ContentCard>
  )
}