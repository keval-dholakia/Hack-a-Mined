import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log("Seeding HR data...")

    // 1. Employees
    const employeesData = [
        {
            emp_code: 'EMP-1001',
            name: 'John Doe',
            designation: 'Software Engineer',
            department: 'IT',
            mobile: '9876543210',
            email: 'john@techmicra.com',
            joining_date: '2022-03-01',
            basic_salary: 40000,
            bank_name: 'HDFC Bank',
            bank_account: '00001234567',
            bank_ifsc: 'HDFC0001234'
        },
        {
            emp_code: 'EMP-1002',
            name: 'Jane Smith',
            designation: 'HR Manager',
            department: 'HR',
            mobile: '9876543211',
            email: 'jane@techmicra.com',
            joining_date: '2021-06-15',
            basic_salary: 50000,
            bank_name: 'ICICI Bank',
            bank_account: '00001234568',
            bank_ifsc: 'ICIC0001234'
        },
        {
            emp_code: 'EMP-1003',
            name: 'Mark Johnson',
            designation: 'Production Supervisor',
            department: 'Production',
            mobile: '9876543212',
            email: 'mark@techmicra.com',
            joining_date: '2020-01-10',
            basic_salary: 35000,
            bank_name: 'State Bank of India',
            bank_account: '00001234569',
            bank_ifsc: 'SBIN0001234'
        }
    ]
    const { data: employees, error: empErr } = await supabase.from('employees').insert(employeesData).select()
    if (empErr) { console.error("Error inserting employees:", empErr); return }
    console.log(`Inserted ${employees.length} employees.`)

    // 2. Salary Heads
    const headsData = [
        { name: 'House Rent Allowance (HRA)', type: 'Earning' },
        { name: 'Special Allowance', type: 'Earning' },
        { name: 'Medical Allowance', type: 'Earning' },
        { name: 'Provident Fund (PF)', type: 'Deduction' },
        { name: 'Professional Tax (PT)', type: 'Deduction' },
        { name: 'TDS', type: 'Deduction' },
    ]
    // In case they exist
    let heads = []
    for (const h of headsData) {
        const { data, error } = await supabase.from('salary_heads').upsert({ ...h, is_active: 1 }, { onConflict: 'name' }).select()
        if (data) heads.push(data[0])
    }
    console.log(`Inserted/Found ${heads.length} salary heads.`)

    // Create lookup for heads
    const hd = (name: string) => heads.find(h => h.name.includes(name))?.id!

    // 3. Structures (Year 9999, Month 1)
    for (const emp of employees) {
        let gross = emp.basic_salary
        let items = []

        if (emp.emp_code === 'EMP-1001') {
            // IT - John Doe basic 40000
            items.push({ salary_head_id: hd('HRA'), amount: 20000 })
            items.push({ salary_head_id: hd('Special Allowance'), amount: 15000 })
            items.push({ salary_head_id: hd('Provident Fund'), amount: 1800 })
            items.push({ salary_head_id: hd('Professional Tax'), amount: 200 })
            items.push({ salary_head_id: hd('TDS'), amount: 3000 })
        } else if (emp.emp_code === 'EMP-1002') {
            // HR - Jane Smith basic 50000
            items.push({ salary_head_id: hd('HRA'), amount: 25000 })
            items.push({ salary_head_id: hd('Medical Allowance'), amount: 5000 })
            items.push({ salary_head_id: hd('Provident Fund'), amount: 1800 })
            items.push({ salary_head_id: hd('Professional Tax'), amount: 200 })
            items.push({ salary_head_id: hd('TDS'), amount: 4500 })
        } else {
            // Prod - Mark Johnson basic 35000
            items.push({ salary_head_id: hd('HRA'), amount: 14000 })
            items.push({ salary_head_id: hd('Special Allowance'), amount: 6000 })
            items.push({ salary_head_id: hd('Provident Fund'), amount: 1800 })
            items.push({ salary_head_id: hd('Professional Tax'), amount: 200 })
        }

        let earningSum = 0, dedSum = 0
        for (const it of items) {
            if (heads.find(h => h.id === it.salary_head_id)?.type === 'Earning') earningSum += it.amount
            else dedSum += it.amount
        }
        gross += earningSum

        // Create structure sheet
        const { data: structSheet, error: structErr } = await supabase.from('salary_sheets').insert({
            employee_id: emp.id,
            month: 1,
            year: 9999,
            total_days: 0,
            present_days: 0,
            gross_salary: gross,
            total_deductions: dedSum,
            net_pay: gross - dedSum,
            status: 'Draft'
        }).select().single()

        if (structErr) console.error("Error struct:", structErr)

        // Insert structure items
        if (structSheet) {
            const dbItems = items.map(it => ({ salary_sheet_id: structSheet.id, ...it }))
            await supabase.from('salary_sheet_items').insert(dbItems)
        }

        // Create a real payroll sheet for Last Month (e.g., Feb 2026)
        const { data: realSheet, error: realErr } = await supabase.from('salary_sheets').insert({
            employee_id: emp.id,
            month: 2,
            year: 2026,
            total_days: 28,
            present_days: emp.emp_code === 'EMP-1001' ? 26 : 28, // John took 2 days off
            gross_salary: emp.emp_code === 'EMP-1001' ? Math.round((gross / 28) * 26) : gross,
            total_deductions: dedSum,
            net_pay: (emp.emp_code === 'EMP-1001' ? Math.round((gross / 28) * 26) : gross) - dedSum,
            status: 'Paid'
        }).select().single()

        if (realSheet) {
            const realItems = items.map(it => {
                let amt = it.amount
                if (emp.emp_code === 'EMP-1001' && heads.find(h => h.id === it.salary_head_id)?.type === 'Earning') {
                    amt = Math.round((amt / 28) * 26)
                }
                return { salary_sheet_id: realSheet.id, salary_head_id: it.salary_head_id, amount: amt }
            })
            await supabase.from('salary_sheet_items').insert(realItems)
        }
    }

    console.log("Successfully seeded interconnected HR data!")
}

seed().catch(console.error)
