'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSalarySheet } from '@/app/actions/hr'
import type { Employee, SalaryHead } from '@/types/hr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = {
    employees: Employee[]
    salaryHeads: SalaryHead[]
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

const CY = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CY - i)

export default function SalarySheetForm({ employees, salaryHeads }: Props) {
    const router = useRouter()
    const params = useSearchParams()
    const preselected = params.get('emp')

    const [empId, setEmpId] = useState<number>(preselected ? Number(preselected) : 0)
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(CY)
    const [totalDays, setTotalDays] = useState(26)
    const [presentDays, setPresentDays] = useState(26)
    const [amounts, setAmounts] = useState<Record<number, number>>({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const employee = employees.find(e => e.id === empId)

    const activeHeads = salaryHeads.filter(h => h.is_active === 1)
    const earnings = activeHeads.filter(h => h.type === 'Earning')
    const deductions = activeHeads.filter(h => h.type === 'Deduction')

    // Pre-fill amounts from actual salary structure when employee is selected
    function handleEmpChange(id: number) {
        setEmpId(id)
        const emp = employees.find((e: any) => e.id === id) as any
        if (!emp) return

        const newAmounts: Record<number, number> = {}
        if (emp.structure && emp.structure.salary_sheet_items) {
            emp.structure.salary_sheet_items.forEach((it: any) => {
                newAmounts[it.salary_head_id] = Number(it.amount) || 0
            })
        } else {
            // Fallback: Auto-fill Basic head if exists and no structure is defined
            const basicHead = earnings.find(h => h.name.toLowerCase() === 'basic')
            if (basicHead) {
                newAmounts[basicHead.id] = emp.basic_salary || 0
            }
        }
        setAmounts(newAmounts)
    }

    function setAmount(headId: number, val: number) {
        setAmounts(prev => ({ ...prev, [headId]: val }))
    }

    const totals = useMemo(() => {
        let gross = 0, ded = 0
        earnings.forEach(h => { gross += amounts[h.id] ?? 0 })
        deductions.forEach(h => { ded += amounts[h.id] ?? 0 })

        const basic = employee ? Number(employee.basic_salary) : 0
        const proratedBasic = totalDays > 0 ? Math.round((basic / totalDays) * presentDays) : 0
        gross += proratedBasic

        return { basic: proratedBasic, gross, ded, net: gross - ded }
    }, [amounts, earnings, deductions, employee, totalDays, presentDays])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!empId) { setError('Please select an employee'); return }
        setLoading(true); setError(null)

        const items = activeHeads
            .filter(h => (amounts[h.id] ?? 0) > 0)
            .map(h => ({ salary_head_id: h.id, amount: amounts[h.id] ?? 0 }))

        const result = await createSalarySheet({
            employee_id: empId,
            month, year,
            total_days: totalDays,
            present_days: presentDays,
            items,
        })

        setLoading(false)
        if (result.error) { setError(result.error); return }
        router.push('/dashboard/hr/salary-sheet')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>New Salary Sheet</h1>
                    <p className={styles.subtitle}>Generate monthly salary sheet for an employee</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    {/* Employee & Period */}
                    <Card title="Employee & Period">
                        <div className={styles.fields3}>
                            <div className={styles.field}>
                                <label>Employee <span className={styles.req}>*</span></label>
                                <select value={empId} onChange={e => handleEmpChange(Number(e.target.value))}>
                                    <option value={0}>— Select Employee —</option>
                                    {employees.filter(e => e.is_active === 1).map(e => (
                                        <option key={e.id} value={e.id}>
                                            {e.emp_code ? `[${e.emp_code}] ` : ''}{e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Month</label>
                                <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Year</label>
                                <select value={year} onChange={e => setYear(Number(e.target.value))}>
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Total Working Days</label>
                                <input type="number" min={1} max={31} value={totalDays}
                                    onChange={e => setTotalDays(Number(e.target.value))} />
                            </div>
                            <div className={styles.field}>
                                <label>Days Present</label>
                                <input type="number" min={0} max={totalDays} value={presentDays}
                                    onChange={e => setPresentDays(Number(e.target.value))} />
                            </div>
                            {employee && (
                                <div className={styles.field}>
                                    <label>Employee Info</label>
                                    <div style={{
                                        padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)',
                                        background: '#0f1117', borderRadius: '8px', border: '1px solid #1f2235', lineHeight: 1.6
                                    }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>{employee.name}</strong><br />
                                        {employee.designation} · {employee.department}<br />
                                        <span style={{ fontFamily: 'var(--mono)', color: '#22d3ee' }}>Basic: ₹{employee.basic_salary.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Earnings */}
                    {earnings.length > 0 && (
                        <Card title="Earnings" action={<span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--mono)' }}>₹{totals.gross.toLocaleString('en-IN')}</span>}>
                            <table className={styles.salaryTable}>
                                <thead>
                                    <tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr>
                                </thead>
                                <tbody>
                                    {totals.basic > 0 && (
                                        <tr className={styles.earningRow}>
                                            <td>
                                                Basic Salary
                                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                    (Prorated based on {presentDays}/{totalDays} attendance)
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, paddingRight: '0.65rem' }}>
                                                ₹{totals.basic.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    )}
                                    {earnings.map(h => (
                                        <tr key={h.id} className={styles.earningRow}>
                                            <td>{h.name}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="number" min={0} step={1}
                                                    className={styles.amtInput}
                                                    value={amounts[h.id] ?? ''}
                                                    placeholder="0"
                                                    onChange={e => setAmount(h.id, Number(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}

                    {/* Deductions */}
                    {deductions.length > 0 && (
                        <Card title="Deductions" action={<span style={{ fontSize: '0.72rem', color: '#f43f5e', fontFamily: 'var(--mono)' }}>₹{totals.ded.toLocaleString('en-IN')}</span>}>
                            <table className={styles.salaryTable}>
                                <thead>
                                    <tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr>
                                </thead>
                                <tbody>
                                    {deductions.map(h => (
                                        <tr key={h.id} className={styles.deductionRow}>
                                            <td>{h.name}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="number" min={0} step={1}
                                                    className={styles.amtInput}
                                                    value={amounts[h.id] ?? ''}
                                                    placeholder="0"
                                                    onChange={e => setAmount(h.id, Number(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}

                    {/* Net Pay summary */}
                    <Card title="Salary Summary">
                        <div className={styles.totalsBar}>
                            <div className={styles.totalItem}>
                                <span className={styles.totalLabel}>Gross Earnings</span>
                                <span className={styles.totalValue} style={{ color: '#34d399' }}>
                                    ₹{totals.gross.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className={styles.totalItem}>
                                <span className={styles.totalLabel}>Total Deductions</span>
                                <span className={styles.totalValue} style={{ color: '#f43f5e' }}>
                                    ₹{totals.ded.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className={styles.totalItem}>
                                <span className={styles.totalLabel}>Net Pay</span>
                                <span className={styles.totalValue} style={{ color: '#6366f1' }}>
                                    ₹{totals.net.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </Card>

                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading || !empId}>
                        {loading ? 'Saving...' : 'Generate Salary Sheet'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
