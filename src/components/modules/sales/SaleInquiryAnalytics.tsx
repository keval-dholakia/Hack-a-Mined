'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getInquiriesWithItems } from '@/app/actions/inquiries'
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
                const val = p.name.includes('Rate') ? `${p.value.toFixed(2)}%` : p.value.toLocaleString('en-IN')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{val}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function SaleInquiryAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [inquiries, setInquiries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInquiriesWithItems().then(data => {
            setInquiries(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalInquiries = inquiries.length
        let Open = 0
        let Converted = 0
        let Lost = 0
        inquiries.forEach(i => {
            if (i.status === 'Open') Open++
            if (i.status === 'Converted') Converted++
            if (i.status === 'Lost') Lost++
        })
        const conversionRate = totalInquiries > 0 ? (Converted / totalInquiries) * 100 : 0
        return { totalInquiries, Open, Converted, Lost, conversionRate }
    }, [inquiries])

    const monthlyVolume = useMemo(() => {
        const byMonth: Record<string, number> = {}
        inquiries.forEach(i => {
            const m = i.entry_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, volume]) => ({ month, volume }))
    }, [inquiries])

    const statusDistribution = useMemo(() => {
        return [
            { name: 'Open', value: stats.Open },
            { name: 'Converted', value: stats.Converted },
            { name: 'Lost', value: stats.Lost }
        ].filter(d => d.value > 0)
    }, [stats])

    const customerInquiries = useMemo(() => {
        const counts: Record<string, number> = {}
        inquiries.forEach(i => {
            const name = i.customer?.name || 'Unknown'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [inquiries])

    const productInterest = useMemo(() => {
        const counts: Record<string, number> = {}
        inquiries.forEach(i => {
            i.items?.forEach((item: any) => {
                const p = item.product?.name || 'Unknown'
                counts[p] = (counts[p] || 0) + 1
            })
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [inquiries])

    const conversionFunnel = useMemo(() => {
        return [
            { stage: 'Total Inquiries', count: stats.totalInquiries },
            { stage: 'Converted', count: stats.Converted }
        ]
    }, [stats])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Sales Inquiry Analytics</h1>
                    <p className={styles.subtitle}>Lead generation, customer interests and conversion rates</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Sales_Inquiry_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/sales/inquiry')}>
                        ← Back to Inquiries
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Inquiries</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalInquiries}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Open Lead Pipeline</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.Open.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Conversion Rate</p>
                    <p className={styles.kpiValue} style={{ color: stats.conversionRate > 20 ? '#34d399' : '#facc15' }}>
                        {stats.conversionRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Inquiry Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyVolume} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="monotone" dataKey="volume" name="Inquiry Count" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Inquiry Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDistribution.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Converted') color = '#34d399'
                                        if (e.name === 'Lost') color = '#f43f5e'
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

                <Card title="Conversion Funnel" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={conversionFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="stage" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Count" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20}>
                                    {conversionFunnel.map((e, i) => <Cell key={i} fill={i === 0 ? '#6366f1' : '#34d399'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Customer-wise Inquiries (Top 10)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, customerInquiries.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerInquiries} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Total Inquiries" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Product Interest Heatmap (Mentions)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, productInterest.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productInterest} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Mentions in Inquiries" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
