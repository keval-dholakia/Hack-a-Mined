// ─── downloadVoucherPdf.ts ────────────────────────────────────────────────────
// Client-side utility for generating industry-standard voucher / receipt PDFs
// Supports: Payment Voucher, Receipt Voucher, Journal Voucher, Contra Voucher,
//           Purchase Order, Invoice, GST Voucher, Advance Receipt, Payslip, etc.
//
// Usage:
//   downloadVoucherPdf({
//     type: 'Payment Voucher',
//     voucherNo: 'PAY-2026-0042',
//     date: '2026-03-07',
//     partyName: 'ABC Vendors',
//     amount: 125000,
//     narration: 'Against Invoice INV-2026-0035',
//     entries: [
//       { label: 'Purchase Account', debit: 125000, credit: 0 },
//       { label: 'HDFC Bank', debit: 0, credit: 125000 },
//     ],
//     extras: { mode: 'Bank Transfer', refNo: 'NEFT-123456' },
//   })

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { COMPANY, PAGE, FONT, PDF_COLORS, fmtCurrency, fmtDate, fmtDateTime, numberToWords } from './pdfConstants'

export type VoucherEntry = {
    label: string
    debit: number
    credit: number
}

export type VoucherPdfOptions = {
    /** Type displayed on the voucher title */
    type: 'Payment Voucher' | 'Receipt Voucher' | 'Journal Voucher' | 'Contra Voucher'
    | 'GST Voucher' | 'Credit Card Expense' | 'Advance Receipt'
    | 'Purchase Order' | 'Purchase Bill' | 'Sale Order' | 'Tax Invoice' | 'Receipt'
    | 'Contractor Payslip' | 'Contractor Payment'
    | string

    voucherNo: string
    date: string

    /** Party/Customer/Vendor name */
    partyName?: string

    /** Total amount (used for amount-in-words) */
    amount: number

    narration?: string

    /** Double-entry accounting lines */
    entries?: VoucherEntry[]

    /** Line items for PO / Invoice / Bill type vouchers */
    lineItems?: {
        sno: number
        description: string
        qty?: number
        unit?: string
        rate?: number
        amount: number
        gst?: number
    }[]

    /** Additional key-value pairs to show in the detail box */
    extras?: Record<string, string>

    fileName?: string
}

export function downloadVoucherPdf(opts: VoucherPdfOptions) {
    const {
        type, voucherNo, date, partyName, amount, narration,
        entries, lineItems, extras, fileName,
    } = opts

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pw = PAGE.width
    const ml = PAGE.margin.left
    const mr = PAGE.margin.right
    const cw = pw - ml - mr
    let y: number = PAGE.margin.top

    // ── Header Band ───────────────────────────────────────────────────────────
    doc.setFillColor(...PDF_COLORS.headerBg)
    doc.rect(0, 0, pw, 30, 'F')

    doc.setTextColor(...PDF_COLORS.white)
    doc.setFontSize(FONT.title)
    doc.setFont('helvetica', 'bold')
    doc.text(COMPANY.name, ml, 12)

    doc.setFontSize(FONT.small)
    doc.setFont('helvetica', 'normal')
    doc.text(COMPANY.address, ml, 18)
    doc.text(`GSTIN: ${COMPANY.gstin} | Ph: ${COMPANY.phone}`, ml, 23)

    y = 36

    // ── Voucher Title ─────────────────────────────────────────────────────────
    doc.setFillColor(245, 247, 250)
    doc.rect(ml, y, cw, 10, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(ml, y, cw, 10, 'S')

    doc.setFontSize(FONT.heading)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_COLORS.black)
    doc.text(type.toUpperCase(), pw / 2, y + 6.5, { align: 'center' })
    y += 14

    // ── Voucher Details Box ───────────────────────────────────────────────────
    const detailBoxY = y
    const leftColX = ml + 3
    const rightColX = ml + cw / 2 + 5
    const rowH = 5.5

    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)

    const detailRows: [string, string][] = [
        ['Voucher No:', voucherNo],
        ['Date:', fmtDate(date)],
    ]
    if (partyName) detailRows.push(['Party:', partyName])
    if (extras) {
        Object.entries(extras).forEach(([k, v]) => detailRows.push([k + ':', v]))
    }

    const leftRows = detailRows.slice(0, Math.ceil(detailRows.length / 2))
    const rightRows = detailRows.slice(Math.ceil(detailRows.length / 2))

    const boxH = Math.max(leftRows.length, rightRows.length) * rowH + 6
    doc.rect(ml, y, cw, boxH, 'S')

    // Vertical divider
    doc.line(ml + cw / 2, y, ml + cw / 2, y + boxH)
    y += 4

    doc.setFontSize(FONT.body)
    leftRows.forEach(([label, value], i) => {
        const ry = y + i * rowH
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text(label, leftColX, ry)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...PDF_COLORS.black)
        doc.text(value, leftColX + 28, ry)
    })

    rightRows.forEach(([label, value], i) => {
        const ry = y + i * rowH
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text(label, rightColX, ry)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...PDF_COLORS.black)
        doc.text(value, rightColX + 28, ry)
    })

    y = detailBoxY + boxH + 4

    // ── Double-Entry Table (for voucher types) ────────────────────────────────
    if (entries && entries.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Particulars', 'Debit (₹)', 'Credit (₹)']],
            body: entries.map(e => [
                e.label,
                e.debit > 0 ? fmtCurrency(e.debit) : '',
                e.credit > 0 ? fmtCurrency(e.credit) : '',
            ]),
            foot: [[
                'Total',
                fmtCurrency(entries.reduce((s, e) => s + e.debit, 0)),
                fmtCurrency(entries.reduce((s, e) => s + e.credit, 0)),
            ]],
            margin: { left: ml, right: mr },
            theme: 'grid',
            styles: {
                fontSize: FONT.body,
                cellPadding: 3,
                lineColor: [180, 180, 180],
                lineWidth: 0.2,
                textColor: [30, 30, 30],
            },
            headStyles: {
                fillColor: PDF_COLORS.headerBg,
                textColor: PDF_COLORS.white,
                fontStyle: 'bold',
                halign: 'center',
            },
            footStyles: {
                fillColor: [240, 240, 245],
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: cw * 0.5 },
                1: { halign: 'right' },
                2: { halign: 'right' },
            },
        })
        y = ((doc as any).lastAutoTable?.finalY ?? y + 26) + 4
    }

    // ── Line Items Table (for PO / Invoice / Bill) ────────────────────────────
    if (lineItems && lineItems.length > 0) {
        const hasGst = lineItems.some(li => li.gst !== undefined)
        const headRow = ['#', 'Description', 'Qty', 'Unit', 'Rate (₹)', 'Amount (₹)']
        if (hasGst) headRow.push('GST %')

        autoTable(doc, {
            startY: y,
            head: [headRow],
            body: lineItems.map(li => {
                const row = [
                    String(li.sno),
                    li.description,
                    li.qty !== undefined ? String(li.qty) : '—',
                    li.unit ?? '—',
                    li.rate !== undefined ? fmtCurrency(li.rate) : '—',
                    fmtCurrency(li.amount),
                ]
                if (hasGst) row.push(li.gst !== undefined ? `${li.gst}%` : '—')
                return row
            }),
            foot: [[
                '', 'Total', '', '', '',
                fmtCurrency(lineItems.reduce((s, li) => s + li.amount, 0)),
                ...(hasGst ? [''] : []),
            ]],
            margin: { left: ml, right: mr },
            theme: 'grid',
            styles: {
                fontSize: FONT.body,
                cellPadding: 2.5,
                lineColor: [180, 180, 180],
                lineWidth: 0.2,
                textColor: [30, 30, 30],
            },
            headStyles: {
                fillColor: PDF_COLORS.headerBg,
                textColor: PDF_COLORS.white,
                fontStyle: 'bold',
                halign: 'center',
            },
            footStyles: {
                fillColor: [240, 240, 245],
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { halign: 'left' },
                2: { halign: 'center', cellWidth: 15 },
                3: { halign: 'center', cellWidth: 15 },
                4: { halign: 'right', cellWidth: 25 },
                5: { halign: 'right', cellWidth: 28 },
            },
        })
        y = ((doc as any).lastAutoTable?.finalY ?? y + 26) + 4
    }

    // ── Amount in Words ───────────────────────────────────────────────────────
    doc.setDrawColor(200, 200, 200)
    doc.rect(ml, y, cw, 12, 'S')

    doc.setFontSize(FONT.body)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_COLORS.black)
    doc.text('Amount in Words:', ml + 3, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.text(numberToWords(amount), ml + 33, y + 5)

    doc.setFont('helvetica', 'bold')
    doc.text(`Net Amount: ${fmtCurrency(amount)}`, pw - mr - 3, y + 5, { align: 'right' })
    y += 16

    // ── Narration ─────────────────────────────────────────────────────────────
    if (narration) {
        doc.setFontSize(FONT.body)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text('Narration:', ml, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...PDF_COLORS.black)
        const lines = doc.splitTextToSize(narration, cw - 20)
        doc.text(lines, ml + 20, y)
        y += lines.length * 4.5 + 4
    }

    // ── Signatures ────────────────────────────────────────────────────────────
    const sigY = Math.max(y + 15, PAGE.height - 50)
    doc.setDrawColor(180, 180, 180)

    // Left signature
    doc.line(ml + 10, sigY, ml + 60, sigY)
    doc.setFontSize(FONT.small)
    doc.setTextColor(...PDF_COLORS.textMuted)
    doc.text('Prepared By', ml + 22, sigY + 5)

    // Center signature
    doc.line(pw / 2 - 25, sigY, pw / 2 + 25, sigY)
    doc.text('Checked By', pw / 2 - 12, sigY + 5)

    // Right signature
    doc.line(pw - mr - 60, sigY, pw - mr - 10, sigY)
    doc.text('Authorized Signatory', pw - mr - 50, sigY + 5)

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setFontSize(FONT.tiny)
    doc.setTextColor(...PDF_COLORS.textMuted)
    doc.text('This is a computer-generated document. No physical signature is required.', pw / 2, PAGE.height - 12, { align: 'center' })
    doc.text(`${COMPANY.name} | ${fmtDateTime()}`, pw / 2, PAGE.height - 8, { align: 'center' })

    // ── Save ──────────────────────────────────────────────────────────────────
    const safeName = (fileName || `${type.replace(/\s+/g, '_')}_${voucherNo}`).replace(/[^a-zA-Z0-9_-]/g, '')
    doc.save(`${safeName}.pdf`)
}
