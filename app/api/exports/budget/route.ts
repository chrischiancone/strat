import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getCityWideBudget } from '@/app/actions/city-budget'

export async function POST(request: NextRequest) {
  try {
    // Parse request body for filters
    const body = await request.json()
    const filters = {
      fiscal_year_ids: body.fiscal_year_ids,
      department_ids: body.department_ids,
      priority_levels: body.priority_levels,
    }

    // Get budget data
    const budgetData = await getCityWideBudget(filters)

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Summary
    const summaryData = [
      ['City-Wide Budget Summary'],
      [],
      ['Metric', 'Value'],
      ['Total Budget', `$${budgetData.summary.total_budget.toLocaleString()}`],
      ['Total Plans', budgetData.summary.total_plans],
      ['Total Initiatives', budgetData.summary.total_initiatives],
      ['Total Departments', budgetData.summary.total_departments],
      [],
      ['Generated', new Date().toLocaleString()],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    // Set column widths
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Sheet 2: Budget by Year
    const yearData = [
      ['Budget by Fiscal Year'],
      [],
      ['Fiscal Year', 'Total Budget'],
      ...budgetData.budgetByYear.map((item) => [
        `FY ${item.fiscal_year}`,
        item.total,
      ]),
    ]
    const yearSheet = XLSX.utils.aoa_to_sheet(yearData)
    yearSheet['!cols'] = [{ wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, yearSheet, 'Budget by Year')

    // Sheet 3: Budget by Department
    const deptData = [
      ['Budget by Department'],
      [],
      ['Department', 'Total Budget', 'Percentage', '# Initiatives'],
      ...budgetData.budgetByDepartment.map((item) => [
        item.department_name,
        item.total,
        `${((item.total / budgetData.summary.total_budget) * 100).toFixed(1)}%`,
        item.initiative_count,
      ]),
    ]
    const deptSheet = XLSX.utils.aoa_to_sheet(deptData)
    deptSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, deptSheet, 'Budget by Department')

    // Sheet 4: Budget by Funding Source
    const fundingData = [
      ['Budget by Funding Source'],
      [],
      ['Funding Source', 'Total Budget', 'Percentage'],
      ...budgetData.budgetByFundingSource.map((item) => [
        item.source_name,
        item.total,
        `${item.percentage.toFixed(1)}%`,
      ]),
    ]
    const fundingSheet = XLSX.utils.aoa_to_sheet(fundingData)
    fundingSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, fundingSheet, 'Budget by Funding Source')

    // Sheet 5: Budget by Category
    const categoryData = [
      ['Budget by Category'],
      [],
      ['Category', 'Total Budget', 'Percentage'],
      ...budgetData.budgetByCategory.map((item) => [
        item.category_name,
        item.total,
        `${item.percentage.toFixed(1)}%`,
      ]),
    ]
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
    categorySheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Budget by Category')

    // Sheet 6: Top 10 Initiatives
    const initiativesData = [
      ['Top 10 Initiatives by Budget'],
      [],
      ['Initiative Name', 'Department', 'Priority', 'Total Cost', 'Goal'],
      ...budgetData.topInitiatives.map((item) => [
        item.initiative_name,
        item.department_name,
        item.priority_level,
        item.total_cost,
        item.goal_title,
      ]),
    ]
    const initiativesSheet = XLSX.utils.aoa_to_sheet(initiativesData)
    initiativesSheet['!cols'] = [
      { wch: 40 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
    ]
    XLSX.utils.book_append_sheet(workbook, initiativesSheet, 'Top 10 Initiatives')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `City-Budget-Export-${timestamp}.xlsx`

    // Return Excel file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating Excel export:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate export',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
