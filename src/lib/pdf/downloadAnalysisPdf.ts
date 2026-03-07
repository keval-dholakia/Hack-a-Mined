// ─── downloadAnalysisPdf.ts ───────────────────────────────────────────────────
// Client-side utility to capture analytics page screenshots as a PDF report
// Uses html2canvas to render the DOM + jspdf to build the PDF
//
// Usage:
//   const ref = useRef<HTMLDivElement>(null)
//   <div ref={ref}>...charts...</div>
//   <button onClick={() => downloadAnalysisPdf(ref, 'Employee Analytics')}>Export</button>

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { COMPANY, FONT, PDF_COLORS, fmtDateTime } from './pdfConstants'

export type AnalysisPdfOptions = {
    /** Title printed on the report */
    title: string
    subtitle?: string
    fileName?: string
    orientation?: 'portrait' | 'landscape'
}

/**
 * Capture an HTML container as a multi-page PDF report.
 * @param containerRef - React ref to the DOM element to capture
 * @param titleOrOpts - Title string or full options object
 */
export async function downloadAnalysisPdf(
    containerRef: React.RefObject<HTMLElement | null>,
    titleOrOpts: string | AnalysisPdfOptions,
) {
    const opts: AnalysisPdfOptions = typeof titleOrOpts === 'string'
        ? { title: titleOrOpts }
        : titleOrOpts

    const { title, subtitle, fileName, orientation = 'portrait' } = opts

    const container = containerRef.current
    if (!container) {
        console.warn('[downloadAnalysisPdf] No container ref provided')
        return
    }

    // ── Capture the container ─────────────────────────────────────────────────
    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f1117', // match app dark background
        logging: false,
        // Ignore any fixed-position overlays
        ignoreElements: (el) => el.tagName === 'NAV' || el.classList.contains('sidebar'),
    })

    const imgData = canvas.toDataURL('image/png')
    const imgW = canvas.width
    const imgH = canvas.height

    // ── Create PDF ────────────────────────────────────────────────────────────
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' })
    const pageW = orientation === 'landscape' ? 297 : 210
    const pageH = orientation === 'landscape' ? 210 : 297

    const margin = 10
    const headerH = 30
    const footerH = 12
    const contentW = pageW - margin * 2
    const contentH = pageH - headerH - footerH - margin

    // Scale the image to fit the content width
    const scale = contentW / (imgW / 2)  // divide by canvas scale (2)
    const scaledH = (imgH / 2) * scale
    const totalPages = Math.ceil(scaledH / contentH)

    for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage()

        // ── Header Band ───────────────────────────────────────────────────────
        doc.setFillColor(...PDF_COLORS.headerBg)
        doc.rect(0, 0, pageW, headerH, 'F')

        doc.setTextColor(...PDF_COLORS.white)
        doc.setFontSize(FONT.heading)
        doc.setFont('helvetica', 'bold')
        doc.text(title, margin, 10)

        if (subtitle) {
            doc.setFontSize(FONT.small)
            doc.setFont('helvetica', 'normal')
            doc.text(subtitle, margin, 16)
        }

        doc.setFontSize(FONT.tiny)
        doc.setFont('helvetica', 'normal')
        doc.text(`${COMPANY.name} | ${COMPANY.address}`, margin, 22)
        doc.text(`Report generated: ${fmtDateTime()}`, pageW - margin, 10, { align: 'right' })
        doc.text(`Page ${page + 1} of ${totalPages}`, pageW - margin, 16, { align: 'right' })

        // ── Content (clipped image slice) ─────────────────────────────────────
        const sourceY = page * contentH / scale * 2  // un-scale to canvas coords
        const sourceH = Math.min(contentH / scale * 2, imgH - sourceY)

        if (sourceH <= 0) continue

        // Create a sliced canvas for this page
        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = imgW
        sliceCanvas.height = sourceH
        const sliceCtx = sliceCanvas.getContext('2d')
        if (sliceCtx) {
            sliceCtx.drawImage(canvas, 0, sourceY, imgW, sourceH, 0, 0, imgW, sourceH)
            const sliceImg = sliceCanvas.toDataURL('image/png')
            const sliceRenderedH = (sourceH / 2) * scale
            doc.addImage(sliceImg, 'PNG', margin, headerH + 2, contentW, sliceRenderedH)
        }

        // ── Footer ────────────────────────────────────────────────────────────
        doc.setFontSize(FONT.tiny)
        doc.setTextColor(...PDF_COLORS.textMuted)
        doc.text(
            `${COMPANY.name} — Analytics Report — Confidential`,
            pageW / 2,
            pageH - 5,
            { align: 'center' }
        )
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const safeName = (fileName || title.replace(/\s+/g, '_')).replace(/[^a-zA-Z0-9_-]/g, '')
    doc.save(`${safeName}_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
}
