'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Voucher, Account } from '@/data/financeMock'
import { fetchVouchers, fetchAccounts } from '@/data/financeMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const TYPE_COLORS: Record<string, string> = { 'Receipt': '#34d399', 'Payment': '#f43f5e' }
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') || p.name.includes('Flow') || p.name.includes('Volume') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function PaymentReceiptAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchVouchers('Payment'), fetchVouchers('Receipt')]).then(([pvs, rvs]) => {
            setVouchers([...pvs, ...rvs])
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalPayments = vouchers.filter(v => v.type === 'Payment').reduce((s, v) => s + v.totalAmount, 0)
        const totalReceipts = vouchers.filter(v => v.type === 'Receipt').reduce((s, v) => s + v.totalAmount, 0)
        const netCashflow = totalReceipts - totalPayments
        return { totalPayments, totalReceipts, netCashflow, count: vouchers.length }
    }, [vouchers])

    const typeData = [
        { name: 'Receipt', value: stats.totalReceipts },
        { name: 'Payment', value: stats.totalPayments }
    ]

    const modeData = useMemo(() => {
        const counts: Record<string, number> = {}
        vouchers.forEach(v => counts[v.mode || 'Unknown'] = (counts[v.mode || 'Unknown'] || 0) + 1)
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [vouchers])

    const trendData = useMemo(() => {
        const byMonth: Record<string, { Receipt: number, Payment: number }> = {}
        vouchers.forEach(v => {
            const m = v.date.substring(0, 7)
            if (!byMonth[m]) byMonth[m] = { Receipt: 0, Payment: 0 }
            byMonth[m][v.type as 'Receipt' | 'Payment'] += v.totalAmount
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [vouchers])

    const topParties = useMemo(() => {
        const flows: Record<string, { receipt: number, payment: number, total: number }> = {}
        vouchers.forEach(v => {
            const party = v.partyName || 'Unknown'
            if (!flows[party]) flows[party] = { receipt: 0, payment: 0, total: 0 }
            if (v.type === 'Receipt') flows[party].receipt += v.totalAmount
            if (v.type === 'Payment') flows[party].payment += v.totalAmount
            flows[party].total += v.totalAmount
        })
        return Object.entries(flows)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 10)
            .map(([party, data]) => ({ party, ...data }))
    }, [vouchers])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Payment & Receipt Analytics</h1>
                    <p className={styles.subtitle}>Cashflow tracking, volumes & party balances</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Payment_Receipt_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/payment-receipt')}>
                        ← Back to Transactions
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Receipts</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalReceipts.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Payments</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.totalPayments.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Net Cashflow</p>
                    <p className={styles.kpiValue} style={{ color: stats.netCashflow >= 0 ? '#34d399' : '#f43f5e' }}>₹{stats.netCashflow.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Payment vs Receipt Volume" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={typeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Transaction Mode Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={modeData} outerRadius={80} dataKey="value">
                                    {modeData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly Cashflow Trend" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Area type="monotone" dataKey="Receipt" name="Receipts (₹)" fill="#34d399" stroke="none" fillOpacity={0.2} />
                                <Line type="monotone" dataKey="Payment" name="Payments (₹)" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Parties by Transaction Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topParties.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topParties} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="party" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="receipt" name="Receipts (₹)" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={16} />
                                <Bar dataKey="payment" name="Payments (₹)" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
