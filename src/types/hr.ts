// ── HR Module Types ────────────────────────────────────────────────────────────

export type Employee = {
    id: number
    emp_code: string | null
    name: string
    designation: string | null
    department: string | null
    mobile: string | null
    email: string | null
    joining_date: string | null
    basic_salary: number
    bank_name: string | null
    bank_account: string | null
    bank_ifsc: string | null
    is_active: number
    created_at: string
    updated_at: string
}

export type EmployeeFormData = {
    emp_code: string
    name: string
    designation: string
    department: string
    mobile: string
    email: string
    joining_date: string
    basic_salary: number
    bank_name: string
    bank_account: string
    bank_ifsc: string
}

export type SalaryHead = {
    id: number
    name: string
    type: 'Earning' | 'Deduction'
    is_active: number
    created_at: string
}

export type SalaryHeadFormData = {
    name: string
    type: 'Earning' | 'Deduction'
}

export type SalarySheetItem = {
    id: number
    salary_sheet_id: number
    salary_head_id: number
    amount: number
    // joined
    head_name?: string
    head_type?: 'Earning' | 'Deduction'
}

export type SalarySheet = {
    id: number
    employee_id: number
    month: number
    year: number
    total_days: number
    present_days: number
    gross_salary: number
    total_deductions: number
    net_pay: number
    status: 'Draft' | 'Approved' | 'Paid'
    created_at: string
    // joined
    employee_name?: string
    emp_code?: string
    designation?: string
    department?: string
    items?: SalarySheetItem[]
}
