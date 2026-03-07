import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_no, due_date, payment_status, customer_id')
    .in('payment_status', ['Unpaid', 'Partial'])
    .not('due_date', 'is', null)

  const debugResults = []

  for (const invoice of invoices ?? []) {
    // Check config
    const { data: config } = await supabase
      .from('reminder_configs')
      .select('*')
      .eq('customer_id', invoice.customer_id)
      .eq('is_active', true)
      .single()

    // Calc days
    const due = new Date(invoice.due_date + 'T00:00:00')
    const now = new Date(today + 'T00:00:00')
    const daysUntilDue = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Check already sent
    const { data: alreadySent } = await supabase
      .from('reminder_logs')
      .select('id')
      .eq('invoice_id', invoice.id)
      .gte('sent_at', today)
      .limit(1)

    debugResults.push({
      invoice_no:      invoice.invoice_no,
      customer_id:     invoice.customer_id,
      due_date:        invoice.due_date,
      days_until_due:  daysUntilDue,
      config_found:    !!config,
      config_active:   config?.is_active,
      already_sent:    (alreadySent?.length ?? 0) > 0,
    })
  }

  return NextResponse.json({ today, debugResults })
}