'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee, updateEmployee } from '@/app/actions/hr'
import type { Employee, EmployeeFormData } from '@/types/hr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = { employee?: Employee }

const DEPARTMENTS = [
    'Production', 'Quality', 'Purchase', 'Sales', 'Finance',
    'HR', 'Stores', 'Maintenance', 'Admin', 'IT', 'Logistics',
]
const BANKS = [
    'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank',
    'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank',
    'Union Bank of India', 'Canara Bank', 'YES Bank',
]

const EMPTY: EmployeeFormData = {
    emp_code: '', name: '', designation: '', department: '',
    mobile: '', email: '', joining_date: '',
    basic_salary: 0,
    bank_name: '', bank_account: '', bank_ifsc: '',
}

export default function EmployeeForm({ employee }: Props) {
    const router = useRouter()
    const isEdit = !!employee

    const [form, setForm] = useState<EmployeeFormData>(
        employee ? {
            emp_code: employee.emp_code ?? '',
            name: employee.name,
            designation: employee.designation ?? '',
            department: employee.department ?? '',
            mobile: employee.mobile ?? '',
            email: employee.email ?? '',
            joining_date: employee.joining_date ? employee.joining_date.split('T')[0] : '',
            basic_salary: employee.basic_salary,
            bank_name: employee.bank_name ?? '',
            bank_account: employee.bank_account ?? '',
            bank_ifsc: employee.bank_ifsc ?? '',
        } : EMPTY
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function set(key: keyof EmployeeFormData, value: string | number) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const result = isEdit
            ? await updateEmployee(employee!.id, form)
            : await createEmployee(form)
        if (result.error) { setError(result.error); setLoading(false); return }
        router.push('/dashboard/hr/employees')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isEdit ? 'Edit Employee' : 'New Employee'}</h1>
                    <p className={styles.subtitle}>{isEdit ? `Editing ${employee!.name}` : 'Add a new employee to the system'}</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    <Card title="Personal Information">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Employee Code</label>
                                <input placeholder="e.g. EMP-001" value={form.emp_code} onChange={e => set('emp_code', e.target.value)} />
                            </div>
                            <div className={`${styles.field} ${styles.span2}`} style={{ gridColumn: 'span 1' }}>
                                <label>Full Name <span className={styles.req}>*</span></label>
                                <input required placeholder="Employee full name" value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Designation</label>
                                <input placeholder="e.g. Sr. Engineer" value={form.designation} onChange={e => set('designation', e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Department</label>
                                <select value={form.department} onChange={e => set('department', e.target.value)}>
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Mobile</label>
                                <input placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} maxLength={15} />
                            </div>
                            <div className={styles.field}>
                                <label>Email</label>
                                <input type="email" placeholder="employee@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Joining Date</label>
                                <input type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>Basic Salary (₹)</label>
                                <input type="number" min={0} step={100} value={form.basic_salary}
                                    onChange={e => set('basic_salary', Number(e.target.value))} />
                            </div>
                        </div>
                    </Card>

                    <Card title="Bank Details">
                        <div className={styles.fields}>
                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Bank Name</label>
                                <select value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
                                    <option value="">Select bank</option>
                                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Account Number</label>
                                <input placeholder="Account number" value={form.bank_account} onChange={e => set('bank_account', e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label>IFSC Code</label>
                                <input placeholder="e.g. HDFC0001234" value={form.bank_ifsc}
                                    onChange={e => set('bank_ifsc', e.target.value.toUpperCase())} maxLength={11} />
                            </div>
                        </div>
                    </Card>

                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
