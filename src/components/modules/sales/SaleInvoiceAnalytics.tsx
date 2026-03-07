'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getInvoicesWithItems } from '@/app/actions/invoices'
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
                const isAmount = p.name.includes('Amount') || p.name.includes('Value') || p.name.includes('Revenue')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isAmount ? `₹${p.value.toLocaleString('en-IN')}` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function SaleInvoiceAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInvoicesWithItems().then(data => {
            setInvoices(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalInvoices = invoices.length
        let totalRevenue = 0
        let totalCollected = 0
        let totalPending = 0
        invoices.forEach(i => {
            const t = Number(i.total || 0)
            totalRevenue += t
            if (i.payment_status === 'Paid') {
                totalCollected += t
            } else {
                totalPending += t
            }
        })
        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0
        return { totalInvoices, totalRevenue, totalCollected, totalPending, collectionRate }
    }, [invoices])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, { revenue: number, tax: number }> = {}
        invoices.forEach(i => {
            const m = i.invoice_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { revenue: 0, tax: 0 }
            byMonth[m].revenue += Number(i.total || 0)
            byMonth[m].tax += Number(i.gst_amount || 0)
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [invoices])

    const statusDist = useMemo(() => {
        const counts: Record<string, number> = {}
        invoices.forEach(i => {
            const st = i.payment_status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [invoices])

    const customerRevenue = useMemo(() => {
        const counts: Record<string, number> = {}
        invoices.forEach(i => {
            const name = i.customer?.name || 'Unknown'
            counts[name] = (counts[name] || 0) + Number(i.total || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [invoices])

    const productContribution = useMemo(() => {
        const counts: Record<string, number> = {}
        invoices.forEach(inv => {
            inv.items?.forEach((i: any) => {
                const name = i.product?.name || 'Unknown'
                const val = Number(i.quantity || 0) * Number(i.rate || 0)
                counts[name] = (counts[name] || 0) + val
            })
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [invoices])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Sale Invoice Analytics</h1>
                    <p className={styles.subtitle}>Revenue reporting, tax collection and product contribution</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Sale_Invoice_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/sales/invoice')}>
                        ← Back to Invoices
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Generated Revenue</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Pending Receivables</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.totalPending.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Amount Collected</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Revenue & Tax" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar yAxisId="left" dataKey="revenue" name="Total Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="tax" name="GST Tax Amount" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Product Revenue Contribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={productContribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {productContribution.map((e, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Payment Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Paid') color = '#34d399'
                                        if (e.name === 'Unpaid') color = '#f43f5e'
                                        if (e.name === 'Partial') color = '#facc15'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Customers by Revenue" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, customerRevenue.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerRevenue} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Total Revenue" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
