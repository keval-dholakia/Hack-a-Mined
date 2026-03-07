'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRouteCards } from '@/app/actions/production'
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
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('Count') ? p.value : p.value.toLocaleString('en-IN')}</strong>
                </p>
            ))}
        </div>
    )
}

export default function RouteCardAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [routeCards, setRouteCards] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRouteCards().then(data => {
            setRouteCards(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalCards = routeCards.length
        let totalPlan = 0
        let totalProduced = 0
        routeCards.forEach(rc => {
            totalPlan += Number(rc.plan_qty || 0)
            totalProduced += Number(rc.produced_qty || 0)
        })
        const completionRate = totalPlan > 0 ? (totalProduced / totalPlan) * 100 : 0
        return { totalCards, totalPlan, totalProduced, completionRate }
    }, [routeCards])

    const statusDist = useMemo(() => {
        const counts: Record<string, number> = {}
        routeCards.forEach(rc => {
            const st = rc.status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [routeCards])

    const cardsByProduct = useMemo(() => {
        const counts: Record<string, number> = {}
        routeCards.forEach(rc => {
            const p = rc.product?.name || 'Unknown'
            counts[p] = (counts[p] || 0) + 1
        })
        return Object.entries(counts).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    }, [routeCards])

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        routeCards.forEach(rc => {
            // fallback to created_at if start_date is missing
            const dateStr = rc.start_date || rc.created_at || ''
            if (!dateStr) return
            const m = dateStr.substring(0, 7)
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [routeCards])

    const completionByProduct = useMemo(() => {
        const prodData: Record<string, { plan: number, produced: number }> = {}
        routeCards.forEach(rc => {
            const p = rc.product?.name || 'Unknown'
            if (!prodData[p]) prodData[p] = { plan: 0, produced: 0 }
            prodData[p].plan += Number(rc.plan_qty || 0)
            prodData[p].produced += Number(rc.produced_qty || 0)
        })
        return Object.entries(prodData)
            .sort((a, b) => b[1].plan - a[1].plan)
            .slice(0, 10)
            .map(([name, data]) => ({ name, ...data }))
    }, [routeCards])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Route Card Analytics</h1>
                    <p className={styles.subtitle}>Production job tracking, statuses and completion rates</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Route_Card_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/production/route-card')}>
                        ← Back to Route Cards
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Route Cards</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalCards}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Planned Qty</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.totalPlan.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Overall Completion Rate</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.completionRate.toFixed(2)}%</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Route Card Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Closed') color = '#34d399'
                                        if (e.name === 'Open') color = '#facc15'
                                        if (e.name === 'In Progress') color = '#22d3ee'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="New Route Cards per Month" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="stepAfter" dataKey="count" name="Cards Opened" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Route Cards by Product (Top 10)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cardsByProduct} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Route Cards" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Production Completion vs Plan (Top 10 Products)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, completionByProduct.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={completionByProduct} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="plan" name="Planned Qty" fill="#1f2937" radius={[0, 0, 0, 0]} barSize={16} />
                                <Bar dataKey="produced" name="Produced Qty" fill="#34d399" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
