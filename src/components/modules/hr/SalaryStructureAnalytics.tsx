'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

type Props = { employees: any[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'

const fmtSalary = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.ttLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{typeof p.value === 'number' && p.value > 1000 ? fmtSalary(p.value) : p.value}</strong>
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

const TABS = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'components', label: '◈ Components' },
    { id: 'dept', label: '◉ By Department' },
    { id: 'coverage', label: '◎ Coverage' },
] as const
type Tab = typeof TABS[number]['id']

export default function SalaryStructureAnalytics({ employees }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = employees.length
        const withStructure = employees.filter(e => e.structure !== null).length
        const withoutStructure = total - withStructure
        const activeWithStructure = employees.filter(e => e.is_active === 1 && e.structure !== null).length

        /* total gross / net / deductions aggregated */
        const totalGross = employees.filter(e => e.structure).reduce((a, e) => a + Number(e.structure?.gross_salary ?? 0), 0)
        const totalNet = employees.filter(e => e.structure).reduce((a, e) => a + Number(e.structure?.net_pay ?? 0), 0)
        const totalDeductions = employees.filter(e => e.structure).reduce((a, e) => a + Number(e.structure?.total_deductions ?? 0), 0)
        const avgNet = withStructure ? totalNet / withStructure : 0

        /* salary head component aggregation across all employees */
        const headAggMap: Record<string, { name: string; type: string; totalAmount: number; count: number }> = {}
        employees.filter(e => e.structure?.salary_sheet_items?.length).forEach(e => {
            e.structure.salary_sheet_items.forEach((item: any) => {
                const id = item.salary_head_id
                const headName = item.salary_heads?.name ?? `Head ${id}`
                const type = item.salary_heads?.type ?? 'Earning'
                if (!headAggMap[id]) headAggMap[id] = { name: headName, type, totalAmount: 0, count: 0 }
                headAggMap[id].totalAmount += Number(item.amount ?? 0)
                headAggMap[id].count++
            })
        })
        const headComponents = Object.values(headAggMap)
            .map(h => ({ ...h, avgAmount: Math.round(h.totalAmount / h.count) }))
            .sort((a, b) => b.totalAmount - a.totalAmount)

        const earningComponents = headComponents.filter(h => h.type === 'Earning')
        const deductionComponents = headComponents.filter(h => h.type === 'Deduction')

        /* coverage pie */
        const coveragePie = [
            { name: 'Configured', value: withStructure },
            { name: 'Missing', value: withoutStructure },
        ]

        /* department analysis */
        const deptMap: Record<string, { total: number; configured: number; avgNet: number; netSum: number }> = {}
        employees.forEach(e => {
            const dept = e.department ?? 'Unknown'
            if (!deptMap[dept]) deptMap[dept] = { total: 0, configured: 0, avgNet: 0, netSum: 0 }
            deptMap[dept].total++
            if (e.structure) {
                deptMap[dept].configured++
                deptMap[dept].netSum += Number(e.structure?.net_pay ?? 0)
            }
        })
        const deptData = Object.entries(deptMap)
            .map(([name, d]) => ({
                name,
                total: d.total,
                configured: d.configured,
                avgNet: d.configured ? Math.round(d.netSum / d.configured) : 0,
            }))
            .sort((a, b) => b.avgNet - a.avgNet)

        /* net pay tiers */
        const tiers: Record<string, number> = { '<10K': 0, '10K–20K': 0, '20K–35K': 0, '35K–50K': 0, '>50K': 0 }
        employees.filter(e => e.structure).forEach(e => {
            const n = Number(e.structure?.net_pay ?? 0)
            if (n < 10000) tiers['<10K']++
            else if (n < 20000) tiers['10K–20K']++
            else if (n < 35000) tiers['20K–35K']++
            else if (n < 50000) tiers['35K–50K']++
            else tiers['>50K']++
        })
        const netTierData = Object.entries(tiers).map(([name, value]) => ({ name, value }))

        /* radar: dept configured vs total */
        const radarData = deptData.slice(0, 7).map(d => ({
            dept: d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name,
            configured: d.configured,
            total: d.total,
        }))

        return {
            total, withStructure, withoutStructure, activeWithStructure,
            totalGross, totalNet, totalDeductions, avgNet,
            headComponents, earningComponents, deductionComponents,
            coveragePie, deptData, netTierData, radarData,
        }
    }, [employees])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Structure Analytics</h1>
                    <p className={styles.subtitle}>Compensation structure intelligence · {s.total} employees</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-structure')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Employees" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Structure Configured" value={s.withStructure} color={GREEN} />
                <KPI icon="◎" label="Missing Structure" value={s.withoutStructure} color={ROSE} />
                <KPI icon="▣" label="Total Net Pay (Monthly)" value={fmtSalary(Math.round(s.totalNet))} color={CYAN} />
                <KPI icon="⬡" label="Avg Net Pay" value={fmtSalary(Math.round(s.avgNet))} color={AMBER} />
                <KPI icon="◇" label="Total Deductions" value={fmtSalary(Math.round(s.totalDeductions))} color="#a78bfa" />
            </div>

            <div className={styles.tabBar}>
                {TABS.map(t => (
                    <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
                <div className={styles.grid}>
                    <Card title="Configuration Coverage">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.coveragePie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                        <Cell fill={GREEN} /><Cell fill={ROSE} />
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Net Pay Tier Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.netTierData} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Employees" radius={[6, 6, 0, 0]}>
                                        {s.netTierData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Earnings vs Deductions" action={<span className={styles.badge}>configured employees</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={[
                                        { name: 'Net Pay', value: Math.round(s.totalNet) },
                                        { name: 'Deductions', value: Math.round(s.totalDeductions) },
                                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        <Cell fill={GREEN} /><Cell fill={ROSE} />
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Coverage Health">
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Structure Coverage</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.withStructure / s.total * 100).toFixed(0) : 0}%`, background: GREEN }} /></div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>{s.total ? (s.withStructure / s.total * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Active & Configured</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.activeWithStructure / s.total * 100).toFixed(0) : 0}%`, background: CYAN }} /></div>
                                <span className={styles.healthPct} style={{ color: CYAN }}>{s.activeWithStructure} / {s.total}</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Missing Structure</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.withoutStructure / s.total * 100).toFixed(0) : 0}%`, background: ROSE }} /></div>
                                <span className={styles.healthPct} style={{ color: ROSE }}>{s.withoutStructure} employees</span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>
                                    {s.withoutStructure > 0
                                        ? `${s.withoutStructure} employee${s.withoutStructure > 1 ? 's' : ''} lack a salary structure. Configure them to enable automated payslip generation.`
                                        : 'All employees have salary structures configured. ✓'}
                                    {' '}Total projected monthly net payroll: <strong>{fmtSalary(Math.round(s.totalNet))}</strong>.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* COMPONENTS */}
            {tab === 'components' && (
                <div className={styles.grid}>
                    <Card title="Top Earning Components" action={<span className={styles.badge}>avg amount across employees</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.earningComponents.map(h => ({ name: h.name, value: h.avgAmount }))} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Avg Amount" radius={[6, 6, 0, 0]} fill={GREEN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top Deduction Components" action={<span className={styles.badge}>avg amount across employees</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.deductionComponents.map(h => ({ name: h.name, value: h.avgAmount }))} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Avg Amount" radius={[6, 6, 0, 0]} fill={ROSE} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="All Salary Components" action={<span className={styles.badge}>{s.headComponents.length} heads</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Component</th><th>Type</th><th>Employees</th><th>Avg Amount</th><th>Total</th>
                                </tr></thead>
                                <tbody>
                                    {s.headComponents.map((h, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.dot} style={{ background: h.type === 'Earning' ? GREEN : ROSE }} /><strong>{h.name}</strong></td>
                                            <td><span className={styles.riskPill} style={{ background: `${h.type === 'Earning' ? GREEN : ROSE}22`, color: h.type === 'Earning' ? GREEN : ROSE }}>{h.type}</span></td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{h.count}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: h.type === 'Earning' ? GREEN : ROSE }}>{fmtSalary(h.avgAmount)}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{fmtSalary(Math.round(h.totalAmount))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* BY DEPARTMENT */}
            {tab === 'dept' && (
                <div className={styles.grid}>
                    <Card title="Avg Net Pay by Department">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.deptData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="avgNet" name="Avg Net Pay" radius={[6, 6, 0, 0]}>
                                        {s.deptData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Dept Structure Coverage Radar">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={120}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Configured" dataKey="configured" stroke={GREEN} fill={GREEN} fillOpacity={0.25} />
                                    <Radar name="Total" dataKey="total" stroke={CYAN} fill={CYAN} fillOpacity={0.1} />
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Department Summary">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Department</th><th>Total</th><th>Configured</th><th>Coverage</th><th>Avg Net Pay</th>
                                </tr></thead>
                                <tbody>
                                    {s.deptData.map((d, i) => {
                                        const cov = d.total ? (d.configured / d.total * 100).toFixed(0) : '0'
                                        const covColor = Number(cov) >= 100 ? GREEN : Number(cov) >= 70 ? AMBER : ROSE
                                        return (
                                            <tr key={d.name}>
                                                <td><span className={styles.dot} style={{ background: C[i % C.length] }} />{d.name}</td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{d.total}</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: GREEN }}>{d.configured}</td>
                                                <td><span className={styles.riskPill} style={{ background: `${covColor}22`, color: covColor }}>{cov}%</span></td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{fmtSalary(d.avgNet)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* COVERAGE */}
            {tab === 'coverage' && (
                <div className={styles.grid}>
                    <Card title="Missing Structure — Action List" action={<span className={styles.badge}>needs attention</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Employee</th><th>Code</th><th>Department</th><th>Designation</th><th>Status</th>
                                </tr></thead>
                                <tbody>
                                    {employees.filter(e => !e.structure).map((e, i) => (
                                        <tr key={e.id}>
                                            <td><strong>{e.name}</strong></td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#6b7280' }}>{e.emp_code ?? '—'}</td>
                                            <td>{e.department ?? '—'}</td>
                                            <td>{e.designation ?? '—'}</td>
                                            <td><span className={styles.riskPill} style={{ background: `${ROSE}22`, color: ROSE }}>Not Set</span></td>
                                        </tr>
                                    ))}
                                    {employees.filter(e => !e.structure).length === 0 && (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: GREEN, padding: '2rem' }}>✓ All employees have structures configured</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Configured Employees — Net Pay" action={<span className={styles.badge}>top 10</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart
                                    data={employees.filter(e => e.structure).sort((a, b) => Number(b.structure?.net_pay ?? 0) - Number(a.structure?.net_pay ?? 0)).slice(0, 10)
                                        .map(e => ({ name: e.name.slice(0, 14), value: Math.round(Number(e.structure?.net_pay ?? 0)) }))}
                                    layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Net Pay" radius={[0, 6, 6, 0]}>
                                        {employees.filter(e => e.structure).slice(0, 10).map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
