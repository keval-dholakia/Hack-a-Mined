import { buildEmailContent, buildWhatsAppMessage } from './reminderMessages'
import { logReminder } from '@/app/actions/reminders'
import type { ReminderTrigger } from '@/types/reminder'

// ── Email via Resend ──────────────────────────
async function sendEmail(trigger: Omit<ReminderTrigger, 'already_sent'>) {
  if (!trigger.contact_email) return { success: false, error: 'No email on file' }

  const { subject, body } = buildEmailContent(trigger)

  // ─────────────────────────────────────────────
  // TO ACTIVATE: npm install resend
  // Then replace the mock below with:
  //
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // const { data, error } = await resend.emails.send({
  //   from:    'TechMicra ERP <noreply@techmicra.com>',
  //   to:      trigger.contact_email,
  //   subject: subject,
  //   text:    body,
  // })
  // if (error) return { success: false, error: error.message }
  // ─────────────────────────────────────────────

  console.log(`[EMAIL MOCK] To: ${trigger.contact_email}`)
  console.log(`[EMAIL MOCK] Subject: ${subject}`)
  console.log(`[EMAIL MOCK] Body:\n${body}`)

  return { success: true, message: subject }
}

// ── WhatsApp via WATI ─────────────────────────
async function sendWhatsApp(trigger: Omit<ReminderTrigger, 'already_sent'>) {
  if (!trigger.contact_whatsapp) return { success: false, error: 'No WhatsApp number on file' }

  const message = buildWhatsAppMessage(trigger)

  // ─────────────────────────────────────────────
  // TO ACTIVATE: Replace mock below with your provider
  //
  // WATI example:
  // const response = await fetch(`https://live-mt-server.wati.io/api/v1/sendSessionMessage/${trigger.contact_whatsapp}`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WATI_API_KEY}`,
  //     'Content-Type':  'application/json',
  //   },
  //   body: JSON.stringify({ messageText: message }),
  // })
  //
  // Twilio example:
  // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  // await client.messages.create({
  //   from: 'whatsapp:+14155238886',
  //   to:   `whatsapp:${trigger.contact_whatsapp}`,
  //   body: message,
  // })
  // ─────────────────────────────────────────────

  console.log(`[WHATSAPP MOCK] To: ${trigger.contact_whatsapp}`)
  console.log(`[WHATSAPP MOCK] Message: ${message}`)

  return { success: true, message }
}

// ── Main Dispatcher ───────────────────────────
export async function dispatchReminder(trigger: Omit<ReminderTrigger, 'already_sent'>) {
  const results = []

  // Send Email
  if (trigger.contact_email) {
    const emailResult = await sendEmail(trigger)
    await logReminder({
      invoice_id:      trigger.invoice_id,
      customer_id:     trigger.customer_id,
      trigger_type:    trigger.trigger_type,
      channel:         'Email',
      status:          emailResult.success ? 'Sent' : 'Failed',
      message_content: emailResult.message ?? emailResult.error ?? '',
      days_overdue:    trigger.days_overdue,
    })
    results.push({ channel: 'Email', ...emailResult })
  }

  // Send WhatsApp
  if (trigger.contact_whatsapp) {
    const waResult = await sendWhatsApp(trigger)
    await logReminder({
      invoice_id:      trigger.invoice_id,
      customer_id:     trigger.customer_id,
      trigger_type:    trigger.trigger_type,
      channel:         'WhatsApp',
      status:          waResult.success ? 'Sent' : 'Failed',
      message_content: waResult.message ?? waResult.error ?? '',
      days_overdue:    trigger.days_overdue,
    })
    results.push({ channel: 'WhatsApp', ...waResult })
  }

  return results
}