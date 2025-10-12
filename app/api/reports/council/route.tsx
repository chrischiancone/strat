import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { CouncilReportDocument } from '@/lib/pdf/CouncilReportDocument'
import { generateCouncilReportData } from '@/app/actions/city-council-report'

export async function POST(request: NextRequest) {
  try {
    // Parse request body for filters
    const body = await request.json()
    const filters = {
      fiscal_year_ids: body.fiscal_year_ids,
      department_ids: body.department_ids,
    }

    // Generate report data
    const reportData = await generateCouncilReportData(filters)

    // Generate PDF
    const stream = await renderToStream(
      <CouncilReportDocument data={reportData} />
    )

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `City-Council-Report-${timestamp}.pdf`

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate report',
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
