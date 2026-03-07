'use client'

import { useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import styles from './SaleOrderAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

/* ── Palette ──────────────────────────────────────────────────────────── */
const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1'
const GREEN  = '#34d399'
const CYAN   = '#22d3ee'
const AMBER  = '#facc15'
const ROSE   = '#f43f5e'
const PURPLE = '#a78bfa'

const STATUS_COLOR: Record<string, string> = {
    Pending:    AMBER,
    Dispatched: CYAN,
    Closed:     GREEN,
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
const fmtCurrency = (n: number) =>
    n >= 1_00_00_000 ? `₹${(n / 1_00_00_000).toFixed(1)}Cr`
    : n >= 1_00_000  ? `₹${(n / 1_00_000).toFixed(1)}L`
    : `₹${n.toLocaleString('en-IN')}`

function monthKey(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function monthShort(key: string) {
    const [y, m] = key.split('-')
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y.slice(2)}`
}

/* ── DarkTooltip ─────────────────────────────────────────────────────── */
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

/* ── KPI card ────────────────────────────────────────────────────────── */
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

/* ── Types ───────────────────────────────────────────────────────────── */
interface SOItem { quantity: number; rate: number; total: number; taxable_value: number; gst_amount: number; product?: { name: string; code?: string | null } | null }
interface SaleOrder {
    id: number; so_no: string; so_date: string; status: 'Pending' | 'Dispatched' | 'Closed'
    customer?:    { name: string; code?: string | null } | null
    transporter?: { name: string } | null
    items?:       SOItem[]
}
interface Props { saleOrders: SaleOrder[]; onClose: () => void }

/* ══════════════════════════════════════════════════════════════════════ */
export default function SaleOrderAnalytics({ saleOrders, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'trend'>('overview')

    const stats = useMemo(() => {
        const total      = saleOrders.length
        const pending    = saleOrders.filter(o => o.status === 'Pending').length
        const dispatched = saleOrders.filter(o => o.status === 'Dispatched').length
        const closed     = saleOrders.filter(o => o.status === 'Closed').length

        /* Revenue aggregates */
        const totalRevenue  = saleOrders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + (i.total ?? 0), 0) ?? 0), 0)
        const totalTaxable  = saleOrders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + (i.taxable_value ?? 0), 0) ?? 0), 0)
        const totalGST      = saleOrders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + (i.gst_amount ?? 0), 0) ?? 0), 0)
        const avgOrderValue = total ? totalRevenue / total : 0

        /* Status pie */
        const statusPie = [
            { name: 'Pending',    value: pending    },
            { name: 'Dispatched', value: dispatched },
            { name: 'Closed',     value: closed     },
        ].filter(s => s.value > 0)

        /* Monthly trend — last 12 months */
        const now = new Date()
        const monthData: { key: string; label: string; orders: number; revenue: number }[] = []
        for (let m = 11; m >= 0; m--) {
            const d   = new Date(now.getFullYear(), now.getMonth() - m, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const mos = saleOrders.filter(o => o.so_date?.startsWith(key))
            monthData.push({
                key, label: monthShort(key),
                orders:  mos.length,
                revenue: mos.reduce((s, o) => s + (o.items?.reduce((a, i) => a + (i.total ?? 0), 0) ?? 0), 0),
            })
        }

        /* Customer revenue breakdown */
        const custMap: Record<string, { orders: number; revenue: number }> = {}
        saleOrders.forEach(o => {
            const name = o.customer?.name ?? 'Unknown'
            if (!custMap[name]) custMap[name] = { orders: 0, revenue: 0 }
            custMap[name].orders++
            custMap[name].revenue += o.items?.reduce((a, i) => a + (i.total ?? 0), 0) ?? 0
        })
        const topCustomers = Object.entries(custMap)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 8)
            .map(([name, d]) => ({ name, ...d }))

        /* Transporter usage */
        const tMap: Record<string, number> = {}
        saleOrders.forEach(o => {
            const name = o.transporter?.name ?? 'Self / Direct'
            tMap[name] = (tMap[name] ?? 0) + 1
        })
        const transporterData = Object.entries(tMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value }))

        /* Product revenue breakdown */
        const prodMap: Record<string, { qty: number; revenue: number }> = {}
        saleOrders.forEach(o => {
            o.items?.forEach(i => {
                const name = i.product?.name ?? 'Unknown'
                if (!prodMap[name]) prodMap[name] = { qty: 0, revenue: 0 }
                prodMap[name].qty     += i.quantity ?? 0
                prodMap[name].revenue += i.total ?? 0
            })
        })
        const topProducts = Object.entries(prodMap)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 8)
            .map(([name, d]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, ...d }))

        /* Day-of-week dist */
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayMap: Record<string, number> = {}
        dayNames.forEach(d => { dayMap[d] = 0 })
        saleOrders.forEach(o => {
            if (o.so_date) dayMap[dayNames[new Date(o.so_date).getDay()]]++
        })
        const dayData = dayNames.map(name => ({ name, value: dayMap[name] }))

        /* Radar — customer breakdown */
        const radarData = topCustomers.slice(0, 6).map(c => ({
            customer: c.name.split(' ')[0],
            orders:   c.orders,
            revenue:  Math.round(c.revenue / 1_00_000), // in Lakhs
        }))

        /* Dispatch health */
        const dispatchRate = total > 0 ? Math.round((dispatched + closed) / total * 100) : 0
        const closedRate   = total > 0 ? Math.round(closed  / total * 100) : 0
        const pendingRate  = total > 0 ? Math.round(pending  / total * 100) : 0

        return {
            total, pending, dispatched, closed,
            totalRevenue, totalTaxable, totalGST, avgOrderValue,
            statusPie, monthData,
            topCustomers, transporterData, topProducts, dayData, radarData,
            dispatchRate, closedRate, pendingRate,
        }
    }, [saleOrders])

    const tabs = [
        { id: 'overview',   label: '⊞ Overview'      },
        { id: 'revenue',    label: '◈ Revenue'        },
        { id: 'customers',  label: '◉ Customers'      },
        { id: 'trend',      label: '◎ Trend & Health' },
    ] as const

    return (
        <div className={styles.page}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Sale Order Analytics</h1>
                    <p className={styles.subtitle}>360° order data visualization · {stats.total} orders</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.backBtn} onClick={onClose}>← Back to List</button>
                </div>
            </div>

            {/* ── KPI Strip ── */}
            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Orders"     value={String(stats.total)}                    color={ACCENT}  />
                <KPI icon="◉" label="Pending"           value={String(stats.pending)}                  color={AMBER}   />
                <KPI icon="▣" label="Dispatched"        value={String(stats.dispatched)}               color={CYAN}    />
                <KPI icon="⬡" label="Closed"            value={String(stats.closed)}                   color={GREEN}   />
                <KPI icon="◎" label="Total Revenue"     value={fmtCurrency(stats.totalRevenue)}        color={PURPLE}  />
                <KPI icon="◇" label="Avg Order Value"   value={fmtCurrency(Math.round(stats.avgOrderValue))} color={ROSE} />
            </div>

            {/* ── Tab Bar ── */}
            <div className={styles.tabBar}>
                {tabs.map(t => (
                    <button key={t.id}
                        className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
                <div className={styles.grid}>

                    {/* Status Pie */}
                    <Card title="Order Status Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={stats.statusPie} dataKey="value" nameKey="name"
                                        cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
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

                    {/* Monthly orders bar */}
                    <Card title="Monthly Order Volume" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.monthData} barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]} fill={ACCENT} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Day of week */}
                    <Card title="Orders by Day of Week">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.dayData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Orders" radius={[6, 6, 0, 0]}>
                                        {stats.dayData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Status summary table */}
                    <Card title="Status Summary Table">
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr><th>Status</th><th>Orders</th><th>% of Total</th><th>Share</th></tr></thead>
                                <tbody>
                                    {[
                                        { name: 'Pending',    val: stats.pending,    color: STATUS_COLOR['Pending']    },
                                        { name: 'Dispatched', val: stats.dispatched, color: STATUS_COLOR['Dispatched'] },
                                        { name: 'Closed',     val: stats.closed,     color: STATUS_COLOR['Closed']     },
                                    ].map(row => (
                                        <tr key={row.name}>
                                            <td><span className={styles.dot} style={{ background: row.color }} />{row.name}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{row.val}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{stats.total > 0 ? (row.val / stats.total * 100).toFixed(1) : 0}%</td>
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

            {/* ══ REVENUE ══ */}
            {activeTab === 'revenue' && (
                <div className={styles.grid}>

                    {/* Revenue trend line */}
                    <Card title="Monthly Revenue Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <LineChart data={stats.monthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCurrency(v)} />
                                    <Tooltip content={<DarkTooltip formatter={fmtCurrency} />} />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={GREEN} strokeWidth={2.5} dot={{ fill: GREEN, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Top products by revenue */}
                    <Card title="Top Products by Revenue" action={<span className={styles.badge}>top 8</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.topProducts} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCurrency(v)} />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip formatter={fmtCurrency} />} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                                        {stats.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Revenue breakup pie (taxable vs GST) */}
                    <Card title="Revenue Breakup — Taxable vs GST">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Taxable Value', value: Math.round(stats.totalTaxable) },
                                            { name: 'GST Amount',    value: Math.round(stats.totalGST)    },
                                        ]}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${name.split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill={ACCENT} />
                                        <Cell fill={AMBER}  />
                                    </Pie>
                                    <Tooltip content={<DarkTooltip formatter={fmtCurrency} />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Revenue financial summary */}
                    <Card title="Revenue Financial Summary">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Total Revenue',    val: fmtCurrency(stats.totalRevenue),                         color: GREEN  },
                                { label: 'Taxable Value',    val: fmtCurrency(stats.totalTaxable),                         color: ACCENT },
                                { label: 'Total GST',        val: fmtCurrency(stats.totalGST),                             color: AMBER  },
                                { label: 'Avg Order Value',  val: fmtCurrency(Math.round(stats.avgOrderValue)),            color: CYAN   },
                            ].map(row => (
                                <div key={row.label} className={styles.healthRow}>
                                    <span className={styles.healthLabel}>{row.label}</span>
                                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: row.color, fontSize: '1rem', marginLeft: 'auto' }}>
                                        {row.val}
                                    </span>
                                </div>
                            ))}
                            <div className={styles.insight}>
                                <span>
                                    GST contributes <strong>{stats.totalRevenue > 0 ? (stats.totalGST / stats.totalRevenue * 100).toFixed(1) : 0}%</strong> of total revenue.
                                    Top product accounts for <strong>{stats.topProducts[0]?.name ?? '—'}</strong> in revenue.
                                    Avg order value is <strong>{fmtCurrency(Math.round(stats.avgOrderValue))}</strong>.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* ══ CUSTOMERS ══ */}
            {activeTab === 'customers' && (
                <div className={styles.grid}>

                    {/* Top customers revenue bar */}
                    <Card title="Top Customers by Revenue" action={<span className={styles.badge}>top 8</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={stats.topCustomers} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCurrency(v)} />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip formatter={fmtCurrency} />} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]} fill={ACCENT} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Customer radar */}
                    <Card title="Customer Activity Radar" action={<span className={styles.badge}>top 6 · ₹L</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="customer" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Orders"      dataKey="orders"  stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} />
                                    <Radar name="Revenue (L)" dataKey="revenue" stroke={GREEN}  fill={GREEN}  fillOpacity={0.15} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                    <Tooltip content={<DarkTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Transporter usage */}
                    <Card title="Transporter Usage" action={<span className={styles.badge}>by order count</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats.transporterData} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Bar dataKey="value" name="Orders" radius={[0, 6, 6, 0]}>
                                        {stats.transporterData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Customer detail table */}
                    <Card title="Customer Revenue Detail" action={<span className={styles.badge}>top 8</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr><th>#</th><th>Customer</th><th>Orders</th><th>Revenue</th><th>Share</th></tr></thead>
                                <tbody>
                                    {stats.topCustomers.map((c, i) => {
                                        const share = stats.totalRevenue > 0 ? (c.revenue / stats.totalRevenue * 100) : 0
                                        return (
                                            <tr key={c.name}>
                                                <td style={{ color: '#6b7280', fontFamily: 'var(--mono)' }}>#{i + 1}</td>
                                                <td><span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} /><strong>{c.name}</strong></td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{c.orders}</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: GREEN }}>{fmtCurrency(c.revenue)}</td>
                                                <td>
                                                    <div className={styles.barCell}>
                                                        <div className={styles.barFill} style={{ width: `${share}%`, background: COLORS[i % COLORS.length] }} />
                                                        <span>{share.toFixed(1)}%</span>
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

            {/* ══ TREND & HEALTH ══ */}
            {activeTab === 'trend' && (
                <div className={styles.grid}>

                    {/* Orders + Revenue dual trend */}
                    <Card title="Order Volume & Revenue — 12-Month Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1} />
                                    <YAxis yAxisId="orders" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <YAxis yAxisId="rev"    orientation="right" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCurrency(v)} />
                                    <Tooltip content={<DarkTooltip />} />
                                    <Line yAxisId="orders" type="monotone" dataKey="orders"  name="Orders"  stroke={ACCENT} strokeWidth={2.5} dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="rev"    type="monotone" dataKey="revenue" name="Revenue" stroke={GREEN}  strokeWidth={2}   dot={{ fill: GREEN,  r: 3 }} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Win rate pie */}
                    <Card title="Order Completion Mix">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Closed',     value: stats.closed     },
                                            { name: 'Dispatched', value: stats.dispatched },
                                            { name: 'Pending',    value: stats.pending    },
                                        ].filter(d => d.value > 0)}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={95} paddingAngle={3}
                                        label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}>
                                        <Cell fill={GREEN} />
                                        <Cell fill={CYAN}  />
                                        <Cell fill={AMBER} />
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Health Panel */}
                    <Card title="Fulfilment Health Overview">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Closed Rate',    val: stats.closedRate,   color: GREEN },
                                { label: 'Dispatch Rate',  val: stats.dispatchRate, color: CYAN  },
                                { label: 'Pending Rate',   val: stats.pendingRate,  color: AMBER },
                            ].map(row => (
                                <div key={row.label} className={styles.healthRow}>
                                    <span className={styles.healthLabel}>{row.label}</span>
                                    <div className={styles.healthBar}>
                                        <div className={styles.healthFill} style={{ width: `${row.val}%`, background: row.color }} />
                                    </div>
                                    <span className={styles.healthPct} style={{ color: row.color }}>{row.val}%</span>
                                </div>
                            ))}
                            <div className={styles.insight}>
                                <span>
                                    {stats.closedRate >= 60
                                        ? 'Excellent fulfilment — over 60% orders closed.'
                                        : stats.dispatchRate >= 50
                                        ? 'Good dispatch rate. Focus on closing dispatched orders.'
                                        : 'High pending backlog. Review open orders and expedite dispatch.'}
                                    {' '}Total revenue of <strong>{fmtCurrency(stats.totalRevenue)}</strong> across <strong>{stats.total}</strong> orders.
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Recent 10 orders */}
                    <Card title="Recent Sale Orders" action={<span className={styles.badge}>latest 10</span>}>
                        <div className={styles.summaryTable}>
                            <table>
                                <thead><tr><th>SO No.</th><th>Customer</th><th>Date</th><th>Transporter</th><th>Status</th></tr></thead>
                                <tbody>
                                    {[...saleOrders]
                                        .sort((a, b) => new Date(b.so_date).getTime() - new Date(a.so_date).getTime())
                                        .slice(0, 10)
                                        .map(so => (
                                            <tr key={so.id}>
                                                <td style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>{so.so_no}</td>
                                                <td>{so.customer?.name ?? '—'}</td>
                                                <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: '#6b7280' }}>
                                                    {new Date(so.so_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{so.transporter?.name ?? '—'}</td>
                                                <td>
                                                    <span className={styles.riskPill} style={{
                                                        background: `${STATUS_COLOR[so.status]}22`,
                                                        color: STATUS_COLOR[so.status],
                                                    }}>{so.status}</span>
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
