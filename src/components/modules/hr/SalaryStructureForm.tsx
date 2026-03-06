'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { saveEmployeeSalaryStructure } from '@/app/actions/hr'
import type { SalaryHead } from '@/types/hr'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = {
    employee: any
    salaryHeads: SalaryHead[]
}

export default function SalaryStructureForm({ employee, salaryHeads }: Props) {
    const router = useRouter()

    const activeHeads = salaryHeads.filter(h => h.is_active === 1)
    const earnings = activeHeads.filter(h => h.type === 'Earning')
    const deductions = activeHeads.filter(h => h.type === 'Deduction')

    const initialAmounts: Record<number, number> = {}
    if (employee.structure && employee.structure.salary_sheet_items) {
        employee.structure.salary_sheet_items.forEach((it: any) => {
            initialAmounts[it.salary_head_id] = Number(it.amount) || 0
        })
    }

    const [amounts, setAmounts] = useState<Record<number, number>>(initialAmounts)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function setAmount(headId: number, val: number) {
        setAmounts(prev => ({ ...prev, [headId]: val }))
    }

    const totals = useMemo(() => {
        let gross = 0, ded = 0
        earnings.forEach(h => { gross += amounts[h.id] || 0 })
        deductions.forEach(h => { ded += amounts[h.id] || 0 })

        const basic = employee ? Number(employee.basic_salary) : 0
        gross += basic

        return { basic, gross, ded, net: gross - ded }
    }, [amounts, earnings, deductions, employee])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const items = activeHeads
            .filter(h => (amounts[h.id] || 0) > 0)
            .map(h => ({ salary_head_id: h.id, amount: amounts[h.id] || 0 }))

        const result = await saveEmployeeSalaryStructure(employee.id, items)

        setLoading(false)
        if (result.error) { setError(result.error); return }
        router.push('/dashboard/hr/salary-structure')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Edit Salary Structure</h1>
                    <p className={styles.subtitle}>Define the fixed monthly salary components for {employee.name}</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    {/* Employee Info Header */}
                    <div style={{
                        background: '#13151f', border: '1px solid #1f2235', borderRadius: '10px',
                        padding: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap'
                    }}>
                        <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee</span>
                            <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem' }}>
                                {employee.emp_code ? `[${employee.emp_code}] ` : ''}{employee.name}
                            </p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</span>
                            <p style={{ fontWeight: 500, fontSize: '0.9rem', marginTop: '0.2rem' }}>{employee.department || '—'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designation</span>
                            <p style={{ fontWeight: 500, fontSize: '0.9rem', marginTop: '0.2rem' }}>{employee.designation || '—'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base Configured Basic Salary</span>
                            <p style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '0.9rem', marginTop: '0.2rem', color: '#22d3ee' }}>
                                ₹{(employee.basic_salary || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Enter the monthly amount for each component. These will pre-fill whenever a new monthly salary sheet is generated for this employee. You can define specific PF, Bonuses, etc. per employee here.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
                        {/* Earnings */}
                        <Card title="Earnings" action={<span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--mono)' }}>₹{totals.gross.toLocaleString('en-IN')}</span>}>
                            <table className={styles.salaryTable}>
                                <thead><tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr></thead>
                                <tbody>
                                    {totals.basic > 0 && (
                                        <tr className={styles.earningRow}>
                                            <td>
                                                Basic Salary
                                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                    (Defined in Employee Master)
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
                                                    value={amounts[h.id] || ''}
                                                    placeholder="0"
                                                    onChange={e => setAmount(h.id, Number(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {earnings.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No active earnings configured in Master</td></tr>}
                                </tbody>
                            </table>
                        </Card>

                        {/* Deductions */}
                        <Card title="Deductions & PF" action={<span style={{ fontSize: '0.72rem', color: '#f43f5e', fontFamily: 'var(--mono)' }}>₹{totals.ded.toLocaleString('en-IN')}</span>}>
                            <table className={styles.salaryTable}>
                                <thead><tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount (₹)</th></tr></thead>
                                <tbody>
                                    {deductions.map(h => (
                                        <tr key={h.id} className={styles.deductionRow}>
                                            <td>{h.name}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <input
                                                    type="number" min={0} step={1}
                                                    className={styles.amtInput}
                                                    value={amounts[h.id] || ''}
                                                    placeholder="0"
                                                    onChange={e => setAmount(h.id, Number(e.target.value))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {deductions.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No active deductions configured in Master</td></tr>}
                                </tbody>
                            </table>
                        </Card>
                    </div>

                    <Card>
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
                                <span className={styles.totalLabel}>Net Pay (Monthly CTC)</span>
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
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Salary Structure'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
