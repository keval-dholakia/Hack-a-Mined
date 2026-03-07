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
    ComposedChart, Area,
} from 'recharts'

type Props = { sheets: any[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
    { id: 'payroll', label: '◈ Payroll' },
    { id: 'employee', label: '◉ Per-Employee' },
    { id: 'trends', label: '◎ Trends' },
] as const
type Tab = typeof TABS[number]['id']

export default function SalarySheetAnalytics({ sheets }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = sheets.length
        const draft = sheets.filter(s => s.status === 'Draft').length
        const approved = sheets.filter(s => s.status === 'Approved').length
        const paid = sheets.filter(s => s.status === 'Paid').length

        const totalDisbursed = sheets.filter(s => s.status === 'Paid').reduce((a, s) => a + Number(s.net_pay ?? 0), 0)
        const totalGross = sheets.filter(s => s.status === 'Paid').reduce((a, s) => a + Number(s.gross_salary ?? 0), 0)
        const totalDeductions = sheets.filter(s => s.status === 'Paid').reduce((a, s) => a + Number(s.total_deductions ?? 0), 0)

        /* Status pie */
        const statusPie = [
            { name: 'Draft', value: draft },
            { name: 'Approved', value: approved },
            { name: 'Paid', value: paid },
        ]

        /* monthly payroll trend */
        const monthMap: Record<string, { gross: number; net: number; deductions: number; count: number }> = {}
        sheets.filter(s => s.status === 'Paid').forEach(s => {
            const key = `${s.year}-${String(s.month).padStart(2, '0')}`
            if (!monthMap[key]) monthMap[key] = { gross: 0, net: 0, deductions: 0, count: 0 }
            monthMap[key].gross += Number(s.gross_salary ?? 0)
            monthMap[key].net += Number(s.net_pay ?? 0)
            monthMap[key].deductions += Number(s.total_deductions ?? 0)
            monthMap[key].count++
        })
        const monthlyTrend = Object.entries(monthMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([k, v]) => {
                const [y, m] = k.split('-')
                return { month: `${MONTHS_SHORT[+m - 1]} ${y.slice(2)}`, ...v }
            })

        /* dept payroll */
        const deptMap: Record<string, number> = {}
        sheets.filter(s => s.status === 'Paid').forEach(s => {
            const dept = s.employees?.department ?? 'Unknown'
            deptMap[dept] = (deptMap[dept] ?? 0) + Number(s.net_pay ?? 0)
        })
        const deptPayroll = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value: Math.round(value) }))

        /* attendance analysis */
        const attnData = sheets.filter(s => s.total_days > 0).map(s => ({
            name: s.employees?.name?.slice(0, 14) ?? '—',
            attendance: s.total_days > 0 ? Math.round(s.present_days / s.total_days * 100) : 0,
        })).sort((a, b) => b.attendance - a.attendance).slice(0, 10)

        /* per-employee salary history */
        const empMap: Record<string, { name: string; sheets: any[] }> = {}
        sheets.forEach(s => {
            const id = s.employee_id
            if (!empMap[id]) empMap[id] = { name: s.employees?.name ?? '—', sheets: [] }
            empMap[id].sheets.push(s)
        })
        const employeeSummary = Object.entries(empMap).map(([, v]) => {
            const paidSheets = v.sheets.filter(s => s.status === 'Paid')
            return {
                name: v.name,
                totalPaid: paidSheets.reduce((a, s) => a + Number(s.net_pay ?? 0), 0),
                sheetCount: v.sheets.length,
                avgNet: paidSheets.length ? paidSheets.reduce((a, s) => a + Number(s.net_pay ?? 0), 0) / paidSheets.length : 0,
            }
        }).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 10)

        /* salary component breakdown (average over paid sheets) */
        const avgAttendancePct = sheets.filter(s => s.total_days > 0).reduce((a, s) => a + (s.present_days / s.total_days), 0) /
            (sheets.filter(s => s.total_days > 0).length || 1) * 100

        return {
            total, draft, approved, paid, totalDisbursed, totalGross, totalDeductions,
            statusPie, monthlyTrend, deptPayroll, attnData, employeeSummary, avgAttendancePct
        }
    }, [sheets])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Sheet Analytics</h1>
                    <p className={styles.subtitle}>Payroll intelligence · {s.total} salary sheets</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-sheet')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Sheets" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Paid" value={s.paid} color={GREEN} />
                <KPI icon="◎" label="Pending" value={s.draft + s.approved} color={AMBER} />
                <KPI icon="▣" label="Total Disbursed" value={fmtSalary(s.totalDisbursed)} color={CYAN} />
                <KPI icon="⬡" label="Total Deductions" value={fmtSalary(s.totalDeductions)} color={ROSE} />
                <KPI icon="◇" label="Avg Attendance" value={`${s.avgAttendancePct.toFixed(1)}%`} color="#a78bfa" />
            </div>

            <div className={styles.tabBar}>
                {TABS.map(t => (
                    <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
                <div className={styles.grid}>
                    <Card title="Approval Status Mix">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                        <Cell fill="#94a3b8" /><Cell fill={CYAN} /><Cell fill={GREEN} />
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Department Payroll Distribution" action={<span className={styles.badge}>paid sheets</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.deptPayroll} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : String(v)} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Net Pay" radius={[6, 6, 0, 0]}>
                                        {s.deptPayroll.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Gross vs Net vs Deductions" action={<span className={styles.badge}>paid sheets overview</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={[
                                        { name: 'Net Pay', value: Math.round(s.totalDisbursed) },
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

                    <Card title="Top Attendance Rate" action={<span className={styles.badge}>top 10 employees</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.attnData} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="attendance" name="Attendance %" radius={[0, 6, 6, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* PAYROLL */}
            {tab === 'payroll' && (
                <div className={styles.grid}>
                    <Card title="Monthly Payroll Trend" action={<span className={styles.badge}>last 12 months · paid only</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <ComposedChart data={s.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : String(v)} />
                                    <Tooltip content={<Tip />} />
                                    <Area type="monotone" dataKey="gross" name="Gross" stroke={ACCENT} fill={`${ACCENT}18`} strokeWidth={2} />
                                    <Line type="monotone" dataKey="net" name="Net Pay" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 3 }} />
                                    <Bar dataKey="deductions" name="Deductions" fill={`${ROSE}80`} radius={[4, 4, 0, 0]} barSize={14} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Monthly Employee Count" action={<span className={styles.badge}>paid sheets per month</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.monthlyTrend} barSize={28}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="count" name="Employees Paid" radius={[6, 6, 0, 0]}>
                                        {s.monthlyTrend.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Payroll Summary by Month">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Month</th><th>Employees</th><th>Gross</th><th>Deductions</th><th>Net Pay</th>
                                </tr></thead>
                                <tbody>
                                    {[...s.monthlyTrend].reverse().map((row, i) => (
                                        <tr key={i}>
                                            <td><strong>{row.month}</strong></td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{row.count}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: ACCENT }}>{fmtSalary(row.gross)}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: ROSE }}>{fmtSalary(row.deductions)}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: GREEN }}>{fmtSalary(row.net)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Payroll Health">
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Approval Rate</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? ((s.approved + s.paid) / s.total * 100).toFixed(0) : 0}%`, background: GREEN }} /></div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>{s.total ? ((s.approved + s.paid) / s.total * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Paid Rate</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.total ? (s.paid / s.total * 100).toFixed(0) : 0}%`, background: CYAN }} /></div>
                                <span className={styles.healthPct} style={{ color: CYAN }}>{s.total ? (s.paid / s.total * 100).toFixed(1) : 0}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Avg Attendance</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${s.avgAttendancePct.toFixed(0)}%`, background: AMBER }} /></div>
                                <span className={styles.healthPct} style={{ color: AMBER }}>{s.avgAttendancePct.toFixed(1)}%</span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>
                                    Total payroll disbursed: <strong>{fmtSalary(s.totalDisbursed)}</strong>.
                                    {' '}Deductions account for <strong>{s.totalGross ? (s.totalDeductions / s.totalGross * 100).toFixed(1) : 0}%</strong> of gross salary.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* PER-EMPLOYEE */}
            {tab === 'employee' && (
                <div className={styles.grid}>
                    <Card title="Top 10 Employees by Total Pay" action={<span className={styles.badge}>paid sheets only</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.employeeSummary.map(e => ({ name: e.name.slice(0, 14), value: Math.round(e.totalPaid) }))} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Total Net Pay" radius={[0, 6, 6, 0]}>
                                        {s.employeeSummary.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Employee Pay Summary">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr>
                                    <th>Employee</th><th>Sheets</th><th>Total Net Pay</th><th>Avg Net Pay</th>
                                </tr></thead>
                                <tbody>
                                    {s.employeeSummary.map((e, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.dot} style={{ background: C[i % C.length] }} /><strong>{e.name}</strong></td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{e.sheetCount}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: C[i % C.length] }}>{fmtSalary(Math.round(e.totalPaid))}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{fmtSalary(Math.round(e.avgNet))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card title="Attendance Distribution">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.attnData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="attendance" name="Attendance %" radius={[6, 6, 0, 0]}>
                                        {s.attnData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Dept Payroll Pie">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.deptPayroll} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={100} paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {s.deptPayroll.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {/* TRENDS */}
            {tab === 'trends' && (
                <div className={styles.grid}>
                    <Card title="Net Pay Trend" action={<span className={styles.badge}>monthly · paid only</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <LineChart data={s.monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={<Tip />} />
                                    <Line type="monotone" dataKey="net" name="Net Pay" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="deductions" name="Deductions" stroke={ROSE} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Rolling Payroll" action={<span className={styles.badge}>gross vs net</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.monthlyTrend} barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="gross" name="Gross Salary" radius={[6, 6, 0, 0]} fill={ACCENT} />
                                    <Bar dataKey="net" name="Net Pay" radius={[6, 6, 0, 0]} fill={GREEN} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
