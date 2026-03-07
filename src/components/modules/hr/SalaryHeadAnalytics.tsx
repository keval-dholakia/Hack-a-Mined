'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'

type Props = { heads: any[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.ttLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    )
}

function KPI({ icon, label, value, color }: any) {
    return (
        <div className={styles.kpi}>
            <div className={styles.kpiIcon} style={{ color, background: `${color}18` }}>{icon}</div>
            <div>
                <p className={styles.kpiLabel}>{label}</p>
                <p className={styles.kpiValue} style={{ color }}>{value}</p>
            </div>
        </div>
    )
}

export default function SalaryHeadAnalytics({ heads }: Props) {
    const router = useRouter()

    const s = useMemo(() => {
        const total = heads.length
        const earnings = heads.filter(h => h.type === 'Earning')
        const deductions = heads.filter(h => h.type === 'Deduction')
        const activeHeads = heads.filter(h => h.is_active === 1)
        const inactiveHeads = heads.filter(h => h.is_active !== 1)

        /* type breakdown */
        const typePie = [
            { name: 'Earning', value: earnings.length },
            { name: 'Deduction', value: deductions.length },
        ]

        /* status breakdown */
        const statusPie = [
            { name: 'Active', value: activeHeads.length },
            { name: 'Inactive', value: inactiveHeads.length },
        ]

        /* earning vs deduction active/inactive grid */
        const grid = [
            { name: 'Active Earnings', value: earnings.filter(h => h.is_active === 1).length, color: GREEN },
            { name: 'Inactive Earnings', value: earnings.filter(h => h.is_active !== 1).length, color: `${GREEN}55` },
            { name: 'Active Deductions', value: deductions.filter(h => h.is_active === 1).length, color: ROSE },
            { name: 'Inactive Deductions', value: deductions.filter(h => h.is_active !== 1).length, color: `${ROSE}55` },
        ]

        return { total, earnings, deductions, activeHeads, inactiveHeads, typePie, statusPie, grid }
    }, [heads])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Head Analytics</h1>
                    <p className={styles.subtitle}>Pay component overview · {s.total} heads configured</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-heads')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Heads" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Earning Heads" value={s.earnings.length} color={GREEN} />
                <KPI icon="◎" label="Deduction Heads" value={s.deductions.length} color={ROSE} />
                <KPI icon="▣" label="Active Heads" value={s.activeHeads.length} color={CYAN} />
                <KPI icon="⬡" label="Inactive" value={s.inactiveHeads.length} color={AMBER} />
            </div>

            <div className={styles.grid}>
                <Card title="Earning vs Deduction">
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={s.typePie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                    outerRadius={90} innerRadius={50} paddingAngle={6}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    <Cell fill={GREEN} /><Cell fill={ROSE} />
                                </Pie>
                                <Tooltip content={<Tip />} />
                                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Active vs Inactive">
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={s.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                    outerRadius={90} innerRadius={50} paddingAngle={6}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    <Cell fill={CYAN} /><Cell fill={AMBER} />
                                </Pie>
                                <Tooltip content={<Tip />} />
                                <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Component Breakdown">
                    <div className={styles.chartWrap}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={s.grid} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<Tip />} />
                                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                                    {s.grid.map((g, i) => <Cell key={i} fill={g.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="All Salary Heads" action={<span className={styles.badge}>{s.total} components</span>}>
                    <div className={styles.summaryTable}>
                        <table>
                            <thead><tr>
                                <th>#</th><th>Head Name</th><th>Type</th><th>Status</th>
                            </tr></thead>
                            <tbody>
                                {heads.map((h, i) => (
                                    <tr key={h.id}>
                                        <td style={{ color: '#6b7280', fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>{i + 1}</td>
                                        <td><strong>{h.name}</strong></td>
                                        <td>
                                            <span className={styles.riskPill} style={{ background: `${h.type === 'Earning' ? GREEN : ROSE}22`, color: h.type === 'Earning' ? GREEN : ROSE }}>
                                                {h.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.riskPill} style={{ background: `${h.is_active === 1 ? CYAN : AMBER}22`, color: h.is_active === 1 ? CYAN : AMBER }}>
                                                {h.is_active === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
