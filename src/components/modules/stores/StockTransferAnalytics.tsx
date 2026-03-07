'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStockTransfers } from '@/app/actions/stores'
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

export default function StockTransferAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [transfers, setTransfers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getStockTransfers().then(data => {
            setTransfers(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalTransfers = transfers.length
        let totalItemsTransferred = 0
        transfers.forEach(t => {
            totalItemsTransferred += Number(t.qty || 0)
        })
        const averagePerTransfer = totalTransfers > 0 ? totalItemsTransferred / totalTransfers : 0
        return { totalTransfers, totalItemsTransferred, averagePerTransfer }
    }, [transfers])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, number> = {}
        transfers.forEach(t => {
            const m = t.transfer_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [transfers])

    const sourceDist = useMemo(() => {
        const counts: Record<string, number> = {}
        transfers.forEach(t => {
            const name = t.from_warehouse_name || 'Unknown'
            counts[name] = (counts[name] || 0) + Number(t.qty || 0)
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [transfers])

    const destDist = useMemo(() => {
        const counts: Record<string, number> = {}
        transfers.forEach(t => {
            const name = t.to_warehouse_name || 'Unknown'
            counts[name] = (counts[name] || 0) + Number(t.qty || 0)
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [transfers])

    const topItems = useMemo(() => {
        const counts: Record<string, number> = {}
        transfers.forEach(t => {
            const name = t.product_name || 'Unknown Item'
            counts[name] = (counts[name] || 0) + Number(t.qty || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [transfers])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Stock Transfer Analytics</h1>
                    <p className={styles.subtitle}>Analysis of inter-warehouse stock movements</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Stock_Transfer_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/stock-transfer')}>
                        ← Back to Transfers
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Transfer Orders</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalTransfers}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Movement Qty</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalItemsTransferred.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Qty per Order</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.averagePerTransfer.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Transfer Volumes" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Stock Transfers" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Outward Storage (Source) - Qty" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sourceDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {sourceDist.map((e, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Inward Storage (Destination) - Qty" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={destDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {destDist.map((e, i) => <Cell key={i} fill={COLORS[(i + 5) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Most Transferred Items (Qty)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topItems.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Moved Quantity" fill="#facc15" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
