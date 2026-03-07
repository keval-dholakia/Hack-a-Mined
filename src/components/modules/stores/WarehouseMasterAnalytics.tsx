'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getWarehouses } from '@/app/actions/warehouses'
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

export default function WarehouseMasterAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [warehouses, setWarehouses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getWarehouses().then(data => {
            setWarehouses(data || [])
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalWarehouses = warehouses.length
        const activeWarehouses = warehouses.filter(w => w.is_active === 1).length
        const inactiveWarehouses = totalWarehouses - activeWarehouses
        return { totalWarehouses, activeWarehouses, inactiveWarehouses }
    }, [warehouses])

    const cityDist = useMemo(() => {
        const counts: Record<string, number> = {}
        warehouses.forEach(w => {
            const name = w.city || 'Unknown City'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [warehouses])

    const stateDist = useMemo(() => {
        const counts: Record<string, number> = {}
        warehouses.forEach(w => {
            const name = w.state || 'Unknown State'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [warehouses])

    const statusDist = useMemo(() => [
        { name: 'Active', value: stats.activeWarehouses },
        { name: 'Inactive', value: stats.inactiveWarehouses }
    ].filter(s => s.value > 0), [stats])

    const managerDist = useMemo(() => {
        const counts: Record<string, number> = {}
        warehouses.forEach(w => {
            const name = w.manager_name || 'No Manager Assigned'
            counts[name] = (counts[name] || 0) + 1
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }))
    }, [warehouses])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Warehouse Directory Analytics</h1>
                    <p className={styles.subtitle}>Analysis of storage locations and facility management</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Warehouse_Master_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/warehouse-master')}>
                        ← Back to Directory
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Setup Facilities</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalWarehouses}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Active Operating Facilities</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.activeWarehouses}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Inactive / Closed set-ups</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>{stats.inactiveWarehouses}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Warehouse Coverage by City" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cityDist} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Facilities" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="State-wise Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stateDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {stateDist.map((e, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Operating Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Active') color = '#34d399'
                                        if (e.name === 'Inactive') color = '#facc15'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Management Assignment (Top 5)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, managerDist.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={managerDist} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Facilities Managed" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
