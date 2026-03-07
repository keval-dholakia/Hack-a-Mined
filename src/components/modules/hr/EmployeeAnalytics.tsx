'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
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

const TABS = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'workforce', label: '◉ Workforce' },
    { id: 'compensation', label: '◈ Compensation' },
    { id: 'trends', label: '◎ Trends' },
] as const
type Tab = typeof TABS[number]['id']

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function EmployeeAnalytics({ employees }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = employees.length
        const active = employees.filter(e => e.is_active === 1).length
        const inactive = total - active

        /* department breakdown */
        const deptMap: Record<string, number> = {}
        employees.forEach(e => { if (e.department) deptMap[e.department] = (deptMap[e.department] ?? 0) + 1 })
        const deptData = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* designation breakdown */
        const desigMap: Record<string, number> = {}
        employees.forEach(e => { if (e.designation) desigMap[e.designation] = (desigMap[e.designation] ?? 0) + 1 })
        const desigData = Object.entries(desigMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))

        /* salary tiers */
        const tiers: Record<string, number> = { '<10K': 0, '10K–20K': 0, '20K–35K': 0, '35K–50K': 0, '>50K': 0 }
        employees.forEach(e => {
            const s = Number(e.basic_salary ?? 0)
            if (s < 10000) tiers['<10K']++
            else if (s < 20000) tiers['10K–20K']++
            else if (s < 35000) tiers['20K–35K']++
            else if (s < 50000) tiers['35K–50K']++
            else tiers['>50K']++
        })
        const salaryTierData = Object.entries(tiers).map(([name, value]) => ({ name, value }))

        /* dept salary average */
        const deptSalMap: Record<string, { total: number; count: number }> = {}
        employees.forEach(e => {
            if (!e.department) return
            if (!deptSalMap[e.department]) deptSalMap[e.department] = { total: 0, count: 0 }
            deptSalMap[e.department].total += Number(e.basic_salary ?? 0)
            deptSalMap[e.department].count++
        })
        const deptSalaryData = Object.entries(deptSalMap)
            .map(([name, d]) => ({ name, avg: Math.round(d.total / d.count), headcount: d.count }))
            .sort((a, b) => b.avg - a.avg)

        /* joining trend - by month */
        const joinMap: Record<string, number> = {}
        employees.forEach(e => {
            if (!e.joining_date) return
            const d = new Date(e.joining_date)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            joinMap[key] = (joinMap[key] ?? 0) + 1
        })
        const joinTrend = Object.entries(joinMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-18)
            .map(([k, count]) => {
                const [y, m] = k.split('-')
                return { month: `${MONTHS_SHORT[+m - 1]} ${y.slice(2)}`, count }
            })

        /* radar: dept vs headcount */
        const radarData = deptData.slice(0, 7).map(d => ({
            dept: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
            count: d.value,
        }))

        /* total salary bill */
        const totalSalaryBill = employees.filter(e => e.is_active === 1).reduce((s, e) => s + Number(e.basic_salary ?? 0), 0)
        const avgSalary = active ? totalSalaryBill / active : 0
        const maxSalary = Math.max(...employees.map(e => Number(e.basic_salary ?? 0)))

        /* status pie */
        const statusPie = [{ name: 'Active', value: active }, { name: 'Inactive', value: inactive }]

        /* top earners */
        const topEarners = [...employees].sort((a, b) => Number(b.basic_salary ?? 0) - Number(a.basic_salary ?? 0)).slice(0, 10)

        return {
            total, active, inactive, deptData, desigData, salaryTierData,
            deptSalaryData, joinTrend, radarData, totalSalaryBill, avgSalary, maxSalary, statusPie, topEarners
        }
    }, [employees])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Employee Analytics</h1>
                    <p className={styles.subtitle}>Workforce intelligence · {s.total} employees</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/hr/employees')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Employees" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Active" value={s.active} color={GREEN} />
                <KPI icon="◎" label="Inactive" value={s.inactive} color={ROSE} />
                <KPI icon="▣" label="Monthly Salary Bill" value={fmtSalary(s.totalSalaryBill)} color={CYAN} />
                <KPI icon="⬡" label="Average Salary" value={fmtSalary(Math.round(s.avgSalary))} color={AMBER} />
                <KPI icon="◇" label="Top Salary" value={fmtSalary(s.maxSalary)} color="#a78bfa" />
            </div>

            <div className={styles.tabBar}>
                {TABS.map(t => (
                    <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
                <div className={styles.grid}>
                    <Card title="Active vs Inactive">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
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

                    <Card title="Employees by Department">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.deptData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={100} paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {s.deptData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Salary Bracket Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.salaryTierData} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Employees" radius={[6, 6, 0, 0]}>
                                        {s.salaryTierData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top Designations" action={<span className={styles.badge}>by count</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.desigData} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Employees" radius={[0, 6, 6, 0]}>
                                        {s.desigData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* WORKFORCE */}
            {tab === 'workforce' && (
                <div className={styles.grid}>
                    <Card title="Department Headcount" action={<span className={styles.badge}>all depts</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.deptData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Employees" radius={[6, 6, 0, 0]}>
                                        {s.deptData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Department Radar" action={<span className={styles.badge}>top 7</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={120}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Headcount" dataKey="count" stroke={CYAN} fill={CYAN} fillOpacity={0.25} />
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Workforce Summary" action={<span className={styles.badge}>by department</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Department</th><th>Headcount</th><th>Active</th><th>Avg Salary</th><th>Share</th>
                                </tr></thead>
                                <tbody>
                                    {s.deptSalaryData.map((d, i) => {
                                        const share = s.total ? (d.headcount / s.total * 100).toFixed(1) : '0'
                                        const deptActive = employees.filter(e => e.department === d.name && e.is_active === 1).length
                                        return (
                                            <tr key={d.name}>
                                                <td><span className={styles.dot} style={{ background: C[i % C.length] }} />{d.name}</td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{d.headcount}</td>
                                                <td style={{ color: GREEN, fontFamily: 'var(--mono)' }}>{deptActive}</td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{fmtSalary(d.avg)}</td>
                                                <td>
                                                    <div className={styles.barCell}>
                                                        <div className={styles.barFill} style={{ width: `${share}%`, background: C[i % C.length] }} />
                                                        <span>{share}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Workforce Health">
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Active Rate</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(s.active / s.total * 100).toFixed(0)}%`, background: GREEN }} /></div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>{(s.active / s.total * 100).toFixed(1)}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Inactive Rate</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(s.inactive / s.total * 100).toFixed(0)}%`, background: ROSE }} /></div>
                                <span className={styles.healthPct} style={{ color: ROSE }}>{(s.inactive / s.total * 100).toFixed(1)}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Departments Covered</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${Math.min((s.deptData.length / 11) * 100, 100).toFixed(0)}%`, background: AMBER }} /></div>
                                <span className={styles.healthPct} style={{ color: AMBER }}>{s.deptData.length} depts</span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>
                                    {s.active / s.total > 0.85
                                        ? 'Workforce retention is strong — over 85% active.'
                                        : 'Consider reviewing attrition — active rate below 85%.'}
                                    {' '}Monthly salary bill for active employees: <strong>{fmtSalary(s.totalSalaryBill)}</strong>.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* COMPENSATION */}
            {tab === 'compensation' && (
                <div className={styles.grid}>
                    <Card title="Average Salary by Department" action={<span className={styles.badge}>₹ basic salary</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.deptSalaryData} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null
                                        return <div className={styles.tooltip}><p className={styles.ttLabel}>{label}</p><p style={{ color: ACCENT }}>Avg: <strong>{fmtSalary(payload[0]?.value as number)}</strong></p></div>
                                    }} />
                                    <Bar dataKey="avg" name="Avg Salary" radius={[6, 6, 0, 0]}>
                                        {s.deptSalaryData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Salary Bracket Distribution">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.salaryTierData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Employees" radius={[6, 6, 0, 0]}>
                                        {s.salaryTierData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top 10 Earners" action={<span className={styles.badge}>by basic salary</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Employee</th><th>Department</th><th>Designation</th><th>Basic Salary</th><th>Status</th>
                                </tr></thead>
                                <tbody>
                                    {s.topEarners.map((e, i) => (
                                        <tr key={e.id}>
                                            <td>
                                                <strong>{e.name}</strong><br />
                                                <small style={{ color: '#6b7280', fontFamily: 'var(--mono)' }}>{e.emp_code}</small>
                                            </td>
                                            <td>{e.department ?? '—'}</td>
                                            <td>{e.designation ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: C[i % C.length] }}>{fmtSalary(Number(e.basic_salary ?? 0))}</td>
                                            <td>
                                                <span className={styles.riskPill}
                                                    style={{ background: `${e.is_active === 1 ? GREEN : ROSE}22`, color: e.is_active === 1 ? GREEN : ROSE }}>
                                                    {e.is_active === 1 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Compensation Mix — Pie">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.salaryTierData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={100} paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {s.salaryTierData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* TRENDS */}
            {tab === 'trends' && (
                <div className={styles.grid}>
                    <Card title="Joining Trend" action={<span className={styles.badge}>last 18 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={s.joinTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Line type="monotone" dataKey="count" name="New Joins" stroke={ACCENT} strokeWidth={2.5}
                                        dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Dept × Salary Bubble" action={<span className={styles.badge}>avg salary per dept</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={s.deptSalaryData.slice(0, 8)} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null
                                        return <div className={styles.tooltip}><p className={styles.ttLabel}>{label}</p><p>Avg: <strong>{fmtSalary(payload[0]?.value as number)}</strong></p><p>Headcount: <strong>{payload[1]?.value}</strong></p></div>
                                    }} />
                                    <Bar dataKey="avg" name="Avg Salary" radius={[6, 6, 0, 0]} fill={ACCENT} />
                                    <Bar dataKey="headcount" name="Headcount" radius={[6, 6, 0, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Hiring Summary" action={<span className={styles.badge}>all time</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Month</th><th>New Joins</th><th>Cumulative</th>
                                </tr></thead>
                                <tbody>
                                    {s.joinTrend.slice(-12).reduce((acc: { month: string; count: number; cum: number }[], row) => {
                                        const prev = acc[acc.length - 1]?.cum ?? 0
                                        acc.push({ month: row.month, count: row.count, cum: prev + row.count })
                                        return acc
                                    }, []).reverse().map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.month}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: CYAN }}>{row.count}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: ACCENT }}>{row.cum}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Growth & Retention Health">
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Active Retention</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.active / s.total * 100).toFixed(0) : 0}%`, background: GREEN }} /></div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>{s.total ? (s.active / s.total * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>High-Pay (&gt;50K)</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.salaryTierData.find(t => t.name === '>50K')?.value ?? 0) / s.total * 100 : 0}%`, background: AMBER }} /></div>
                                <span className={styles.healthPct} style={{ color: AMBER }}>{s.salaryTierData.find(t => t.name === '>50K')?.value ?? 0} emp</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Multi-dept Coverage</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${Math.min(s.deptData.length / 11 * 100, 100).toFixed(0)}%`, background: CYAN }} /></div>
                                <span className={styles.healthPct} style={{ color: CYAN }}>{s.deptData.length} / 11</span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>
                                    Total headcount is <strong>{s.total}</strong> across <strong>{s.deptData.length}</strong> departments.
                                    {' '}Average basic salary: <strong>{fmtSalary(Math.round(s.avgSalary))}</strong>. Monthly payroll: <strong>{fmtSalary(s.totalSalaryBill)}</strong>.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
