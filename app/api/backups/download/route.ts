import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { bucket, path } = await request.json()

    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'Bucket and path are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Download from Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) {
      console.error('Storage download error:', error)
      return NextResponse.json(
        { error: `Failed to download backup: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data returned from storage' },
        { status: 500 }
      )
    }

    // Convert Blob to base64 for JSON transport
    const buffer = await data.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    return NextResponse.json({
      success: true,
      data: base64,
      contentType: data.type
    })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download failed' },
      { status: 500 }
    )
  }
}
