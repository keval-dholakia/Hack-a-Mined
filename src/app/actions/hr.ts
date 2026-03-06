'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EmployeeFormData } from '@/types/hr'

// ── Employees ─────────────────────────────────────────────────────────────────

export async function getEmployees() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) return []
    return data
}

export async function getEmployeeById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('employees').select('*').eq('id', id).single()
    if (error) return null
    return data
}

export async function createEmployee(formData: EmployeeFormData) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('employees')
        .insert([{ ...formData, is_active: 1 }])
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/employees')
    return { success: true }
}

export async function updateEmployee(id: number, formData: EmployeeFormData) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('employees')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/employees')
    return { success: true }
}

export async function toggleEmployeeStatus(id: number, is_active: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('employees')
        .update({ is_active: is_active === 1 ? 0 : 1 })
        .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/employees')
    return { success: true }
}

export async function getEmployeesForSelect() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('employees')
        .select('id, emp_code, name, designation, department, basic_salary')
        .eq('is_active', 1)
        .order('name')
    if (error) return []
    return data
}

// ── Salary Heads ──────────────────────────────────────────────────────────────

export async function getSalaryHeads() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('salary_heads')
        .select('*')
        .order('type', { ascending: true })
    if (error) return []
    return data
}

export async function createSalaryHead(name: string, type: 'Earning' | 'Deduction') {
    const supabase = await createClient()
    const { error } = await supabase
        .from('salary_heads')
        .insert([{ name, type, is_active: 1 }])
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/salary-heads')
    return { success: true }
}

export async function updateSalaryHead(id: number, name: string, type: 'Earning' | 'Deduction') {
    const supabase = await createClient()
    const { error } = await supabase
        .from('salary_heads')
        .update({ name, type })
        .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/salary-heads')
    return { success: true }
}

export async function toggleSalaryHeadStatus(id: number, is_active: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('salary_heads')
        .update({ is_active: is_active === 1 ? 0 : 1 })
        .eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/hr/salary-heads')
    return { success: true }
}

// ── Salary Sheets ─────────────────────────────────────────────────────────────

export async function getSalarySheets() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('salary_sheets')
        .select(`
      *,
      employees (id, name, emp_code, designation, department),
      salary_sheet_items (
        id, salary_head_id, amount,
        salary_heads (id, name, type)
      )
    `)
        .neq('year', 9999)                           // exclude structure sentinel rows
        .order('year', { ascending: false })
        .order('month', { ascending: false })
    if (error) return []
    return data
}

export async function getSalarySheetById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('salary_sheets')
        .select(`
      *,
      employees (id, name, emp_code, designation, department),
      salary_sheet_items (
        id, salary_head_id, amount,
        salary_heads (id, name, type)
      )
    `)
        .eq('id', id)
        .single()
    if (error) return null
    return data
}

export async function getSalarySheetsByEmployee(employee_id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('salary_sheets')
        .select(`
      *,
      salary_sheet_items (
        id, salary_head_id, amount,
        salary_heads (id, name, type)
      )
    `)
        .eq('employee_id', employee_id)
        .neq('year', 9999)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
    if (error) return []
    return data
}

export type SalarySheetPayload = {
    employee_id: number
    month: number
    year: number
    total_days: number
    present_days: number
    items: { salary_head_id: number; amount: number }[]
}

export async function createSalarySheet(payload: SalarySheetPayload) {
    const supabase = await createClient()

    const headIds = payload.items.map(i => i.salary_head_id)
    const { data: heads } = await supabase
        .from('salary_heads').select('id, type').in('id', headIds)

    const typeMap: Record<number, string> = {}
        ; (heads ?? []).forEach((h: any) => { typeMap[h.id] = h.type })

    const { data: emp } = await supabase.from('employees').select('basic_salary').eq('id', payload.employee_id).single()
    const basic = emp ? Number(emp.basic_salary) : 0
    const prorated_basic = payload.total_days > 0 ? Math.round((basic / payload.total_days) * payload.present_days) : 0

    let gross = prorated_basic, deductions = 0
    payload.items.forEach(item => {
        if (typeMap[item.salary_head_id] === 'Earning') gross += Number(item.amount)
        else deductions += Number(item.amount)
    })

    const net_pay = gross - deductions

    if (net_pay < 0) {
        return { error: 'Net pay cannot be negative. Deductions exceed gross salary.' }
    }

    const { data: sheet, error: sheetErr } = await supabase
        .from('salary_sheets')
        .insert([{
            employee_id: payload.employee_id,
            month: payload.month,
            year: payload.year,
            total_days: payload.total_days,
            present_days: payload.present_days,
            gross_salary: gross,
            total_deductions: deductions,
            net_pay,
            status: 'Draft',
        }])
        .select('id')
        .single()

    if (sheetErr || !sheet) return { error: sheetErr?.message ?? 'Failed to create sheet' }

    const itemRows = payload.items.map(i => ({
        salary_sheet_id: sheet.id,
        salary_head_id: i.salary_head_id,
        amount: i.amount,
    }))
    const { error: itemErr } = await supabase.from('salary_sheet_items').insert(itemRows)
    if (itemErr) return { error: itemErr.message }

    revalidatePath('/dashboard/hr/salary-sheet')
    return { success: true, id: sheet.id }
}

export async function updateSalarySheetStatus(id: number, status: 'Draft' | 'Approved' | 'Paid') {
    const supabase = await createClient()
    const { error } = await supabase
        .from('salary_sheets')
        .update({ status })
        .eq('id', id)
    if (error) return { error: error.message }

    // Automated Mail Dispatcher
    if (status === 'Paid') {
        try {
            const { buildSalaryPdfBuffer } = await import('@/lib/pdf/generateSalaryPdf')
            const { sendPayslipEmail } = await import('@/lib/email')

            const { buffer, fileName, payload } = await buildSalaryPdfBuffer(id)
            const emailRes = await sendPayslipEmail(
                payload.employee.email,
                buffer,
                fileName,
                payload.employee.name,
                payload.salary.month,
                payload.salary.year
            )

            if (emailRes?.error) {
                console.warn('[HR Server]: Payslip generated but email failed:', emailRes.error)
            }
        } catch (err) {
            console.error('[HR Server]: Mail generation/dispatch pipeline crashed', err)
        }
    }

    revalidatePath('/dashboard/hr/salary-sheet')
    return { success: true }
}

// ── Salary Structure ──────────────────────────────────────────────────────────
// Strategy: each employee has ONE dedicated "structure" salary_sheet row
// identified by year = 9999, month = 1 (sentinel values, never a real payroll).
// salary_sheet_items for that sheet = the employee's salary structure template.

const STRUCTURE_YEAR = 9999
const STRUCTURE_MONTH = 1

async function getStructureSheetId(employee_id: number): Promise<number | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('salary_sheets')
        .select('id')
        .eq('employee_id', employee_id)
        .eq('year', STRUCTURE_YEAR)
        .eq('month', STRUCTURE_MONTH)
        .maybeSingle()
    return data?.id ?? null
}

export async function getEmployeeSalaryStructure(employee_id: number) {
    const supabase = await createClient()
    const sheetId = await getStructureSheetId(employee_id)
    if (!sheetId) return []

    const { data, error } = await supabase
        .from('salary_sheet_items')
        .select(`
      id, salary_head_id, amount,
      salary_heads (id, name, type, is_active)
    `)
        .eq('salary_sheet_id', sheetId)
    if (error) return []
    return data
}

export type StructureItem = { salary_head_id: number; amount: number }

export async function saveEmployeeSalaryStructure(
    employee_id: number,
    items: StructureItem[]
) {
    const supabase = await createClient()

    // Compute totals
    const headIds = items.map(i => i.salary_head_id)
    const { data: heads } = await supabase
        .from('salary_heads').select('id, type').in('id', headIds)

    const typeMap: Record<number, string> = {}
        ; (heads ?? []).forEach((h: any) => { typeMap[h.id] = h.type })

    const { data: emp } = await supabase.from('employees').select('basic_salary').eq('id', employee_id).single()
    const basic = emp ? Number(emp.basic_salary) : 0

    let gross = basic, ded = 0
    items.forEach(it => {
        if (typeMap[it.salary_head_id] === 'Earning') gross += Number(it.amount)
        else ded += Number(it.amount)
    })

    const net_pay = gross - ded
    if (net_pay < 0) {
        return { error: 'Net pay cannot be negative. Deductions exceed gross salary.' }
    }

    let sheetId = await getStructureSheetId(employee_id)

    if (!sheetId) {
        const { data: newSheet, error: sheetErr } = await supabase
            .from('salary_sheets')
            .insert([{
                employee_id,
                month: STRUCTURE_MONTH,
                year: STRUCTURE_YEAR,
                total_days: 0,
                present_days: 0,
                gross_salary: gross,
                total_deductions: ded,
                net_pay: net_pay,
                status: 'Draft',
            }])
            .select('id')
            .single()
        if (sheetErr || !newSheet) return { error: sheetErr?.message ?? 'Failed to create structure' }
        sheetId = newSheet.id
    } else {
        await supabase
            .from('salary_sheets')
            .update({ gross_salary: gross, total_deductions: ded, net_pay: net_pay })
            .eq('id', sheetId)
        await supabase.from('salary_sheet_items').delete().eq('salary_sheet_id', sheetId)
    }

    const validItems = items.filter(i => Number(i.amount) > 0)
    if (validItems.length > 0) {
        const rows = validItems.map(i => ({
            salary_sheet_id: sheetId!,
            salary_head_id: i.salary_head_id,
            amount: i.amount,
        }))
        const { error: itemErr } = await supabase.from('salary_sheet_items').insert(rows)
        if (itemErr) return { error: itemErr.message }
    }

    revalidatePath('/dashboard/hr/salary-structure')
    return { success: true }
}

export async function getAllEmployeesWithStructure() {
    const supabase = await createClient()

    const { data: employees } = await supabase
        .from('employees')
        .select('id, emp_code, name, designation, department, basic_salary, is_active')
        .order('name')

    if (!employees) return []

    // Get all structure sentinel sheets
    const { data: structures } = await supabase
        .from('salary_sheets')
        .select(`
      id, employee_id, gross_salary, total_deductions, net_pay,
      salary_sheet_items (
        id, salary_head_id, amount,
        salary_heads (id, name, type)
      )
    `)
        .eq('year', STRUCTURE_YEAR)
        .eq('month', STRUCTURE_MONTH)

    const structureMap: Record<number, any> = {}
        ; (structures ?? []).forEach((s: any) => { structureMap[s.employee_id] = s })

    return employees.map((e: any) => ({
        ...e,
        structure: structureMap[e.id] ?? null,
    }))
}
