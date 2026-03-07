'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getReceiptVouchers } from '@/app/actions/receiptVouchers'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line
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
                const isAmount = p.name.includes('Amount') || p.name.includes('Value') || p.name.includes('Collected')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isAmount ? `₹${p.value.toLocaleString('en-IN')}` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function ReceiptVoucherAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [vouchers, setVouchers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getReceiptVouchers().then(data => {
            setVouchers(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalReceipts = vouchers.length
        let totalCollected = 0
        vouchers.forEach(v => {
            totalCollected += Number(v.amount || 0)
        })
        const averageCollection = totalReceipts > 0 ? totalCollected / totalReceipts : 0
        return { totalReceipts, totalCollected, averageCollection }
    }, [vouchers])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, number> = {}
        vouchers.forEach(v => {
            const m = v.receipt_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + Number(v.amount || 0)
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [vouchers])

    const modeDist = useMemo(() => {
        const counts: Record<string, number> = {}
        vouchers.forEach(v => {
            const m = v.mode || 'Unknown'
            counts[m] = (counts[m] || 0) + Number(v.amount || 0)
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [vouchers])

    const customerCollections = useMemo(() => {
        const counts: Record<string, number> = {}
        vouchers.forEach(v => {
            const name = v.customer?.name || 'Unknown'
            counts[name] = (counts[name] || 0) + Number(v.amount || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [vouchers])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Collections & Receipts Analytics</h1>
                    <p className={styles.subtitle}>Payment collections, modes and customer remitting trends</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Collections_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/sales/collections')}>
                        ← Back to Collections
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Receipts Count</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalReceipts}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Amount Collected</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalCollected.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Collection Value</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>₹{stats.averageCollection.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Collection Trend" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Line type="monotone" dataKey="amount" name="Collected Amount (₹)" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Collection by Payment Mode" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={modeDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {modeDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Cash') color = '#34d399'
                                        if (e.name === 'NEFT') color = '#22d3ee'
                                        if (e.name === 'UPI') color = '#6366f1'
                                        if (e.name === 'Cheque') color = '#facc15'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Paying Customers" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, customerCollections.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerCollections} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Amount Collected" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
