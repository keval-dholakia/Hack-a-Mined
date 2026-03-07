'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPurchaseOrdersWithItems } from '@/app/actions/purchase'
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
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('Count') || p.name.includes('Items') || p.name.includes('Volume') ? p.value : `₹${p.value.toLocaleString('en-IN')}`}</strong>
                </p>
            ))}
        </div>
    )
}

export default function POAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getPurchaseOrdersWithItems().then(data => {
            setOrders(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalOrders = orders.length
        let totalValue = 0
        orders.forEach(o => {
            o.items?.forEach((i: any) => {
                totalValue += Number(i.quantity) * Number(i.unit_price)
            })
        })
        return { totalOrders, totalValue }
    }, [orders])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, { volume: number, value: number }> = {}
        orders.forEach(o => {
            const m = o.po_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { volume: 0, value: 0 }
            byMonth[m].volume += 1
            o.items?.forEach((i: any) => {
                byMonth[m].value += Number(i.quantity) * Number(i.unit_price)
            })
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [orders])

    const topVendors = useMemo(() => {
        const venData: Record<string, number> = {}
        orders.forEach(o => {
            const v = o.vendor?.name || 'Unknown'
            let val = 0
            o.items?.forEach((i: any) => {
                val += Number(i.quantity) * Number(i.unit_price)
            })
            venData[v] = (venData[v] || 0) + val
        })
        return Object.entries(venData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [orders])

    const statusDist = useMemo(() => {
        const counts: Record<string, number> = {}
        orders.forEach(o => {
            const st = o.status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [orders])

    const itemSpend = useMemo(() => {
        const itemData: Record<string, number> = {}
        orders.forEach(o => {
            o.items?.forEach((i: any) => {
                const p = i.product?.name || 'Unknown'
                const val = Number(i.quantity) * Number(i.unit_price)
                itemData[p] = (itemData[p] || 0) + val
            })
        })
        return Object.entries(itemData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [orders])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Purchase Order Analytics</h1>
                    <p className={styles.subtitle}>Procurement spend, vendor performance and ordering trends</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Purchase_Order_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/po')}>
                        ← Back to Purchase Orders
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Purchase Orders</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalOrders}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Procurement Value</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalValue.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly PO Volume & Value" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar yAxisId="left" dataKey="volume" name="PO Volume" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="value" name="Value (₹)" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="PO Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Received') color = '#34d399'
                                        if (e.name === 'Cancelled') color = '#f43f5e'
                                        if (e.name === 'Partial') color = '#facc15'
                                        if (e.name === 'Open') color = '#22d3ee'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Item-wise Spend Breakdown" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={itemSpend} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {itemSpend.map((e, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Vendors by Value" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topVendors.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topVendors} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Value (₹)" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
