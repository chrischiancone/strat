import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { bucket, path, content, contentType } = await req.json()

    if (!bucket || !path || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    const buffer = Buffer.from(content, 'utf-8')
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: contentType || 'application/json', upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
