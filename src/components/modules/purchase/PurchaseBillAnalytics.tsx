'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPurchaseBills } from '@/app/actions/purchase'
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
            {payload.map((p: any, i: number) => {
                const isAmount = p.name.includes('Amount') || p.name.includes('Value') || p.name.includes('Liability')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isAmount ? `₹${p.value.toLocaleString('en-IN')}` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function PurchaseBillAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [bills, setBills] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getPurchaseBills().then(data => {
            setBills(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        let totalLiability = 0
        let totalPaid = 0
        let totalUnpaid = 0
        bills.forEach(b => {
            const t = Number(b.total || 0)
            totalLiability += t
            if (b.payment_status === 'Paid') {
                totalPaid += t
            } else if (b.payment_status === 'Unpaid') {
                totalUnpaid += t
            } else if (b.payment_status === 'Partial') {
                // Approximate: put half in each, or just count mostly unpaid. We can use accurate tracking if payments exist.
                // Without payments mapping, just add to Unpaid to be safe about liabilities.
                totalUnpaid += t
            }
        })
        return { totalLiability, totalPaid, totalUnpaid }
    }, [bills])

    const liabilityByMonth = useMemo(() => {
        const byMonth: Record<string, { liability: number }> = {}
        bills.forEach(b => {
            const m = b.invoice_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { liability: 0 }
            byMonth[m].liability += Number(b.total || 0)
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [bills])

    const taxVsTaxablePie = useMemo(() => {
        let taxable = 0
        let tax = 0
        bills.forEach(b => {
            taxable += Number(b.taxable_value || 0)
            tax += Number(b.gst_amount || 0)
        })
        return [
            { name: 'Taxable Value', value: taxable },
            { name: 'GST Amount', value: tax }
        ]
    }, [bills])

    const liabilityByVendor = useMemo(() => {
        const vendorData: Record<string, number> = {}
        bills.forEach(b => {
            const v = b.vendor?.name || 'Unknown'
            vendorData[v] = (vendorData[v] || 0) + Number(b.total || 0)
        })
        return Object.entries(vendorData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [bills])

    const paymentStatusDistribution = useMemo(() => {
        const counts: Record<string, number> = {}
        bills.forEach(b => {
            const st = b.payment_status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [bills])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Purchase Bill Analytics</h1>
                    <p className={styles.subtitle}>Vendor liabilities, taxation and payment statuses</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Purchase_Bill_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/billbook')}>
                        ← Back to Billbook
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Liability</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>₹{stats.totalLiability.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Unpaid/Pending</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.totalUnpaid.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Paid</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalPaid.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Liability Added per Month" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={liabilityByMonth} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="liability" name="Liability Additions" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Taxable Value vs GST Tax" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={taxVsTaxablePie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#22d3ee" />
                                    <Cell fill="#f472b6" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Payment Status Breakdown (Count)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={paymentStatusDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {paymentStatusDistribution.map((e, i) => {
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

                <Card title="Top Vendors by Liability" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, liabilityByVendor.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={liabilityByVendor} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Total Liability Value" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
