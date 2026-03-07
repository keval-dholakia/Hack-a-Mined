'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getIQCEntries } from '@/app/actions/purchase'
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
                const isRate = p.name.includes('%') || p.name.includes('Rate')
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isRate ? `${p.value.toFixed(2)}%` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function IqcAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getIQCEntries().then(data => {
            setEntries(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalChecks = entries.length
        let totalAccepted = 0
        let totalRejected = 0
        let totalInspected = 0
        entries.forEach(e => {
            totalAccepted += Number(e.accepted_qty || 0)
            totalRejected += Number(e.rejected_qty || 0)
            totalInspected += Number(e.total_qty || 0)
        })
        const acceptRate = totalInspected > 0 ? (totalAccepted / totalInspected) * 100 : 0
        return { totalChecks, totalAccepted, totalRejected, totalInspected, acceptRate }
    }, [entries])

    const inspectionsByMonth = useMemo(() => {
        const byMonth: Record<string, { inspections: number }> = {}
        entries.forEach(e => {
            const m = e.check_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { inspections: 0 }
            byMonth[m].inspections += 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [entries])

    const passedVsRejectedPie = [
        { name: 'Accepted Qty', value: stats.totalAccepted },
        { name: 'Rejected Qty', value: stats.totalRejected }
    ]

    const resultDistribution = useMemo(() => {
        const counts: Record<string, number> = {}
        entries.forEach(e => {
            const r = e.result || 'Unknown'
            counts[r] = (counts[r] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [entries])

    const defectTypes = useMemo(() => {
        let visualFails = 0
        let dimensionFails = 0
        entries.forEach(e => {
            if (e.visual_check === 'Fail') visualFails++
            if (e.dimension_check === 'Fail') dimensionFails++
        })
        return [
            { name: 'Visual Check Failed', value: visualFails },
            { name: 'Dimension Check Failed', value: dimensionFails }
        ]
    }, [entries])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>IQC Analytics</h1>
                    <p className={styles.subtitle}>Inward Quality Control checks, acceptances and defect rates</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'IQC_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/iqc')}>
                        ← Back to IQC
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Quality Checks</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalChecks}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Items Inspected</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.totalInspected.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Overall Acceptance Rate</p>
                    <p className={styles.kpiValue} style={{ color: stats.acceptRate > 95 ? '#34d399' : '#facc15' }}>
                        {stats.acceptRate.toFixed(2)}%
                    </p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Inspections" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inspectionsByMonth} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="inspections" name="Inspection Count" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Accepted vs Rejected Qty" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={passedVsRejectedPie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="IQC Report Statuses" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={resultDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {resultDistribution.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Pass') color = '#34d399'
                                        if (e.name === 'Fail') color = '#f43f5e'
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

                <Card title="Defect Reason Breakdown" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={defectTypes} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Occurrences" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
