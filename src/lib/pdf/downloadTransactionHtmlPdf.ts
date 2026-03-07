import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { transactionHtml } from './transactionTemplate'

export async function downloadTransactionHtmlPdf(opts: any) {
  const id = '__txn_pdf_temp'
  let container = document.getElementById(id) as HTMLDivElement | null
  if (container) container.remove()
  container = document.createElement('div')
  container.id = id
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '820px'
  container.style.padding = '20px'
  container.style.background = '#fff'
  container.innerHTML = transactionHtml(opts)
  document.body.appendChild(container)

  await new Promise(resolve => setTimeout(resolve, 150))

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
  const img = canvas.toDataURL('image/png')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = 210
  const pageH = 297

  const imgW = canvas.width
  const imgH = canvas.height

  const pxToMm = (px: number) => px * 0.264583
  const renderedW = pxToMm(imgW)
  const renderedH = pxToMm(imgH)

  const scale = Math.min((pageW - 20) / renderedW, (pageH - 30) / renderedH)
  const outW = renderedW * scale
  const outH = renderedH * scale

  doc.addImage(img, 'PNG', 10, 10, outW, outH)
  const safeName = `${(opts.type || 'Voucher').replace(/\s+/g, '_')}_${opts.voucherNo || Date.now()}`.replace(/[^a-zA-Z0-9_\-]/g, '')
  doc.save(`${safeName}.pdf`)

  container.remove()
}

export default downloadTransactionHtmlPdf
