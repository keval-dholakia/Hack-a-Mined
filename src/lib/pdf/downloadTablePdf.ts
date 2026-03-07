// ─── downloadTablePdf.ts ──────────────────────────────────────────────────────
// Client-side utility to download any tabular data as a styled PDF
// Uses jspdf + jspdf-autotable for precise layout control
//
// Usage:
//   downloadTablePdf({
//     title: 'Employee Register',
//     subtitle: '42 employees · Generated 07 Mar 2026',
//     columns: [
//       { header: 'Code', dataKey: 'emp_code' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Salary', dataKey: 'basic_salary', align: 'right', format: 'currency' },
//     ],
//     rows: employees,
//     fileName: 'employee_register',
//   })

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { COMPANY, PAGE, FONT, PDF_COLORS, fmtCurrency, fmtDate, fmtDateTime } from './pdfConstants'

export type ColumnDef = {
    header: string
    dataKey: string
    align?: 'left' | 'center' | 'right'
    format?: 'currency' | 'date' | 'number' | 'percent' | 'none'
    width?: number
}

export type TablePdfOptions = {
    title: string
    subtitle?: string
    columns: ColumnDef[]
    rows: Record<string, any>[]
    fileName?: string
    orientation?: 'portrait' | 'landscape'
    showSummary?: { label: string; value: string }[]
}

function formatCell(value: any, format?: string): string {
    if (value === null || value === undefined) return '—'
    switch (format) {
        case 'currency': return fmtCurrency(value)
        case 'date': return fmtDate(value)
        case 'number': return Number(value).toLocaleString('en-IN')
        case 'percent': return `${Number(value).toFixed(1)}%`
        default: return String(value)
    }
}

export function downloadTablePdf(opts: TablePdfOptions) {
    const { title, subtitle, columns, rows, fileName, orientation = 'portrait', showSummary } = opts
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })

    const pageWidth = orientation === 'landscape' ? PAGE.height : PAGE.width
    const marginLeft = PAGE.margin.left
    const marginRight = PAGE.margin.right
    const contentWidth = pageWidth - marginLeft - marginRight
    let y: number = PAGE.margin.top

    // ── Company Header ────────────────────────────────────────────────────────
    doc.setFillColor(...PDF_COLORS.headerBg)
    doc.rect(0, 0, pageWidth, 32, 'F')

    doc.setTextColor(...PDF_COLORS.white)
    doc.setFontSize(FONT.title)
    doc.setFont('helvetica', 'bold')
    doc.text(COMPANY.name, marginLeft, 12)

    doc.setFontSize(FONT.small)
    doc.setFont('helvetica', 'normal')
    doc.text(COMPANY.address, marginLeft, 18)
    doc.text(`GSTIN: ${COMPANY.gstin} | ${COMPANY.phone} | ${COMPANY.email}`, marginLeft, 23)

    // Timestamp top-right
    doc.setFontSize(FONT.tiny)
    doc.text(`Generated: ${fmtDateTime()}`, pageWidth - marginRight, 12, { align: 'right' })

    y = 40

    // ── Report Title ──────────────────────────────────────────────────────────
    doc.setTextColor(...PDF_COLORS.black)
    doc.setFontSize(FONT.heading)
    doc.setFont('helvetica', 'bold')
    doc.text(title, marginLeft, y)
    y += 5

    if (subtitle) {
        doc.setFontSize(FONT.body)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text(subtitle, marginLeft, y)
        y += 4
    }

    // Divider line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(marginLeft, y, pageWidth - marginRight, y)
    y += 4

    // ── Summary KPI row (optional) ────────────────────────────────────────────
    if (showSummary && showSummary.length > 0) {
        const boxWidth = contentWidth / showSummary.length
        showSummary.forEach((s, i) => {
            const x = marginLeft + i * boxWidth
            doc.setFillColor(245, 247, 250)
            doc.roundedRect(x + 1, y, boxWidth - 2, 12, 2, 2, 'F')

            doc.setFontSize(FONT.tiny)
            doc.setTextColor(...PDF_COLORS.textMuted)
            doc.setFont('helvetica', 'normal')
            doc.text(s.label.toUpperCase(), x + 4, y + 4)

            doc.setFontSize(FONT.body)
            doc.setTextColor(...PDF_COLORS.black)
            doc.setFont('helvetica', 'bold')
            doc.text(s.value, x + 4, y + 9.5)
        })
        y += 16
    }

    // ── Data Table ────────────────────────────────────────────────────────────
    const tableColumns = columns.map(c => ({
        header: c.header,
        dataKey: c.dataKey,
    }))

    const tableRows = rows.map(row => {
        const formatted: Record<string, string> = {}
        columns.forEach(c => {
            formatted[c.dataKey] = formatCell(row[c.dataKey], c.format)
        })
        return formatted
    })

    const columnStyles: Record<string, any> = {}
    columns.forEach(c => {
        if (c.align || c.width) {
            columnStyles[c.dataKey] = {
                ...(c.align ? { halign: c.align } : {}),
                ...(c.width ? { cellWidth: c.width } : {}),
            }
        }
    })

    autoTable(doc, {
        startY: y,
        head: [tableColumns.map(c => c.header)],
        body: tableRows.map(row => tableColumns.map(c => row[c.dataKey])),
        margin: { left: marginLeft, right: marginRight },
        theme: 'grid',
        styles: {
            fontSize: FONT.body,
            cellPadding: 2.5,
            lineColor: [200, 200, 200],
            lineWidth: 0.2,
            textColor: [30, 30, 30],
            font: 'helvetica',
        },
        headStyles: {
            fillColor: PDF_COLORS.headerBg,
            textColor: PDF_COLORS.white,
            fontStyle: 'bold',
            fontSize: FONT.small,
            halign: 'center',
        },
        alternateRowStyles: {
            fillColor: [250, 250, 252],
        },
        columnStyles: columns.reduce<Record<number, any>>((acc, c, i) => {
            if (c.align || c.width) {
                acc[i] = {
                    ...(c.align ? { halign: c.align } : {}),
                    ...(c.width ? { cellWidth: c.width } : {}),
                }
            }
            return acc
        }, {}),
        didDrawPage: (data) => {
            // Footer on each page
            const pageCount = (doc as any).internal.getNumberOfPages()
            const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber
            doc.setFontSize(FONT.tiny)
            doc.setTextColor(...PDF_COLORS.textMuted)
            doc.text(
                `Page ${pageNum} of ${pageCount}`,
                pageWidth / 2,
                (orientation === 'landscape' ? PAGE.width : PAGE.height) - 10,
                { align: 'center' }
            )
            doc.text(
                `${COMPANY.name} — Confidential`,
                marginLeft,
                (orientation === 'landscape' ? PAGE.width : PAGE.height) - 10,
            )
        },
    })

    // ── Row count footer ──────────────────────────────────────────────────────
    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 20
    if (finalY + 10 < (orientation === 'landscape' ? PAGE.width : PAGE.height) - PAGE.margin.bottom) {
        doc.setFontSize(FONT.small)
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text(`Total Records: ${rows.length}`, marginLeft, finalY + 6)
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const safeName = (fileName || title.replace(/\s+/g, '_')).replace(/[^a-zA-Z0-9_-]/g, '')
    doc.save(`${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`)
}
