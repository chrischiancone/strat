import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { recipient, municipalityId } = await req.json()

    if (!recipient || !municipalityId) {
      return NextResponse.json({ error: 'Missing recipient or municipalityId' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    // Fetch municipality information
    const { data: municipality, error: muniErr } = await supabase
      .from('municipalities')
      .select('id, name, slug')
      .eq('id', municipalityId)
      .single()

    if (muniErr || !municipality) {
      return NextResponse.json({ error: 'Municipality not found' }, { status: 404 })
    }

    // SMTP configuration for development (using Mailpit)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || '127.0.0.1',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined,
    })

    const subject = `[Test] Stratic Plan Notification System - ${municipality.name}`
    const timestamp = new Date().toLocaleString()

    const text = [
      '🧪 Test Notification',
      '',
      `Municipality: ${municipality.name}`,
      `Recipient: ${recipient}`,
      `Timestamp: ${timestamp}`,
      '',
      'This is a test notification from your Stratic Plan notification system.',
      'If you receive this email, your notification settings are configured correctly.',
      '',
      '✅ Notification system is working properly!',
      '',
      '---',
      'Stratic Plan - Strategic Planning System',
      'This is an automated message. Please do not reply.',
    ].join('\n')

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🧪 Test Notification</h2>
        
        <div style="background: #f0f9f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Municipality:</strong> ${municipality.name}</p>
          <p><strong>Recipient:</strong> ${recipient}</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
        </div>
        
        <p>This is a test notification from your Stratic Plan notification system.</p>
        <p>If you receive this email, your notification settings are configured correctly.</p>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #065f46; margin: 0;"><strong>✅ Notification system is working properly!</strong></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          <strong>Stratic Plan</strong> - Strategic Planning System<br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    `

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${municipality.name} System" <no-reply@${municipality.slug}.gov>`,
      to: recipient,
      subject,
      text,
      html,
    })

    return NextResponse.json({ 
      ok: true, 
      messageId: info.messageId,
      recipient,
      municipality: municipality.name 
    })
  } catch (err) {
    console.error('Test notification error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}