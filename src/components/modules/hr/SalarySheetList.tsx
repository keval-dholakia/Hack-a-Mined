'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSalarySheetStatus } from '@/app/actions/hr'
import type { SalarySheet } from '@/types/hr'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = { sheets: any[] }   // any[] because Supabase join returns nested objects

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function statusClass(s: string) {
    if (s === 'Draft') return styles.draft
    if (s === 'Approved') return styles.approved
    if (s === 'Paid') return styles.paid
    return styles.draft
}

export default function SalarySheetList({ sheets }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterMonth, setFilterMonth] = useState('')
    const [filterYear, setFilterYear] = useState('')
    const [expanded, setExpanded] = useState<number | null>(null)

    const years = [...new Set(sheets.map(s => s.year))].sort((a, b) => b - a)
    const filtered = sheets.filter(s => {
        const empName = s.employees?.name ?? ''
        const empCode = s.employees?.emp_code ?? ''
        const matchSearch = empName.toLowerCase().includes(search.toLowerCase()) ||
            empCode.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus ? s.status === filterStatus : true
        const matchMonth = filterMonth ? String(s.month) === filterMonth : true
        const matchYear = filterYear ? String(s.year) === filterYear : true
        return matchSearch && matchStatus && matchMonth && matchYear
    })

    // KPIs
    const totalPaid = sheets.filter(s => s.status === 'Paid').reduce((a, s) => a + (s.net_pay ?? 0), 0)
    const pending = sheets.filter(s => s.status !== 'Paid').length

    async function handleStatusChange(id: number, status: string) {
        const next = status === 'Draft' ? 'Approved' : status === 'Approved' ? 'Paid' : 'Draft'
        await updateSalarySheetStatus(id, next as any)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Sheets</h1>
                    <p className={styles.subtitle}>{sheets.length} sheets · {pending} pending approval</p>
                </div>
                <div className={styles.headerRight}>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-sheet/analytics')}
                        style={{ color: '#22d3ee' }}>
                        ◎ Analytics
                    </Button>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-sheet/new')}>
                        + New Sheet
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Sheets', value: sheets.length, color: '#6366f1' },
                    { label: 'Draft', value: sheets.filter(s => s.status === 'Draft').length, color: '#94a3b8' },
                    { label: 'Approved', value: sheets.filter(s => s.status === 'Approved').length, color: '#22d3ee' },
                    { label: 'Paid', value: sheets.filter(s => s.status === 'Paid').length, color: '#34d399' },
                    { label: 'Total Disbursed', value: `₹${(totalPaid / 100000).toFixed(1)}L`, color: '#facc15' },
                ].map(k => (
                    <div key={k.label} style={{
                        background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px',
                        padding: '0.85rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{k.label}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--mono)', color: k.color }}>{k.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className={styles.searchBar}>
                <input className={styles.searchInput} placeholder="Search by employee name or code..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                </select>
                <select className={styles.filterSelect} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    <option value="">All Months</option>
                    {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                </select>
                <select className={styles.filterSelect} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
            </div>

            {/* Sheet rows — card-style expandable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No salary sheets found. <button style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => router.push('/dashboard/hr/salary-sheet/new')}>Create the first one →</button>
                    </div>
                )}
                {filtered.map(sheet => {
                    const items = sheet.salary_sheet_items ?? []
                    const earnings = items.filter((i: any) => i.salary_heads?.type === 'Earning')
                    const deducts = items.filter((i: any) => i.salary_heads?.type === 'Deduction')
                    const earningSum = earnings.reduce((sum: number, i: any) => sum + Number(i.amount), 0)
                    const basicSalary = Number(sheet.gross_salary) - earningSum

                    const isOpen = expanded === sheet.id

                    return (
                        <div key={sheet.id} className={styles.historySheet}>
                            <div className={styles.historyHeader} onClick={() => setExpanded(isOpen ? null : sheet.id)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        fontSize: '0.75rem', fontFamily: 'var(--mono)', color: '#6b7280', background: '#0f1117',
                                        padding: '0.15rem 0.5rem', borderRadius: '5px', border: '1px solid #1f2235'
                                    }}>
                                        {sheet.employees?.emp_code ?? '—'}
                                    </span>
                                    <span className={styles.historyPeriod}>{sheet.employees?.name ?? '—'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {sheet.employees?.designation} · {sheet.employees?.department}
                                    </span>
                                </div>
                                <div className={styles.historyMeta}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{MONTHS[sheet.month - 1]} {sheet.year}</span>
                                    <span className={`${styles.pill} ${statusClass(sheet.status)}`}>{sheet.status}</span>
                                    <span className={styles.historyAmount} style={{ color: '#6366f1' }}>₹{Number(sheet.net_pay).toLocaleString('en-IN')}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{isOpen ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {isOpen && (
                                <div className={styles.historyBody}>
                                    {/* Earnings col */}
                                    <div>
                                        <p style={{
                                            fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase',
                                            letterSpacing: '0.05em', marginBottom: '0.5rem', padding: '0 0.5rem'
                                        }}>
                                            Earnings — ₹{Number(sheet.gross_salary).toLocaleString('en-IN')}
                                        </p>
                                        {basicSalary > 0 && (
                                            <div className={styles.historyLine}>
                                                <span className={styles.historyLineName}>Basic Salary</span>
                                                <span className={styles.historyLineAmt} style={{ color: '#34d399' }}>
                                                    ₹{basicSalary.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        )}
                                        {earnings.map((it: any) => (
                                            <div key={it.id} className={styles.historyLine}>
                                                <span className={styles.historyLineName}>{it.salary_heads?.name}</span>
                                                <span className={styles.historyLineAmt} style={{ color: '#34d399' }}>
                                                    ₹{Number(it.amount).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Deductions col */}
                                    <div>
                                        <p style={{
                                            fontSize: '0.72rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase',
                                            letterSpacing: '0.05em', marginBottom: '0.5rem', padding: '0 0.5rem'
                                        }}>
                                            Deductions — ₹{Number(sheet.total_deductions).toLocaleString('en-IN')}
                                        </p>
                                        {deducts.map((it: any) => (
                                            <div key={it.id} className={styles.historyLine}>
                                                <span className={styles.historyLineName}>{it.salary_heads?.name}</span>
                                                <span className={styles.historyLineAmt} style={{ color: '#f43f5e' }}>
                                                    ₹{Number(it.amount).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ))}
                                        {deducts.length === 0 && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>No deductions</span>}
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        gridColumn: 'span 2', borderTop: '1px solid #1f2235', paddingTop: '0.75rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ATTENDANCE</span>
                                                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                                    {sheet.present_days}/{sheet.total_days} days
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>NET PAY</span>
                                                <span style={{ fontFamily: 'var(--mono)', fontSize: '1rem', fontWeight: 700, color: '#6366f1' }}>
                                                    ₹{Number(sheet.net_pay).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {sheet.status !== 'Paid' && (
                                                <Button onClick={() => handleStatusChange(sheet.id, sheet.status)}>
                                                    {sheet.status === 'Draft' ? '✓ Approve' : '✓ Mark Paid'}
                                                </Button>
                                            )}
                                            {sheet.status === 'Paid' && (
                                                <Button variant="ghost" onClick={() => window.open(`/api/hr/salary-receipt/${sheet.id}`, '_blank')}>
                                                    📄 Download Payslip
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
