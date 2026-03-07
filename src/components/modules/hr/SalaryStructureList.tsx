'use client'

import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = { employees: any[] }

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

export default function SalaryStructureList({ employees }: Props) {
    const router = useRouter()

    const defined = employees.filter(e => e.structure !== null).length
    const undefined_ = employees.length - defined

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Structure</h1>
                    <p className={styles.subtitle}>
                        Define component-wise CTC for each employee ·{' '}
                        <span style={{ color: '#34d399' }}>{defined} configured</span>{' '}
                        ·{' '}
                        <span style={{ color: '#facc15' }}>{undefined_} pending</span>
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-structure/analytics')}
                        style={{ color: '#22d3ee' }}>
                        ◎ Analytics
                    </Button>
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem' }}>
                {[
                    { label: 'Total Employees', value: employees.length, color: '#6366f1' },
                    { label: 'Structure Defined', value: defined, color: '#34d399' },
                    { label: 'Not Yet Set', value: undefined_, color: '#facc15' },
                    {
                        label: 'Avg Net Pay',
                        value: employees.filter(e => e.structure).length > 0
                            ? fmt(Math.round(
                                employees.filter(e => e.structure)
                                    .reduce((s: number, e: any) => s + Number(e.structure?.net_pay ?? 0), 0)
                                / employees.filter(e => e.structure).length
                            ))
                            : '—',
                        color: '#22d3ee',
                    },
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

            {/* Employee Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: '1rem' }}>
                {employees.map(emp => {
                    const hasSt = !!emp.structure
                    const items = emp.structure?.salary_sheet_items ?? []
                    const earnings = items.filter((i: any) => i.salary_heads?.type === 'Earning')
                    const deducts = items.filter((i: any) => i.salary_heads?.type === 'Deduction')

                    return (
                        <div key={emp.id} style={{
                            background: '#13151f', border: `1px solid ${hasSt ? '#1f2235' : '#2a2d0f'}`,
                            borderRadius: '12px', overflow: 'hidden',
                            transition: 'border-color 0.2s, transform 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {/* Card header */}
                            <div style={{
                                padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', borderBottom: '1px solid #1f2235',
                                background: '#0f1117',
                            }}>
                                <div>
                                    {emp.emp_code && (
                                        <span style={{
                                            fontSize: '0.68rem', fontFamily: 'var(--mono)', color: '#6b7280',
                                            background: '#1a1d27', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                            border: '1px solid #2a2d3e', marginRight: '0.5rem',
                                        }}>{emp.emp_code}</span>
                                    )}
                                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{emp.name}</span>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        {emp.designation}{emp.department ? ` · ${emp.department}` : ''}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                                    {hasSt ? (
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>✓ Defined</span>
                                    ) : (
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#facc15', background: 'rgba(250,204,21,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>⚠ Not Set</span>
                                    )}
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                                        Basic: {fmt(emp.basic_salary)}
                                    </span>
                                </div>
                            </div>

                            {/* Structure preview */}
                            {hasSt ? (
                                <div style={{ padding: '0.75rem 1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.68rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.35rem' }}>
                                                Earnings
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.2rem 0', borderBottom: '1px solid #1a1d27' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Basic Salary</span>
                                                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{fmt(emp.basic_salary || 0)}</span>
                                            </div>
                                            {earnings.slice(0, 3).map((it: any) => (
                                                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.2rem 0', borderBottom: '1px solid #1a1d27' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{it.salary_heads?.name}</span>
                                                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{fmt(it.amount)}</span>
                                                </div>
                                            ))}
                                            {earnings.length > 4 && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>+{earnings.length - 4} more</p>}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.68rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.35rem' }}>
                                                Deductions
                                            </p>
                                            {deducts.slice(0, 4).map((it: any) => (
                                                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '0.2rem 0', borderBottom: '1px solid #1a1d27' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>{it.salary_heads?.name}</span>
                                                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-primary)' }}>{fmt(it.amount)}</span>
                                                </div>
                                            ))}
                                            {deducts.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>}
                                        </div>
                                    </div>
                                    {/* Totals */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: '#0f1117', borderRadius: '8px', padding: '0.5rem 0.75rem',
                                        fontSize: '0.8rem',
                                    }}>
                                        <span style={{ color: '#34d399', fontFamily: 'var(--mono)' }}>Gross: {fmt(emp.structure.gross_salary)}</span>
                                        <span style={{ color: '#f43f5e', fontFamily: 'var(--mono)' }}>Ded: {fmt(emp.structure.total_deductions)}</span>
                                        <span style={{ color: '#6366f1', fontFamily: 'var(--mono)', fontWeight: 700 }}>Net: {fmt(emp.structure.net_pay)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                    No salary structure defined yet.
                                </div>
                            )}

                            {/* Action */}
                            <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid #1f2235', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="ghost" onClick={() => router.push(`/dashboard/hr/salary-structure/${emp.id}`)}>
                                    {hasSt ? '✎ Edit Structure' : '+ Define Structure'}
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
