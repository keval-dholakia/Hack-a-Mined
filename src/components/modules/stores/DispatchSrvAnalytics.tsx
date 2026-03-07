'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDispatchSRVs } from '@/app/actions/stores'
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
                const isAmount = false
                return (
                    <p key={i} style={{ color: p.color ?? ACCENT }}>
                        {p.name}: <strong>{isAmount ? `₹${p.value.toLocaleString('en-IN')}` : p.value.toLocaleString('en-IN')}</strong>
                    </p>
                )
            })}
        </div>
    )
}

export default function DispatchSrvAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [srvs, setSrvs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDispatchSRVs().then(data => {
            setSrvs(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalDispatches = srvs.length
        let returnableGated = 0
        let totalItemsDispatched = 0
        srvs.forEach(s => {
            if (s.returnable === 1) returnableGated++
            totalItemsDispatched += Number(s.qty || 0)
        })
        return { totalDispatches, returnableGated, totalItemsDispatched }
    }, [srvs])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, number> = {}
        srvs.forEach(s => {
            const m = s.srv_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [srvs])

    const returnableDist = useMemo(() => {
        const returnableCount = srvs.filter(s => s.returnable === 1).length
        const nonReturnableCount = srvs.length - returnableCount
        return [
            { name: 'Returnable Gate Pass', value: returnableCount },
            { name: 'Non-Returnable', value: nonReturnableCount }
        ].filter(d => d.value > 0)
    }, [srvs])

    const partyWise = useMemo(() => {
        const counts: Record<string, number> = {}
        srvs.forEach(s => {
            const name = s.party_name || 'Unknown Internal/External'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [srvs])

    const topItems = useMemo(() => {
        const counts: Record<string, number> = {}
        srvs.forEach(s => {
            const name = s.product_name || 'Unknown'
            counts[name] = (counts[name] || 0) + Number(s.qty || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [srvs])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Dispatch SRV Analytics</h1>
                    <p className={styles.subtitle}>Material dispatch, gate passes, and return tracking</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Dispatch_SRV_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/dispatch-srv')}>
                        ← Back to Dispatch SRVs
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total SRVs Generated</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalDispatches}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Quantity Dispatched</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalItemsDispatched.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Pending Returns (Returnable)</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>{stats.returnableGated}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Dispatch Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Dispatches" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Returnable vs Non-Returnable" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={returnableDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {returnableDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Returnable Gate Pass') color = '#facc15'
                                        if (e.name === 'Non-Returnable') color = '#22d3ee'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Dispatched Items (Qty)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Total Dispatched Qty" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Parties Receiving Material" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, partyWise.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={partyWise} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Volumes" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
