import { NextRequest, NextResponse } from 'next/server'
import { getInvoicesDueForReminder } from '@/app/actions/reminders'
import { dispatchReminder } from '@/lib/notificationDispatcher'

// Protect with a secret so only your cron can call it
const SCHEDULER_SECRET = process.env.SCHEDULER_SECRET

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${SCHEDULER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const triggers = await getInvoicesDueForReminder()

    if (triggers.length === 0) {
      return NextResponse.json({ message: 'No reminders due today', sent: 0 })
    }

    const results = []
    for (const trigger of triggers) {
      const dispatched = await dispatchReminder(trigger)
      results.push({
        invoice_no:   trigger.invoice_no,
        customer:     trigger.customer_name,
        trigger_type: trigger.trigger_type,
        dispatched,
      })
    }

    return NextResponse.json({
      message: `Processed ${results.length} reminders`,
      sent:    results.length,
      results,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Also allow GET for manual trigger from browser during testing
export async function GET(req: NextRequest) {
  return POST(req)
}