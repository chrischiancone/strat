import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function parseRecipients(input?: string | null): string[] {
  if (!input) return []
  return input
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(Boolean)
}

export async function POST(req: NextRequest) {
  try {
    const { type, backupId, municipalityId, recipients: overrideRecipients } = await req.json()

    if (!type || !backupId || !municipalityId) {
      return NextResponse.json({ error: 'Missing required fields: type, backupId, municipalityId' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    // Fetch backup record
    const { data: backup, error: backupErr } = await supabase
      .from('backups')
      .select('id, name, status, size, duration, file_count, file_path, checksum, created_at, completed_at')
      .eq('id', backupId)
      .single()

    if (backupErr || !backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Fetch municipality to get settings/recipients
    const { data: municipality, error: muniErr } = await supabase
      .from('municipalities')
      .select('id, name, settings')
      .eq('id', municipalityId)
      .single()

    if (muniErr || !municipality) {
      return NextResponse.json({ error: 'Municipality not found' }, { status: 404 })
    }

    // Resolve recipients
    const notifSettings = (municipality.settings?.backup?.notifications) || {}
    const defaultRecipients = type === 'success'
      ? parseRecipients(notifSettings.success_email)
      : parseRecipients(notifSettings.failure_email)

    const recipients: string[] = Array.isArray(overrideRecipients) && overrideRecipients.length > 0
      ? overrideRecipients
      : defaultRecipients

    if (!recipients.length) {
      return NextResponse.json({ error: 'No recipients configured for notifications' }, { status: 400 })
    }

    // SMTP transporter
    const host = process.env.SMTP_HOST || '127.0.0.1'
    const port = Number(process.env.SMTP_PORT || 1025)
    const secure = (process.env.SMTP_SECURE || 'false') === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || 'no-reply@localhost'

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    })

    const okEmoji = type === 'success' ? '✅' : '❌'
    const subjStatus = type === 'success' ? 'Backup Completed' : 'Backup Failed'
    const subject = `[Stratic Plan] ${subjStatus} - ${municipality.name}`

    const sizeStr = `${backup.size ?? 0} bytes`
    const durationStr = `${backup.duration ?? 0}s`
    const downloadHint = backup.file_path ? `Path: ${backup.file_path}` : 'No file path recorded.'

    const text = [
      `${okEmoji} ${subjStatus}`,
      `Municipality: ${municipality.name}`,
      `Backup: ${backup.name}`,
      `Status: ${backup.status}`,
      `Size: ${sizeStr}`,
      `Duration: ${durationStr}`,
      `Files: ${backup.file_count ?? 0}`,
      `Checksum: ${backup.checksum ?? 'n/a'}`,
      downloadHint,
      `Created: ${backup.created_at}`,
      `Completed: ${backup.completed_at ?? 'n/a'}`,
    ].join('\n')

    const html = `
      <h2>${okEmoji} ${subjStatus}</h2>
      <p><strong>Municipality:</strong> ${municipality.name}</p>
      <p><strong>Backup:</strong> ${backup.name}</p>
      <p><strong>Status:</strong> ${backup.status}</p>
      <ul>
        <li><strong>Size:</strong> ${sizeStr}</li>
        <li><strong>Duration:</strong> ${durationStr}</li>
        <li><strong>Files:</strong> ${backup.file_count ?? 0}</li>
        <li><strong>Checksum:</strong> ${backup.checksum ?? 'n/a'}</li>
      </ul>
      <p><strong>${downloadHint}</strong></p>
      <p><small>Created: ${backup.created_at}<br/>Completed: ${backup.completed_at ?? 'n/a'}</small></p>
    `

    const info = await transporter.sendMail({
      from,
      to: recipients,
      subject,
      text,
      html,
    })

    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
