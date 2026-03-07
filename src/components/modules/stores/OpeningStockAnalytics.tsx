'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOpeningStocks } from '@/app/actions/stores'
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

export default function OpeningStockAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [stocks, setStocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOpeningStocks().then(data => {
            setStocks(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalEntries = stocks.length
        let totalQty = 0
        stocks.forEach(s => {
            totalQty += Number(s.opening_qty || 0)
        })
        const averageQty = totalEntries > 0 ? totalQty / totalEntries : 0
        return { totalEntries, totalQty, averageQty }
    }, [stocks])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, number> = {}
        stocks.forEach(s => {
            const m = s.opening_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [stocks])

    const warehouseDist = useMemo(() => {
        const counts: Record<string, number> = {}
        stocks.forEach(s => {
            const name = s.warehouse_name || 'Unknown Warehouse'
            counts[name] = (counts[name] || 0) + Number(s.opening_qty || 0)
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [stocks])

    const topItems = useMemo(() => {
        const counts: Record<string, number> = {}
        stocks.forEach(s => {
            const name = s.product_name || 'Unknown Item'
            counts[name] = (counts[name] || 0) + Number(s.opening_qty || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [stocks])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Opening Stock Analytics</h1>
                    <p className={styles.subtitle}>Analysis of initial warehouse inventory loading</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Opening_Stock_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/opening-stock')}>
                        ← Back to Opening Stock
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Stock Entries</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalEntries}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Items Base Qty</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalQty.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Qty per Entry</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.averageQty.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Opening Stock Entry Volume (Timeline)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Line type="monotone" dataKey="count" name="Entries Registered" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Opening Quantities by Warehouse" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={warehouseDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {warehouseDist.map((e, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Largest Initial Item Stocks (Qty)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Opening Quantity" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
