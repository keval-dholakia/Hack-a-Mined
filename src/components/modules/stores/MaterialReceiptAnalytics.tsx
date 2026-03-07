'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMaterialReceipts } from '@/app/actions/stores'
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

export default function MaterialReceiptAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [receipts, setReceipts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMaterialReceipts().then(data => {
            setReceipts(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalReceipts = receipts.length
        let totalItemsReceived = 0
        receipts.forEach(r => {
            totalItemsReceived += Number(r.qty_received || 0)
        })
        const averagePerReceipt = totalReceipts > 0 ? totalItemsReceived / totalReceipts : 0
        return { totalReceipts, totalItemsReceived, averagePerReceipt }
    }, [receipts])

    const monthlyTrend = useMemo(() => {
        const byMonth: Record<string, number> = {}
        receipts.forEach(r => {
            const m = r.receipt_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [receipts])

    const warehouseDist = useMemo(() => {
        const counts: Record<string, number> = {}
        receipts.forEach(r => {
            const name = r.warehouse_name || 'Unknown Warehouse'
            counts[name] = (counts[name] || 0) + Number(r.qty_received || 0)
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [receipts])

    const docRefSources = useMemo(() => {
        const counts: Record<string, number> = {}
        receipts.forEach(r => {
            const prefix = (r.source_doc_ref || 'None').split('-')[0] || 'Misc'
            counts[prefix] = (counts[prefix] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [receipts])

    const topItems = useMemo(() => {
        const counts: Record<string, number> = {}
        receipts.forEach(r => {
            const name = r.product_name || 'Unknown Item'
            counts[name] = (counts[name] || 0) + Number(r.qty_received || 0)
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [receipts])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Material Receipt Analytics</h1>
                    <p className={styles.subtitle}>Analyzing warehouse inward movements and source documents</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Material_Receipt_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/material-receipt')}>
                        ← Back to Material Receipts
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Receipt Entries</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalReceipts}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Quantity Received</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalItemsReceived.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Qty per Receipt</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>{stats.averagePerReceipt.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Receipt Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Receipt Count" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Inward by Warehouse (Qty)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={warehouseDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {warehouseDist.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Document Source Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={docRefSources} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {docRefSources.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Received Items (Qty)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topItems.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topItems} layout="vertical" margin={{ top: 10, right: 30, left: 150, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Qty Received" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
