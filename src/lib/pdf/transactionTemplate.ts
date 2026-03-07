import { COMPANY, fmtDate, fmtCurrency } from './pdfConstants'

function entryRow(e: any, idx: number) {
  const debit = e.debit ? fmtCurrency(Number(e.debit)) : ''
  const credit = e.credit ? fmtCurrency(Number(e.credit)) : ''
  const label = e.label || ''
  return `
    <tr>
      <td class="sno">${idx + 1}</td>
      <td class="desc">${label}</td>
      <td class="debit">${debit}</td>
      <td class="credit">${credit}</td>
    </tr>`
}

export function transactionHtml(opts: any) {
  const entries = (opts.entries || []).map((e: any, i: number) => entryRow(e, i)).join('')
  const amount = fmtCurrency(Number(opts.amount || 0))
  const date = opts.date ? fmtDate(opts.date) : '—'
  const logoHtml = (COMPANY as any).logo ? `<div style="margin-bottom:8px"><img src="${(COMPANY as any).logo}" alt="logo" style="height:48px; object-fit:contain"/></div>` : ''

  const extrasRows = opts.extras ? Object.entries(opts.extras).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('') : ''

  return `
  <div class="txn-root" style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; background: #fff; padding: 20px; width: 800px;">
    <style>
      .hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
      .company { font-weight:700; font-size:18px; color:#111 }
      .meta { text-align:right }
      .box { border:1px solid #e6eef8; padding:10px; border-radius:6px; background:#fbfdff }
      table.entries { width:100%; border-collapse:collapse; margin-top:10px }
      table.entries th, table.entries td { border:1px solid #eef2ff; padding:8px; font-size:13px }
      table.entries th { background:#f8fafc; color:#111; text-align:left }
      .sno { width:40px; text-align:center }
      .debit, .credit { text-align:right; width:140px }
      .signature { display:flex; justify-content:space-between; margin-top:18px }
    </style>

    <div class="hdr">
      <div>
        ${logoHtml}
        <div class="company">${COMPANY.name}</div>
        <small>${COMPANY.address}</small>
        <small>GSTIN: ${COMPANY.gstin || '—'} · Ph: ${COMPANY.phone || '—'}</small>
      </div>
      <div class="meta">
        <div style="font-size:16px; font-weight:700">${opts.type || 'Voucher'}</div>
        <div>No: <strong>${opts.voucherNo || '—'}</strong></div>
        <div>Date: ${date}</div>
        <div>Party: <strong>${opts.partyName || '—'}</strong></div>
      </div>
    </div>

    <div class="box">
      <div style="margin-bottom:8px"><strong>Amount:</strong> ${amount}</div>
      <div style="margin-bottom:8px"><strong>Narration:</strong> ${opts.narration || '—'}</div>

      <table class="entries">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th style="width:140px">Debit</th>
            <th style="width:140px">Credit</th>
          </tr>
        </thead>
        <tbody>
          ${entries}
        </tbody>
      </table>

      <div style="margin-top:8px">${extrasRows}</div>

      <div class="signature">
        <div class="sig-block">Prepared By<br/><br/>__________________</div>
        <div class="sig-block">Authorized Signatory<br/><br/>__________________</div>
      </div>
    </div>
  </div>`
}

export default transactionHtml
