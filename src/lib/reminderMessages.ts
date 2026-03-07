import type { ReminderTrigger } from '@/types/reminder'

function fmt(n: number) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

export function buildEmailContent(trigger: Omit<ReminderTrigger, 'already_sent'>) {
  const { customer_name, invoice_no, grand_total, due_date, days_until_due, days_overdue } = trigger

  const subjects: Record<string, string> = {
    'T-7':    `Payment Reminder — Invoice ${invoice_no} due in 7 days`,
    'T-3':    `Payment Reminder — Invoice ${invoice_no} due in 3 days`,
    'T-0':    `Payment Due Today — Invoice ${invoice_no}`,
    'Overdue':`OVERDUE — Invoice ${invoice_no} (${days_overdue} days past due)`,
  }

  const bodies: Record<string, string> = {
    'T-7': `
Dear ${customer_name},

This is a friendly reminder that Invoice ${invoice_no} for ${fmt(grand_total)} 
is due on ${due_date} — that's 7 days from today.

Kindly arrange payment at your earliest convenience.

Regards,
TechMicra Team
    `.trim(),

    'T-3': `
Dear ${customer_name},

Invoice ${invoice_no} for ${fmt(grand_total)} is due in 3 days on ${due_date}.

Please process your payment to avoid any delays.

Regards,
TechMicra Team
    `.trim(),

    'T-0': `
Dear ${customer_name},

Invoice ${invoice_no} for ${fmt(grand_total)} is due TODAY (${due_date}).

Please process payment immediately or contact us if there's an issue.

Regards,
TechMicra Team
    `.trim(),

    'Overdue': `
Dear ${customer_name},

Invoice ${invoice_no} for ${fmt(grand_total)} is now ${days_overdue} day(s) overdue.
Original due date: ${due_date}.

Please clear this payment urgently or contact us to discuss.

Regards,
TechMicra Team
    `.trim(),
  }

  return {
    subject: subjects[trigger.trigger_type],
    body:    bodies[trigger.trigger_type],
  }
}

export function buildWhatsAppMessage(trigger: Omit<ReminderTrigger, 'already_sent'>) {
  const { customer_name, invoice_no, grand_total, due_date, days_overdue, trigger_type } = trigger
  const amount = fmt(grand_total)

  const messages: Record<string, string> = {
    'T-7':    `Dear ${customer_name}, your Invoice *${invoice_no}* of *${amount}* is due on *${due_date}* (7 days remaining). Kindly arrange payment. — TechMicra`,
    'T-3':    `Dear ${customer_name}, your Invoice *${invoice_no}* of *${amount}* is due in *3 days* on ${due_date}. Please process payment soon. — TechMicra`,
    'T-0':    `Dear ${customer_name}, your Invoice *${invoice_no}* of *${amount}* is due *TODAY*. Please process payment immediately. — TechMicra`,
    'Overdue':`⚠️ Dear ${customer_name}, Invoice *${invoice_no}* of *${amount}* is *${days_overdue} day(s) OVERDUE*. Please clear this urgently. — TechMicra`,
  }

  return messages[trigger_type]
}