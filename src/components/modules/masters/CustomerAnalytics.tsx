'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Customer } from '@/types/customer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Treemap,
} from 'recharts'

type Props = { customers: Customer[] }

/* ── Palette matching the ERP dark theme ─────────────────────────────── */
const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1'
const GREEN = '#34d399'
const CYAN = '#22d3ee'
const AMBER = '#facc15'
const ROSE = '#f43f5e'

/* ── Helpers ─────────────────────────────────────────────────────────── */
const fmtCurrency = (n: number) =>
    n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
        : n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
            : `₹${n.toLocaleString('en-IN')}`

const CREDIT_BUCKETS = [15, 30, 45, 60, 90]

/* ── Custom dark tooltip ─────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label, formatter }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function CustomerAnalytics({ customers }: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'financial' | 'risk'>('overview')

    /* ── Derived stats ────────────────────────────────────────────────── */
    const stats = useMemo(() => {
        const total = customers.length
        const active = customers.filter(c => c.is_active === 1).length
        const inactive = total - active
        const totalLimit = customers.reduce((s, c) => s + (c.credit_limit ?? 0), 0)
        const avgLimit = total ? totalLimit / total : 0
        const avgPeriod = total ? customers.reduce((s, c) => s + (c.credit_period ?? 0), 0) / total : 0

        /* state distribution */
        const stateMap: Record<string, number> = {}
        customers.forEach(c => {
            if (c.state) stateMap[c.state] = (stateMap[c.state] ?? 0) + 1
        })
        const stateData = Object.entries(stateMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }))

        /* city top-10 */
        const cityMap: Record<string, number> = {}
        customers.forEach(c => {
            if (c.city) cityMap[c.city] = (cityMap[c.city] ?? 0) + 1
        })
        const cityData = Object.entries(cityMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))

        /* credit period distribution */
        const creditPeriodMap: Record<string, number> = {}
        CREDIT_BUCKETS.forEach(b => { creditPeriodMap[`${b}d`] = 0 })
        creditPeriodMap['Other'] = 0
        customers.forEach(c => {
            const bucket = CREDIT_BUCKETS.includes(c.credit_period) ? `${c.credit_period}d` : 'Other'
            creditPeriodMap[bucket] = (creditPeriodMap[bucket] ?? 0) + 1
        })
        const creditPeriodData = Object.entries(creditPeriodMap).map(([name, value]) => ({ name, value }))

        /* credit limit tiers */
        const limitTiers: Record<string, number> = {
            '< 1L': 0, '1L–5L': 0, '5L–10L': 0, '10L–20L': 0, '> 20L': 0,
        }
        customers.forEach(c => {
            const l = c.credit_limit ?? 0
            if (l < 1_00_000) limitTiers['< 1L']++
            else if (l < 5_00_000) limitTiers['1L–5L']++
            else if (l < 10_00_000) limitTiers['5L–10L']++
            else if (l < 20_00_000) limitTiers['10L–20L']++
            else limitTiers['> 20L']++
        })
        const limitTierData = Object.entries(limitTiers).map(([name, value]) => ({ name, value }))

        /* Monthly registration trend (from created_at) */
        const monthMap: Record<string, number> = {}
        customers.forEach(c => {
            if (!c.created_at) return
            const d = new Date(c.created_at)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthMap[key] = (monthMap[key] ?? 0) + 1
        })
        const monthTrend = Object.entries(monthMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([month, count]) => {
                const [y, m] = month.split('-')
                return { month: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]} ${y.slice(2)}`, count }
            })

        /* Risk radar: exposure by state (top 6) */
        const stateExposure: Record<string, { count: number; limit: number }> = {}
        customers.forEach(c => {
            if (!c.state) return
            if (!stateExposure[c.state]) stateExposure[c.state] = { count: 0, limit: 0 }
            stateExposure[c.state].count++
            stateExposure[c.state].limit += c.credit_limit ?? 0
        })
        const radarData = Object.entries(stateExposure)
            .sort((a, b) => b[1].limit - a[1].limit)
            .slice(0, 6)
            .map(([state, d]) => ({
                state: state.length > 10 ? state.slice(0, 10) + '…' : state,
                customers: d.count,
                exposure: Math.round(d.limit / 1_00_000), // in Lakhs
            }))

        /* Treemap for state×customers */
        const treemapData = stateData.slice(0, 12).map((s, i) => ({
            name: s.name,
            size: s.value,
            fill: COLORS[i % COLORS.length],
        }))

        /* Active vs Inactive pie */
        const statusPie = [
            { name: 'Active', value: active },
            { name: 'Inactive', value: inactive },
        ]

        return {
            total, active, inactive, totalLimit, avgLimit, avgPeriod,
            stateData, cityData, creditPeriodData, limitTierData,
            monthTrend, radarData, treemapData, statusPie,
        }
    }, [customers])

    const tabs = [
        { id: 'overview', label: '⊞ Overview' },
        { id: 'geography', label: '◎ Geography' },
        { id: 'financial', label: '◈ Financial' },
        { id: 'risk', label: '◉ Risk & Trend' },
    ] as const

    return (
        <div className={styles.page}>

            {/* ── Header ───────────────────────────────────────────── */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Customer Analytics</h1>
                    <p className={styles.subtitle}>360° data visualization · {stats.total} customers</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/masters/customers')}>
                        ← Back to List
                    </Button>
                </div>
            </div>

            {/* ── KPI Strip ────────────────────────────────────────── */}
            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Customers" value={String(stats.total)} color={ACCENT} />
                <KPI icon="◉" label="Active" value={String(stats.active)} color={GREEN} />
                <KPI icon="◎" label="Inactive" value={String(stats.inactive)} color={ROSE} />
                <KPI icon="▣" label="Total Credit Pool" value={fmtCurrency(stats.totalLimit)} color={CYAN} />
                <KPI icon="⬡" label="Avg Credit Limit" value={fmtCurrency(Math.round(stats.avgLimit))} color={AMBER} />
                <KPI icon="◇" label="Avg Credit Period" value={`${stats.avgPeriod.toFixed(0)}d`} color="#a78bfa" />
            </div>

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div className={styles.tabBar}>
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ──────────────────────────────────────── */}

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className={styles.grid}>

                    {/* Status Pie */}
                    <Card title="Active vs Inactive">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.statusPie}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={90}
                                        innerRadius={50}
                                        paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill={GREEN} />
                                        <Cell fill={ROSE} />
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Credit Period Bar */}
                    <Card title="Credit Period Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.creditPeriodData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip label="Credit Period" />} />
                                    <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]}>
                                        {stats.creditPeriodData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top Cities Bar */}
                    <Card title="Top 10 Cities" action={<span className={styles.badge}>by customer count</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.cityData} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Customers" radius={[0, 6, 6, 0]}>
                                        {stats.cityData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Credit Limit Tiers Pie */}
                    <Card title="Credit Limit Segments">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.limitTierData}
                                        dataKey="value" nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={100}
                                        paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {stats.limitTierData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                </div>
            )}

            {/* GEOGRAPHY */}
            {activeTab === 'geography' && (
                <div className={styles.grid}>

                    {/* State Bar */}
                    <Card title="Customers by State" action={<span className={styles.badge}>all states</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.stateData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]}>
                                        {stats.stateData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Treemap */}
                    <Card title="State Share — Treemap" action={<span className={styles.badge}>top 12 states</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <Treemap
                                    data={stats.treemapData}
                                    dataKey="size"
                                    nameKey="name"
                                    aspectRatio={4 / 3}
                                    content={<TreemapCell />}
                                />
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* City horizontal */}
                    <Card title="Top 10 Cities" action={<span className={styles.badge}>by volume</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.cityData} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Customers" radius={[0, 6, 6, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* State pie */}
                    <Card title="State Share — Pie" action={<span className={styles.badge}>top 10</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <PieChart>
                                    <Pie
                                        data={stats.stateData.slice(0, 10)}
                                        dataKey="value" nameKey="name"
                                        cx="50%" cy="45%"
                                        outerRadius={120}
                                        paddingAngle={2}
                                    >
                                        {stats.stateData.slice(0, 10).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                </div>
            )}

            {/* FINANCIAL */}
            {activeTab === 'financial' && (
                <div className={styles.grid}>

                    {/* Credit Limit by State */}
                    <Card title="Total Credit Exposure by State" action={<span className={styles.badge}>₹ in Lakhs</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart
                                    data={stats.radarData.map(r => ({ name: r.state, value: r.exposure }))}
                                    barSize={28}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
                                    <Tooltip content={<DarkTooltip formatter={(v: number) => `₹${v}L`} />} />
                                    <Bar dataKey="value" name="Exposure" radius={[6, 6, 0, 0]}>
                                        {stats.radarData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Credit Limit tiers bar */}
                    <Card title="Credit Limit Tier Distribution">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.limitTierData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]}>
                                        {stats.limitTierData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Credit Period Pie */}
                    <Card title="Credit Period Mix">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={stats.creditPeriodData}
                                        dataKey="value" nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={100}
                                        innerRadius={50}
                                        paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        {stats.creditPeriodData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Financial summary table */}
                    <Card title="Financial Summary by State">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>State</th>
                                        <th>Customers</th>
                                        <th>Total Exposure</th>
                                        <th>Avg Limit</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.radarData.map((r, i) => {
                                        const exposure = r.exposure * 1_00_000
                                        const share = stats.totalLimit ? (exposure / stats.totalLimit * 100).toFixed(1) : '0'
                                        return (
                                            <tr key={r.state}>
                                                <td><span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />{r.state}</td>
                                                <td>{r.customers}</td>
                                                <td>{fmtCurrency(exposure)}</td>
                                                <td>{fmtCurrency(Math.round(exposure / r.customers))}</td>
                                                <td>
                                                    <div className={styles.barCell}>
                                                        <div className={styles.barFill} style={{ width: `${share}%`, background: COLORS[i % COLORS.length] }} />
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

                </div>
            )}

            {/* RISK & TREND */}
            {activeTab === 'risk' && (
                <div className={styles.grid}>

                    {/* Registration trend */}
                    <Card title="Customer Registration Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Line type="monotone" dataKey="count" name="New Customers" stroke={ACCENT} strokeWidth={2.5} dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Radar – state-wise risk */}
                    <Card title="Geographic Risk Radar" action={<span className={styles.badge}>top 6 states by exposure</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Exposure (₹L)" dataKey="exposure" stroke={CYAN} fill={CYAN} fillOpacity={0.2} />
                                    <Radar name="Customers" dataKey="customers" stroke={AMBER} fill={AMBER} fillOpacity={0.15} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Risk concentration table */}
                    <Card title="Credit Risk Concentration" action={<span className={styles.badge}>high limit customers</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>City</th>
                                        <th>State</th>
                                        <th>Credit Limit</th>
                                        <th>Credit Period</th>
                                        <th>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...customers]
                                        .sort((a, b) => (b.credit_limit ?? 0) - (a.credit_limit ?? 0))
                                        .slice(0, 10)
                                        .map(c => {
                                            const risk = (c.credit_limit ?? 0) > 5_00_000
                                                ? { label: 'High', color: ROSE }
                                                : (c.credit_limit ?? 0) > 2_00_000
                                                    ? { label: 'Medium', color: AMBER }
                                                    : { label: 'Low', color: GREEN }
                                            return (
                                                <tr key={c.id}>
                                                    <td><strong>{c.name}</strong><br /><small style={{ color: '#6b7280' }}>{c.code}</small></td>
                                                    <td>{c.city ?? '—'}</td>
                                                    <td>{c.state ?? '—'}</td>
                                                    <td style={{ fontFamily: 'var(--mono)' }}>{fmtCurrency(c.credit_limit ?? 0)}</td>
                                                    <td style={{ fontFamily: 'var(--mono)' }}>{c.credit_period}d</td>
                                                    <td><span className={styles.riskPill} style={{ background: `${risk.color}22`, color: risk.color }}>{risk.label}</span></td>
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Status summary */}
                    <Card title="Status Health Overview">
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Active Rate</span>
                                <div className={styles.healthBar}>
                                    <div className={styles.healthFill} style={{ width: `${(stats.active / stats.total * 100).toFixed(0)}%`, background: GREEN }} />
                                </div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>
                                    {(stats.active / stats.total * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Inactive Rate</span>
                                <div className={styles.healthBar}>
                                    <div className={styles.healthFill} style={{ width: `${(stats.inactive / stats.total * 100).toFixed(0)}%`, background: ROSE }} />
                                </div>
                                <span className={styles.healthPct} style={{ color: ROSE }}>
                                    {(stats.inactive / stats.total * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>High-Risk Customers</span>
                                <div className={styles.healthBar}>
                                    <div className={styles.healthFill} style={{ width: `${(customers.filter(c => (c.credit_limit ?? 0) > 5_00_000).length / stats.total * 100).toFixed(0)}%`, background: AMBER }} />
                                </div>
                                <span className={styles.healthPct} style={{ color: AMBER }}>
                                    {customers.filter(c => (c.credit_limit ?? 0) > 5_00_000).length} customers
                                </span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Long Credit (60+ days)</span>
                                <div className={styles.healthBar}>
                                    <div className={styles.healthFill} style={{ width: `${(customers.filter(c => c.credit_period >= 60).length / stats.total * 100).toFixed(0)}%`, background: '#a78bfa' }} />
                                </div>
                                <span className={styles.healthPct} style={{ color: '#a78bfa' }}>
                                    {customers.filter(c => c.credit_period >= 60).length} customers
                                </span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>
                                    {stats.active / stats.total > 0.8
                                        ? 'Customer base is healthy — over 80% active.'
                                        : 'Consider a re-engagement campaign — active rate below 80%.'}
                                    {' '}Total credit pool of <strong>{fmtCurrency(stats.totalLimit)}</strong> spread across <strong>{stats.stateData.length}</strong> states.
                                </span>
                            </div>
                        </div>
                    </Card>

                </div>
            )}

        </div>
    )
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function KPI({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
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

function TreemapCell(props: any) {
    const { x, y, width, height, name, fill, value } = props
    if (!width || !height || width < 30 || height < 20) return null
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} opacity={0.85} />
            <rect x={x} y={y} width={width} height={height} fill="transparent" stroke="#0f1117" strokeWidth={2} rx={6} />
            {width > 50 && height > 30 && (
                <>
                    <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
                    <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>{value}</text>
                </>
            )}
        </g>
    )
}
