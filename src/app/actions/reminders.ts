'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReminderMode } from '@/types/reminder'

// ── Config ────────────────────────────────────

export async function getReminderConfig(customerId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reminder_configs')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error) return null
  return data
}

export async function upsertReminderConfig(customerId: number, config: {
  is_active:        boolean
  reminder_mode:    ReminderMode
  contact_email:    string
  contact_whatsapp: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reminder_configs')
    .upsert({
      customer_id:      customerId,
      ...config,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'customer_id' })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Logs ──────────────────────────────────────

export async function getReminderLogs(filters?: {
  customerId?: number
  invoiceId?:  number
  limit?:      number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('reminder_logs')
    .select(`
      *,
      invoice:invoices(invoice_no, grand_total, due_date),
      customer:customers(name, code)
    `)
    .order('created_at', { ascending: false })

  if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
  if (filters?.invoiceId)  query = query.eq('invoice_id',  filters.invoiceId)
  if (filters?.limit)      query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) return []
  return data
}

export async function logReminder(entry: {
  invoice_id:      number
  customer_id:     number
  trigger_type:    string
  channel:         string
  status:          string
  message_content: string
  days_overdue:    number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reminder_logs')
    .insert([entry])

  if (error) return { error: error.message }
  return { success: true }
}

// ── Scheduler Core Logic ──────────────────────
// This is called by the Edge Function / cron job daily

export async function getInvoicesDueForReminder() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_no, grand_total, due_date, customer_id, customer:customers(name, email, mobile)')
    .in('payment_status', ['Unpaid', 'Partial'])
    .not('due_date', 'is', null)

  if (error || !invoices) return []

  const results = []

  for (const invoice of invoices) {
    // Fetch config separately — same approach as debug route
    const { data: config } = await supabase
      .from('reminder_configs')
      .select('*')
      .eq('customer_id', invoice.customer_id)
      .eq('is_active', true)
      .single()

    if (!config) continue

    const due = new Date(invoice.due_date + 'T00:00:00')
    const now = new Date(today + 'T00:00:00')
    const daysUntilDue = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let triggerType: string | null = null
    if      (daysUntilDue >= 6 && daysUntilDue <= 8)  triggerType = 'T-7'
    else if (daysUntilDue >= 2 && daysUntilDue <= 4)  triggerType = 'T-3'
    else if (daysUntilDue >= 0 && daysUntilDue <= 1)  triggerType = 'T-0'
    else if (daysUntilDue < 0)                         triggerType = 'Overdue'

    if (!triggerType) continue

    const mode = config.reminder_mode
    if (mode === 'Moderate' && triggerType === 'T-7') continue
    if (mode === 'Lenient' && ['T-7', 'T-3'].includes(triggerType)) continue

    const { data: alreadySent } = await supabase
      .from('reminder_logs')
      .select('id')
      .eq('invoice_id', invoice.id)
      .eq('trigger_type', triggerType)
      .gte('sent_at', today)
      .limit(1)

    if (alreadySent && alreadySent.length > 0) continue

    results.push({
      invoice_id:       invoice.id,
      invoice_no:       invoice.invoice_no,
      customer_id:      invoice.customer_id,
      customer_name:    (invoice.customer as any)?.name,
      contact_email:    config.contact_email || (invoice.customer as any)?.email,
      contact_whatsapp: config.contact_whatsapp || (invoice.customer as any)?.mobile,
      grand_total:      invoice.grand_total,
      due_date:         invoice.due_date,
      days_until_due:   daysUntilDue,
      days_overdue:     daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0,
      trigger_type:     triggerType as 'T-7' | 'T-3' | 'T-0' | 'Overdue',
      reminder_mode:    mode as ReminderMode,
    })
  }

  return results
}