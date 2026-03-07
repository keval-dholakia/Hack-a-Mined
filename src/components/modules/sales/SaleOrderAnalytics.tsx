'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSaleOrdersWithItems } from '@/app/actions/saleOrders'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => {
                const isAmount = p.name.includes('Value') || p.name.includes('Revenue') || p.name.includes('Amount')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isAmount ? `₹${p.value.toLocaleString('en-IN')}` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function SaleOrderAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSaleOrdersWithItems().then(data => {
            setOrders(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalOrders = orders.length
        let totalRevenue = 0
        let Open = 0
        orders.forEach(o => {
            if (o.status === 'Open' || o.status === 'Partial') Open++
            o.items?.forEach((i: any) => {
                totalRevenue += Number(i.quantity || 0) * Number(i.rate || 0)
            })
        })
        return { totalOrders, totalRevenue, Open }
    }, [orders])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, { volume: number, value: number }> = {}
        orders.forEach(o => {
            const m = o.order_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { volume: 0, value: 0 }
            byMonth[m].volume += 1
            o.items?.forEach((i: any) => {
                byMonth[m].value += Number(i.quantity || 0) * Number(i.rate || 0)
            })
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [orders])

    const statusDist = useMemo(() => {
        const counts: Record<string, number> = {}
        orders.forEach(o => {
            const st = o.status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [orders])

    const customerOrders = useMemo(() => {
        const counts: Record<string, number> = {}
        orders.forEach(o => {
            const name = o.customer?.name || 'Unknown'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [orders])

    const topProducts = useMemo(() => {
        const counts: Record<string, number> = {}
        orders.forEach(o => {
            o.items?.forEach((i: any) => {
                const name = i.product?.name || 'Unknown'
                counts[name] = (counts[name] || 0) + Number(i.quantity || 0)
            })
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [orders])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Sale Order Analytics</h1>
                    <p className={styles.subtitle}>Order trends, customer volumes and product demands</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Sale_Order_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/sales/sale-order')}>
                        ← Back to Sale Orders
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Sale Orders</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalOrders}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Confirmed Value</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Pending / Open Orders</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>{stats.Open}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly SO Volume & Value" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar yAxisId="left" dataKey="volume" name="Order Volume" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="value" name="Order Value (₹)" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Customer-wise Orders (Volume)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={customerOrders} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {customerOrders.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="SO Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[(i + 2) % COLORS.length]
                                        if (e.name === 'Closed' || e.name === 'Delivered') color = '#34d399'
                                        if (e.name === 'Open') color = '#22d3ee'
                                        if (e.name === 'Partial') color = '#facc15'
                                        if (e.name === 'Cancelled') color = '#f43f5e'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Products Ordered (Qty)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topProducts.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Ordered Qty" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
