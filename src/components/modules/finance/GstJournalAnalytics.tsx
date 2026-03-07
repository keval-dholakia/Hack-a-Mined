'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Voucher, Account } from '@/data/financeMock'
import { fetchVouchers, fetchAccounts } from '@/data/financeMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
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
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') || p.name.includes('Trend') || p.name.includes('Type') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function GstJournalAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVouchers('GST').then(vs => {
            setVouchers(vs)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalEntries = vouchers.length
        const totalAmount = vouchers.reduce((s, v) => s + v.totalAmount, 0)
        return { totalEntries, totalAmount }
    }, [vouchers])

    const typeDistribution = useMemo(() => {
        const counts: Record<string, number> = {}
        vouchers.forEach(v => {
            const t = v.gstAdjustmentType || 'Other'
            counts[t] = (counts[t] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [vouchers])

    const amountByType = useMemo(() => {
        const amts: Record<string, number> = {}
        vouchers.forEach(v => {
            const t = v.gstAdjustmentType || 'Other'
            amts[t] = (amts[t] || 0) + v.totalAmount
        })
        return Object.entries(amts).map(([type, amount]) => ({ type, amount }))
            .sort((a, b) => b.amount - a.amount)
    }, [vouchers])

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        vouchers.forEach(v => {
            const m = v.date.substring(0, 7)
            byMonth[m] = (byMonth[m] || 0) + v.totalAmount
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [vouchers])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>GST Journal Analytics</h1>
                    <p className={styles.subtitle}>Tax adjustments, ITC reversals and output claims</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'GST_Journal_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/gst-journal')}>
                        ← Back to GST Journals
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total GST Journals</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalEntries}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Adjusted Value</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Adjustment Type Distribution (Count)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={typeDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {typeDistribution.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Adjustment Value by Type (₹)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={amountByType} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="type" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="amount" name="Adjusted Amount (₹)" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly GST Adjustment Trend (Value)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="amount" name="Trend (₹)" fill="#facc15" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
