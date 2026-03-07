'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProductionReports } from '@/app/actions/production'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => {
                const isRate = p.name.toLowerCase().includes('rate') || p.name.includes('%')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isRate ? `${p.value.toFixed(2)}%` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function ProductionAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProductionReports().then(data => {
            setReports(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        let produced = 0
        let rejected = 0
        reports.forEach(r => {
            produced += Number(r.production_qty || 0)
            rejected += Number(r.rejection_qty || 0)
        })
        const total = produced + rejected
        const yieldRate = total > 0 ? (produced / total) * 100 : 0
        const defectRate = total > 0 ? (rejected / total) * 100 : 0

        return { produced, rejected, yieldRate, defectRate }
    }, [reports])

    const monthlyTrendData = useMemo(() => {
        const byMonth: Record<string, { produced: number, rejected: number }> = {}
        reports.forEach(r => {
            const m = r.report_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { produced: 0, rejected: 0 }
            byMonth[m].produced += Number(r.production_qty || 0)
            byMonth[m].rejected += Number(r.rejection_qty || 0)
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => {
                const total = data.produced + data.rejected
                const yieldRate = total > 0 ? (data.produced / total) * 100 : 0
                return { month, ...data, yieldRate }
            })
    }, [reports])

    const productOutput = useMemo(() => {
        const prodData: Record<string, { produced: number, rejected: number }> = {}
        reports.forEach(r => {
            const prod = r.product?.name || 'Unknown'
            if (!prodData[prod]) prodData[prod] = { produced: 0, rejected: 0 }
            prodData[prod].produced += Number(r.production_qty || 0)
            prodData[prod].rejected += Number(r.rejection_qty || 0)
        })
        return Object.entries(prodData)
            .sort((a, b) => b[1].produced - a[1].produced)
            .slice(0, 10)
            .map(([name, data]) => {
                const total = data.produced + data.rejected
                const defectRate = total > 0 ? (data.rejected / total) * 100 : 0
                return { name, ...data, defectRate }
            })
    }, [reports])

    const shiftData = useMemo(() => {
        const shData: Record<string, { produced: number, rejected: number }> = {}
        reports.forEach(r => {
            const sh = r.shift || 'Unknown'
            if (!shData[sh]) shData[sh] = { produced: 0, rejected: 0 }
            shData[sh].produced += Number(r.production_qty || 0)
            shData[sh].rejected += Number(r.rejection_qty || 0)
        })
        return Object.entries(shData).map(([shift, data]) => ({ shift, ...data }))
    }, [reports])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Production Analytics</h1>
                    <p className={styles.subtitle}>Output volumes, yield quality and shift efficiency</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Production_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/production/report')}>
                        ← Back to Reports
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Produced Quantity</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.produced.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Overall Yield Rate</p>
                    <p className={styles.kpiValue} style={{ color: stats.yieldRate > 95 ? '#34d399' : '#facc15' }}>{stats.yieldRate.toFixed(2)}%</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Overall Defect Rate</p>
                    <p className={styles.kpiValue} style={{ color: stats.defectRate < 5 ? '#34d399' : '#f43f5e' }}>{stats.defectRate.toFixed(2)}%</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Production Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="left" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar yAxisId="left" dataKey="produced" name="Produced Qty" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar yAxisId="left" dataKey="rejected" name="Rejected Qty" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="yieldRate" name="Yield Rate (%)" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Product-wise Output (Top 10)" noPad>
                    <div style={{ height: Math.max(300, productOutput.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productOutput} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="produced" name="Produced" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={20} />
                                <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Defect Rate Analysis by Product" noPad>
                    <div style={{ height: Math.max(300, productOutput.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productOutput.sort((a, b) => b.defectRate - a.defectRate)} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="defectRate" name="Defect Rate (%)" fill="#facc15" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Shift-wise Production" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shiftData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="shift" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="produced" name="Produced" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={40} />
                                <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
