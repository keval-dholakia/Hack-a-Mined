import { COMPANY, fmtDate, fmtCurrency, numberToWords } from './pdfConstants'
import type { Invoice, InvoiceItem } from '@/types/invoice'

function lineItemRow(it: InvoiceItem, idx: number) {
  const rate = fmtCurrency(it.rate)
  const qty = it.quantity
  const gst = `${it.gst_percent}%`
  const amt = fmtCurrency(it.total)
  const desc = it.product?.name || ''
  return `
    <tr>
      <td class="sno">${idx + 1}</td>
      <td class="desc">${desc}</td>
      <td class="qty">${qty}</td>
      <td class="rate">${rate}</td>
      <td class="gst">${gst}</td>
      <td class="amt">${amt}</td>
    </tr>`
}

export function invoiceHtml(inv: Invoice) {
  const items = (inv.items || []).map((it, i) => lineItemRow(it, i)).join('')
  const total = fmtCurrency(inv.grand_total)
  const date = fmtDate(inv.invoice_date)
  const amountWords = numberToWords(Number(inv.grand_total))

  const logoHtml = (COMPANY as any).logo ? `<div style="margin-bottom:8px"><img src="${(COMPANY as any).logo}" alt="logo" style="height:48px; object-fit:contain"/></div>` : ''

  return `
  <div class="invoice-root" style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; background: #fff; padding: 20px; width: 800px;">
    <style>
      .inv-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
      .company { font-weight:700; font-size:20px; color:#111 }
      .company small { display:block; font-weight:400; font-size:12px; color:#666 }
      .meta { text-align:right }
      .meta .title { font-size:18px; font-weight:700; color:#0f172a }
      .box { border:1px solid #e6eef8; padding:10px; border-radius:6px; background:#fbfdff }
      table.items { width:100%; border-collapse:collapse; margin-top:10px }
      table.items th, table.items td { border:1px solid #eef2ff; padding:8px; font-size:13px }
      table.items th { background:#f8fafc; color:#111; text-align:left }
      .sno { width:40px; text-align:center }
      .qty, .rate, .gst, .amt { text-align:right }
      .totals { margin-top:8px; display:flex; justify-content:flex-end }
      .totals .right { width:320px }
      .signature { display:flex; justify-content:space-between; margin-top:28px }
      .sig-block { width:200px; text-align:center }
    </style>

    <div class="inv-header">
      <div>
        ${logoHtml}
        <div class="company">${COMPANY.name}</div>
        <small>${COMPANY.address}</small>
        <small>GSTIN: ${COMPANY.gstin} · Ph: ${COMPANY.phone}</small>
      </div>
      <div class="meta">
        <div class="title">TAX INVOICE</div>
        <div>Invoice: <strong>${inv.invoice_no}</strong></div>
        <div>Date: ${date}</div>
        <div>Customer: <strong>${inv.customer?.name || '—'}</strong></div>
      </div>
    </div>

    <div class="box">
      <table class="items">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th style="width:80px">Qty</th>
            <th style="width:110px">Rate</th>
            <th style="width:90px">GST</th>
            <th style="width:120px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>

      <div class="totals">
        <div class="right">
          <table style="width:100%">
            <tr><td style="text-align:left">Taxable Value</td><td style="text-align:right">${fmtCurrency(inv.taxable_value)}</td></tr>
            <tr><td style="text-align:left">GST</td><td style="text-align:right">${fmtCurrency(inv.gst_amount)}</td></tr>
            <tr><td style="text-align:left"><strong>Grand Total</strong></td><td style="text-align:right"><strong>${total}</strong></td></tr>
          </table>
        </div>
      </div>

      <div style="margin-top:8px">Amount (in words): <em>${amountWords}</em></div>

      <div class="signature">
        <div class="sig-block">Prepared By<br/><br/>__________________</div>
        <div class="sig-block">Authorized Signatory<br/><br/>__________________</div>
      </div>
    </div>
  </div>`
}

export default invoiceHtml
