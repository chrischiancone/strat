import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function isAllowedImageType(type: string): boolean {
  const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/webp']
  return allowed.includes(type)
}

export async function POST(req: NextRequest) {
  try {
    const { municipalityId, fileName, fileType, contentBase64 } = await req.json()

    if (!municipalityId || !fileName || !fileType || !contentBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isAllowedImageType(fileType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()
    const bucket = 'branding'
    const path = `${municipalityId}/${fileName}`

    // Decode base64 (strip data URL prefix if present)
    const base64 = typeof contentBase64 === 'string' ? contentBase64.split(',').pop()! : ''
    const buffer = Buffer.from(base64, 'base64')

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: fileType, upsert: true })

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    // Get public URL (bucket should be public)
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({ ok: true, url: publicUrl.publicUrl, path })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}