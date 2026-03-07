export type ReminderMode = 'Strict' | 'Moderate' | 'Lenient'

export type ReminderConfig = {
  id:               number
  customer_id:      number
  is_active:        boolean
  reminder_mode:    ReminderMode
  contact_email:    string | null
  contact_whatsapp: string | null
  created_at:       string
  updated_at:       string
  customer?:        { name: string; code: string | null }
}

export type ReminderLog = {
  id:              number
  invoice_id:      number
  customer_id:     number
  trigger_type:    'T-7' | 'T-3' | 'T-0' | 'Overdue'
  channel:         'Email' | 'WhatsApp'
  sent_at:         string
  status:          'Sent' | 'Failed' | 'Delivered' | 'Read'
  message_content: string | null
  days_overdue:    number
  created_at:      string
  invoice?:        { invoice_no: string; grand_total: number; due_date: string }
  customer?:       { name: string; code: string | null }
}

// What the scheduler resolves for each invoice
export type ReminderTrigger = {
  invoice_id:       number
  invoice_no:       string
  customer_id:      number
  customer_name:    string
  contact_email:    string | null
  contact_whatsapp: string | null
  grand_total:      number
  due_date:         string
  days_until_due:   number
  days_overdue:     number
  trigger_type:     'T-7' | 'T-3' | 'T-0' | 'Overdue'
  reminder_mode:    ReminderMode
  already_sent:     boolean  // checked against reminder_logs
}