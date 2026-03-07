'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import styles from './InquiryAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

/* ── Palette matching ERP dark theme ───────────────────── */
const COLORS  = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT  = '#6366f1'
const GREEN   = '#34d399'
const CYAN    = '#22d3ee'
const AMBER   = '#facc15'
const ROSE    = '#f43f5e'
const PURPLE  = '#a78bfa'

const STATUS_COLOR: Record<string, string> = {
    New:        '#60a5fa',
    Processing: AMBER,
    Quoted:     GREEN,
    Lost:       ROSE,
}

/* ── Helpers ────────────────────────────────────────────── */
function monthKey(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthShort(key: string) {
    const [y, m] = key.split('-')
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y.slice(2)}`
}

/* ── DarkTooltip (same pattern as CustomerAnalytics) ───── */
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

/* ── KPI sub-component ─────────────────────────────────── */
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

/* ── Props ─────────────────────────────────────────────── */
interface Inquiry {
    id: number
    inquiry_no: string
    inquiry_date: string
    status: 'New' | 'Processing' | 'Quoted' | 'Lost'
    customer?: { name: string; code?: string | null } | null
    sales_person?: { name: string } | null
    items?: { quantity: number; target_price?: number | null }[]
}

interface Props {
    inquiries: Inquiry[]
    onClose: () => void
}

/* ══════════════════════════════════════════════════════════ */
export default function InquiryAnalytics({ inquiries, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'pipeline' | 'performance' | 'trend'>('overview')

    const stats = useMemo(() => {
        const total         = inquiries.length
        const newCount      = inquiries.filter(i => i.status === 'New').length
        const processing    = inquiries.filter(i => i.status === 'Processing').length
        const quoted        = inquiries.filter(i => i.status === 'Quoted').length
        const lost          = inquiries.filter(i => i.status === 'Lost').length
        const active        = newCount + processing
        const convRate      = total > 0 ? Math.round(quoted / total * 100) : 0
        const lossRate      = total > 0 ? Math.round(lost  / total * 100) : 0

        /* Status pie */
        const statusPie = [
            { name: 'New',        value: newCount   },
            { name: 'Processing', value: processing },
            { name: 'Quoted',     value: quoted     },
            { name: 'Lost',       value: lost       },
        ].filter(s => s.value > 0)

        /* Monthly trend – last 12 months */
        const now = new Date()
        const monthData: { key: string; label: string; total: number; quoted: number; lost: number }[] = []
        for (let m = 11; m >= 0; m--) {
            const d   = new Date(now.getFullYear(), now.getMonth() - m, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthData.push({
                key, label: monthShort(key),
                total:  inquiries.filter(i => i.inquiry_date?.startsWith(key)).length,
                quoted: inquiries.filter(i => i.inquiry_date?.startsWith(key) && i.status === 'Quoted').length,
                lost:   inquiries.filter(i => i.inquiry_date?.startsWith(key) && i.status === 'Lost').length,
            })
        }

        /* Conversion funnel bar */
        const funnelData = [
            { name: 'Received',   value: total,     fill: ACCENT  },
            { name: 'Processing', value: processing + quoted + lost, fill: CYAN  },
            { name: 'Quoted',     value: quoted + lost,              fill: AMBER },
            { name: 'Won',        value: quoted,                     fill: GREEN },
        ]

        /* Customer breakdown */
        const custMap: Record<string, { total: number; quoted: number; lost: number }> = {}
        inquiries.forEach(i => {
            const name = i.customer?.name ?? 'Unknown'
            if (!custMap[name]) custMap[name] = { total: 0, quoted: 0, lost: 0 }
            custMap[name].total++
            if (i.status === 'Quoted') custMap[name].quoted++
            if (i.status === 'Lost')   custMap[name].lost++
        })
        const topCustomers = Object.entries(custMap)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 8)
            .map(([name, d]) => ({ name, ...d }))

        /* Salesperson breakdown */
        const spMap: Record<string, { total: number; quoted: number; lost: number }> = {}
        inquiries.forEach(i => {
            const sp = i.sales_person?.name ?? 'Unassigned'
            if (!spMap[sp]) spMap[sp] = { total: 0, quoted: 0, lost: 0 }
            spMap[sp].total++
            if (i.status === 'Quoted') spMap[sp].quoted++
            if (i.status === 'Lost')   spMap[sp].lost++
        })
        const salesData = Object.entries(spMap)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 8)
            .map(([name, d]) => ({
                name: name.split(' ')[0], // first name only for chart
                fullName: name,
                total: d.total,
                quoted: d.quoted,
                lost: d.lost,
                rate: d.total > 0 ? Math.round(d.quoted / d.total * 100) : 0,
            }))

        /* Radar data for performance */
        const radarData = salesData.slice(0, 6).map(sp => ({
            person:  sp.name,
            total:   sp.total,
            quoted:  sp.quoted,
            lost:    sp.lost,
        }))

        /* Day-of-week distribution */
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayMap: Record<string, number> = {}
        dayNames.forEach(d => { dayMap[d] = 0 })
        inquiries.forEach(i => {
            if (i.inquiry_date) {
                const day = dayNames[new Date(i.inquiry_date).getDay()]
                dayMap[day]++
            }
        })
        const dayData = dayNames.map(name => ({ name, value: dayMap[name] }))

        return {
            total, newCount, processing, quoted, lost, active, convRate, lossRate,
            statusPie, monthData, funnelData,
            topCustomers, salesData, radarData, dayData,
        }
    }, [inquiries])

    const tabs = [
        { id: 'overview',    label: '⊞ Overview'      },
        { id: 'pipeline',    label: '◈ Pipeline'       },
        { id: 'performance', label: '◉ Performance'    },
        { id: 'trend',       label: '◎ Trend & Health' },
    ] as const

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Inquiry Analytics</h1>
                    <p className={styles.subtitle}>360° inquiry data visualization · {stats.total} records</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.backBtn} onClick={onClose}>← Back to List</button>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Inquiries"  value={String(stats.total)}      color={ACCENT}  />
                <KPI icon="◉" label="Active Pipeline"  value={String(stats.active)}     color={CYAN}    />
                <KPI icon="▣" label="Quoted"            value={String(stats.quoted)}     color={GREEN}   />
                <KPI icon="⬡" label="Lost"              value={String(stats.lost)}       color={ROSE}    />
                <KPI icon="◎" label="Conversion Rate"   value={`${stats.convRate}%`}    color={AMBER}   />
                <KPI icon="◇" label="Loss Rate"         value={`${stats.lossRate}%`}    color={PURPLE}  />
            </div>

            {/* ── Tab Bar ── */}
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

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
                <div className={styles.grid}>

                    {/* Status Pie */}
                    <Card title="Status Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.statusPie}
                                        dataKey="value" nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={48}
                                        paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        {stats.statusPie.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_COLOR[entry.name] ?? COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Monthly Volume Bar */}
                    <Card title="Monthly Inquiry Volume" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.monthData} barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="total"  name="Total"  radius={[4, 4, 0, 0]} fill={ACCENT} />
                                    <Bar dataKey="quoted" name="Quoted" radius={[4, 4, 0, 0]} fill={GREEN}  />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Day-of-week distribution */}
                    <Card title="Inquiries by Day of Week">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.dayData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Inquiries" radius={[6, 6, 0, 0]}>
                                        {stats.dayData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Status summary table */}
                    <Card title="Status Summary Table">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Count</th>
                                        <th>% of Total</th>
                                        <th>Share</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'New',        val: stats.newCount,   color: STATUS_COLOR['New']        },
                                        { name: 'Processing', val: stats.processing, color: STATUS_COLOR['Processing']  },
                                        { name: 'Quoted',     val: stats.quoted,     color: STATUS_COLOR['Quoted']      },
                                        { name: 'Lost',       val: stats.lost,       color: STATUS_COLOR['Lost']        },
                                    ].map(row => (
                                        <tr key={row.name}>
                                            <td><span className={styles.dot} style={{ background: row.color }} />{row.name}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{row.val}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>
                                                {stats.total > 0 ? (row.val / stats.total * 100).toFixed(1) : 0}%
                                            </td>
                                            <td>
                                                <div className={styles.barCell}>
                                                    <div className={styles.barFill} style={{ width: stats.total > 0 ? `${row.val / stats.total * 100}%` : '0%', background: row.color }} />
                                                    <span>{row.val}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ══ PIPELINE ══ */}
            {activeTab === 'pipeline' && (
                <div className={styles.grid}>

                    {/* Conversion Funnel */}
                    <Card title="Conversion Funnel" action={<span className={styles.badge}>inquiry → win</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.funnelData} layout="vertical" barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                                        {stats.funnelData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Quoted vs Lost bar */}
                    <Card title="Quoted vs Lost per Month" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.monthData} barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="quoted" name="Quoted" fill={GREEN} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="lost"   name="Lost"   fill={ROSE}  radius={[4, 4, 0, 0]} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top Customers bar */}
                    <Card title="Top Customers by Inquiry Count" action={<span className={styles.badge}>top 8</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.topCustomers} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="total"  name="Total"  fill={ACCENT} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="quoted" name="Quoted" fill={GREEN}  radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Pipeline summary table */}
                    <Card title="Customer Pipeline Detail" action={<span className={styles.badge}>top 8 customers</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Quoted</th>
                                        <th>Lost</th>
                                        <th>Conv. Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topCustomers.map((c, i) => {
                                        const rate = c.total > 0 ? Math.round(c.quoted / c.total * 100) : 0
                                        return (
                                            <tr key={c.name}>
                                                <td><span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />{c.name}</td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{c.total}</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: GREEN }}>{c.quoted}</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: ROSE }}>{c.lost}</td>
                                                <td>
                                                    <div className={styles.barCell}>
                                                        <div className={styles.barFill} style={{ width: `${rate}%`, background: rate >= 50 ? GREEN : ROSE }} />
                                                        <span style={{ color: rate >= 50 ? GREEN : ROSE }}>{rate}%</span>
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

            {/* ══ PERFORMANCE ══ */}
            {activeTab === 'performance' && (
                <div className={styles.grid}>

                    {/* Salesperson bar */}
                    <Card title="Sales Person — Total vs Quoted" action={<span className={styles.badge}>grouped bar</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.salesData} barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="total"  name="Total"  fill={ACCENT} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="quoted" name="Quoted" fill={GREEN}  radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="lost"   name="Lost"   fill={ROSE}   radius={[4, 4, 0, 0]} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Sales Radar */}
                    <Card title="Team Performance Radar" action={<span className={styles.badge}>top 6 reps</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="person" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Total"  dataKey="total"  stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} />
                                    <Radar name="Quoted" dataKey="quoted" stroke={GREEN}  fill={GREEN}  fillOpacity={0.15} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Salesperson table */}
                    <Card title="Sales Person Leaderboard" action={<span className={styles.badge}>by conversion rate</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sales Person</th>
                                        <th>Total</th>
                                        <th>Quoted</th>
                                        <th>Lost</th>
                                        <th>Conv. %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...stats.salesData].sort((a, b) => b.rate - a.rate).map((sp, i) => (
                                        <tr key={sp.fullName}>
                                            <td style={{ color: '#6b7280', fontFamily: 'var(--mono)' }}>#{i + 1}</td>
                                            <td><strong>{sp.fullName}</strong></td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{sp.total}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: GREEN }}>{sp.quoted}</td>
                                            <td style={{ fontFamily: 'var(--mono)', color: ROSE }}>{sp.lost}</td>
                                            <td>
                                                <span className={styles.riskPill} style={{
                                                    background: `${sp.rate >= 50 ? GREEN : ROSE}22`,
                                                    color: sp.rate >= 50 ? GREEN : ROSE,
                                                }}>
                                                    {sp.rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ══ TREND & HEALTH ══ */}
            {activeTab === 'trend' && (
                <div className={styles.grid}>

                    {/* Line chart — trend */}
                    <Card title="Inquiry Volume Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Line type="monotone" dataKey="total"  name="Total"  stroke={ACCENT} strokeWidth={2.5} dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="quoted" name="Quoted" stroke={GREEN}  strokeWidth={2}   dot={{ fill: GREEN,  r: 3 }} />
                                    <Line type="monotone" dataKey="lost"   name="Lost"   stroke={ROSE}   strokeWidth={2}   dot={{ fill: ROSE,   r: 3 }} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Quoted pie */}
                    <Card title="Win / Loss Mix">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Quoted (Won)', value: stats.quoted },
                                            { name: 'Lost',         value: stats.lost   },
                                            { name: 'Active',       value: stats.active  },
                                        ].filter(d => d.value > 0)}
                                        dataKey="value" nameKey="name"
                                        cx="50%" cy="50%"
                                        outerRadius={95} paddingAngle={3}
                                        label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        <Cell fill={GREEN}  />
                                        <Cell fill={ROSE}   />
                                        <Cell fill={CYAN}   />
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Health Panel */}
                    <Card title="Pipeline Health Overview">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Conversion Rate',  val: stats.convRate,  color: GREEN,  suffix: '%' },
                                { label: 'Loss Rate',         val: stats.lossRate,  color: ROSE,   suffix: '%' },
                                { label: 'Active Pipeline',   val: stats.total > 0 ? Math.round(stats.active / stats.total * 100) : 0, color: CYAN,  suffix: '%' },
                            ].map(row => (
                                <div key={row.label} className={styles.healthRow}>
                                    <span className={styles.healthLabel}>{row.label}</span>
                                    <div className={styles.healthBar}>
                                        <div className={styles.healthFill} style={{ width: `${row.val}%`, background: row.color }} />
                                    </div>
                                    <span className={styles.healthPct} style={{ color: row.color }}>{row.val}{row.suffix}</span>
                                </div>
                            ))}
                            <div className={styles.insight}>
                                <span>
                                    {stats.convRate >= 50
                                        ? 'Pipeline is performing well — conversion rate above 50%.'
                                        : stats.convRate >= 30
                                        ? 'Moderate conversion. Focus on follow-ups for Processing inquiries.'
                                        : 'Low conversion rate. Review lost inquiries for common reasons.'}
                                    {' '}Total of <strong>{stats.total}</strong> inquiries with{' '}
                                    <strong>{stats.quoted}</strong> quoted successfully.
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Recent inquiry log */}
                    <Card title="Recent Inquiries" action={<span className={styles.badge}>latest 10</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Inquiry No.</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Salesperson</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...inquiries]
                                        .sort((a, b) => new Date(b.inquiry_date).getTime() - new Date(a.inquiry_date).getTime())
                                        .slice(0, 10)
                                        .map(inq => (
                                            <tr key={inq.id}>
                                                <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{inq.inquiry_no}</td>
                                                <td>{inq.customer?.name ?? '—'}</td>
                                                <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#6b7280' }}>
                                                    {new Date(inq.inquiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{inq.sales_person?.name ?? '—'}</td>
                                                <td>
                                                    <span className={styles.riskPill} style={{
                                                        background: `${STATUS_COLOR[inq.status]}22`,
                                                        color: STATUS_COLOR[inq.status],
                                                    }}>{inq.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
