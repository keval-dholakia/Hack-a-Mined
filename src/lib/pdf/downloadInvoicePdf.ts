import { downloadVoucherPdf } from './downloadVoucherPdf'
import type { Invoice, InvoiceItem } from '@/types/invoice'

export async function downloadInvoicePdf(inv: Invoice) {
  const lineItems = (inv.items || []).map((it: InvoiceItem, idx: number) => ({
    sno: idx + 1,
    description: it.product?.name || 'Item',
    qty: it.quantity,
    unit: it.product?.unit || 'Nos',
    rate: it.rate,
    amount: it.total,
    gst: it.gst_percent,
  }))

  const extras: Record<string, string> = {
    'Sale Order': inv.sale_order?.so_no || '—',
    'Place of Supply': inv.place_of_supply || '—',
    'E-Way Bill': inv.eway_bill_no || '—',
    'Payment Status': inv.payment_status || '—',
  }

  downloadVoucherPdf({
    type: 'Tax Invoice',
    voucherNo: inv.invoice_no,
    date: inv.invoice_date,
    partyName: inv.customer?.name || 'Customer',
    amount: Number(inv.grand_total) || 0,
    narration: `Invoice generated for SO: ${inv.sale_order?.so_no || 'N/A'}`,
    lineItems,
    extras,
    fileName: `Invoice_${inv.invoice_no}`,
  })
}

export default downloadInvoicePdf
