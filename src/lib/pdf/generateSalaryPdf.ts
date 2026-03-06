import { createClient } from '@/lib/supabase/server'
import { generateSalaryPdfDoc } from './SalaryReceiptTemplate'
import { renderToBuffer, renderToStream } from '@react-pdf/renderer'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export async function fetchSalarySheetPayload(id: number | string) {
    const supabase = await createClient()

    const { data: sheet, error } = await supabase
        .from('salary_sheets')
        .select(`
      *,
      employees (emp_code, name, designation, department, joining_date, bank_name, bank_account, bank_ifsc, basic_salary, email),
      salary_sheet_items (
        id, amount,
        salary_heads (name, type)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !sheet) {
        throw new Error('Salary sheet not found')
    }

    const emp = sheet.employees
    const items = sheet.salary_sheet_items ?? []

    const earnings = items
        .filter((i: any) => i.salary_heads?.type === 'Earning')
        .map((i: any) => ({ name: i.salary_heads.name, amount: Number(i.amount) }))

    const deducts = items
        .filter((i: any) => i.salary_heads?.type === 'Deduction')
        .map((i: any) => ({ name: i.salary_heads.name, amount: Number(i.amount) }))

    const earningSum = earnings.reduce((s: number, i: any) => s + i.amount, 0)
    const basicSalary = Number(sheet.gross_salary) - earningSum

    if (basicSalary > 0) {
        earnings.unshift({ name: 'Basic Salary', amount: basicSalary })
    }

    return {
        company: {
            name: "TechMicra ERP",
            address: "123 Tech Court, Software Park, Surat, Gujarat",
            gstin: "24ABCDE1234F1Z5",
            phone: "+91 9876543210",
            email: "hr@techmicra.com"
        },
        employee: {
            emp_code: emp.emp_code ?? '—',
            name: emp.name ?? '—',
            designation: emp.designation ?? '—',
            department: emp.department ?? '—',
            joining_date: emp.joining_date ?? '—',
            bank_name: emp.bank_name ?? '—',
            bank_account: emp.bank_account ?? '—',
            bank_ifsc: emp.bank_ifsc ?? '—',
            email: emp.email ?? ''
        },
        salary: {
            month: MONTHS[sheet.month - 1] ?? '',
            year: sheet.year,
            total_days: sheet.total_days,
            present_days: sheet.present_days,
            gross_salary: Number(sheet.gross_salary),
            total_deductions: Number(sheet.total_deductions),
            net_pay: Number(sheet.net_pay)
        },
        earnings,
        deductions: deducts
    }
}

export async function buildSalaryPdfBuffer(id: number | string): Promise<{ buffer: Buffer; fileName: string; payload: any }> {
    const payload = await fetchSalarySheetPayload(id)
    const element = generateSalaryPdfDoc(payload)
    // @react-pdf/renderer renderToBuffer doesn't stream, it gives a raw Buffer which is perfect for email attachments
    const buffer = await renderToBuffer(element)

    const fileName = `Payslip_${payload.employee.name.replace(/\\s+/g, '_')}_${payload.salary.month}_${payload.salary.year}.pdf`

    return { buffer, fileName, payload }
}

export async function streamSalaryPdf(id: number | string) {
    const payload = await fetchSalarySheetPayload(id)
    const element = generateSalaryPdfDoc(payload)

    const stream = await renderToStream(element)
    const fileName = `Payslip_${payload.employee.name.replace(/\\s+/g, '_')}_${payload.salary.month}_${payload.salary.year}.pdf`

    return { stream, fileName, payload }
}
