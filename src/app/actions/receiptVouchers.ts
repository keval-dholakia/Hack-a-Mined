'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReceiptVoucherFormData } from '@/types/receiptVoucher'

export async function getReceiptVouchers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('receipt_vouchers')
    .select(`
      *,
      customer:customers(name, code),
      invoice:invoices(invoice_no, grand_total, payment_status)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getReceiptVoucherById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('receipt_vouchers')
    .select(`
      *,
      customer:customers(name, code),
      invoice:invoices(invoice_no, grand_total, payment_status)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createReceiptVoucher(formData: ReceiptVoucherFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('receipt_vouchers')
    .insert([formData])

  if (error) return { error: error.message }

  // Auto-update invoice payment status
  if (formData.invoice_id) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('grand_total')
      .eq('id', formData.invoice_id)
      .single()

    if (invoice) {
      const { data: allReceipts } = await supabase
        .from('receipt_vouchers')
        .select('amount')
        .eq('invoice_id', formData.invoice_id)

      const totalReceived = (allReceipts ?? []).reduce(
        (sum, r) => sum + Number(r.amount), 0
      ) + Number(formData.amount)

      const payment_status =
        totalReceived >= Number(invoice.grand_total) ? 'Paid'
        : totalReceived > 0                          ? 'Partial'
        : 'Unpaid'

      await supabase
        .from('invoices')
        .update({ payment_status, updated_at: new Date().toISOString() })
        .eq('id', formData.invoice_id)
    }
  }

  revalidatePath('/dashboard/sales/collections')
  revalidatePath('/dashboard/sales/invoice')
  return { success: true }
}

export async function getReceiptsByInvoice(invoiceId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('receipt_vouchers')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}