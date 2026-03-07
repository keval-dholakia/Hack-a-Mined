'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorPayment } from '@/data/contractorMock'
import { contractorFirms } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { payments: ContractorPayment[] }

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function PaymentAnalytics({ payments }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const total = payments.length
        const totalPaid = payments.reduce((s, p) => s + p.netAmountPaid, 0)
        const totalTds = payments.reduce((s, p) => s + p.tdsDeducted, 0)
        return { total, totalPaid, totalTds }
    }, [payments])

    const firmData = useMemo(() => {
        const amounts: Record<string, number> = {}
        payments.forEach(p => {
            const fName = contractorFirms.find(f => f.id === p.firmId)?.name || 'Unknown'
            amounts[fName] = (amounts[fName] || 0) + p.netAmountPaid
        })
        return Object.entries(amounts).map(([name, value]) => ({ name, value }))
    }, [payments])

    const modeData = useMemo(() => {
        const counts: Record<string, number> = {}
        payments.forEach(p => counts[p.paymentMode] = (counts[p.paymentMode] || 0) + 1)
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [payments])

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        payments.forEach(p => {
            const m = p.date.substring(0, 7) // YYYY-MM
            byMonth[m] = (byMonth[m] || 0) + p.netAmountPaid
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [payments])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contractor Payment Analytics</h1>
                    <p className={styles.subtitle}>Payment flows, modes & TDS deductions</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Payment_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/payments')}>
                        ← Back to Payments
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Vouchers</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.total}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Net Paid</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalPaid.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total TDS Withheld</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>₹{stats.totalTds.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Payments by Firm (Amount)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={firmData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {firmData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Payment Mode Distribution" noPad>
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

                <Card title="Monthly Payment Trend" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="monotone" dataKey="amount" name="Amount Paid" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
