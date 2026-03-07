'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBOMsWithItems } from '@/app/actions/production'
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
                    {p.name}: <strong>{p.name.includes('₹') || p.name.includes('Cost') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function BomAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [boms, setBoms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getBOMsWithItems().then(data => {
            setBoms(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalBoms = boms.length
        const totalItems = boms.reduce((s, b) => s + (b.items?.length || 0), 0)
        let totalCost = 0
        boms.forEach(b => {
            b.items?.forEach((i: any) => {
                totalCost += Number(i.quantity) * Number(i.unit_cost || 0)
            })
        })
        const avgCost = totalBoms ? totalCost / totalBoms : 0

        return { totalBoms, totalItems, avgCost }
    }, [boms])

    const bomsByProduct = useMemo(() => {
        const counts: Record<string, number> = {}
        boms.forEach(b => {
            const prod = b.product?.name || 'Unknown'
            counts[prod] = (counts[prod] || 0) + 1
        })
        return Object.entries(counts).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    }, [boms])

    const materialCostDist = useMemo(() => {
        const costByMaterial: Record<string, number> = {}
        boms.forEach(b => {
            b.items?.forEach((item: any) => {
                const mat = item.raw_material?.name || 'Unknown'
                const cost = Number(item.quantity) * Number(item.unit_cost || 0)
                costByMaterial[mat] = (costByMaterial[mat] || 0) + cost
            })
        })
        return Object.entries(costByMaterial).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
    }, [boms])

    const costliestBoms = useMemo(() => {
        return boms.map(b => {
            const cost = (b.items || []).reduce((s: number, i: any) => s + Number(i.quantity) * Number(i.unit_cost || 0), 0)
            return { name: `${b.product?.name || 'Unknown'} (${b.version})`, cost }
        }).sort((a, b) => b.cost - a.cost).slice(0, 10)
    }, [boms])

    const componentCountDist = useMemo(() => {
        const bins: Record<string, number> = { '1-3': 0, '4-6': 0, '7-10': 0, '10+': 0 }
        boms.forEach(b => {
            const c = b.items?.length || 0
            if (c <= 3) bins['1-3']++
            else if (c <= 6) bins['4-6']++
            else if (c <= 10) bins['7-10']++
            else bins['10+']++
        })
        return Object.entries(bins).map(([name, count]) => ({ name, count }))
    }, [boms])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Bill of Materials Analytics</h1>
                    <p className={styles.subtitle}>BOM distribution, cost breakdown and component profiling</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'BOM_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/production/bom')}>
                        ← Back to BOMs
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total BOMs Defined</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalBoms}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Components per BOM</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalBoms ? (stats.totalItems / stats.totalBoms).toFixed(1) : 0}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Material Cost / BOM</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.avgCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Material Cost Distribution (Top 10)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={materialCostDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {materialCostDist.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="BOM Component Count Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={componentCountDist} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Number of BOMs" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Costliest BOMs" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, costliestBoms.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costliestBoms} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="cost" name="Material Cost (₹)" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="BOMs by Product Variants" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bomsByProduct} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Versions/Variations" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
