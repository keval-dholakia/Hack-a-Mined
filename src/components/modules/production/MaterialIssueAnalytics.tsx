'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMaterialIssues } from '@/app/actions/production'
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
                    {p.name}: <strong>{p.name.includes('Count') ? p.value : p.value.toLocaleString('en-IN')}</strong>
                </p>
            ))}
        </div>
    )
}

export default function MaterialIssueAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [issues, setIssues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMaterialIssues().then(data => {
            setIssues(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalIssues = issues.length
        const totalQtyIssued = issues.reduce((s, i) => s + Number(i.qty_issued || 0), 0)
        return { totalIssues, totalQtyIssued }
    }, [issues])

    const issuesByMonth = useMemo(() => {
        const byMonth: Record<string, number> = {}
        issues.forEach(i => {
            const m = i.issue_date?.substring(0, 7) || 'Unknown'
            byMonth[m] = (byMonth[m] || 0) + 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
    }, [issues])

    const usageByProduct = useMemo(() => {
        const qtyByProd: Record<string, number> = {}
        issues.forEach(i => {
            const prod = i.product?.name || 'Unknown'
            qtyByProd[prod] = (qtyByProd[prod] || 0) + Number(i.qty_issued || 0)
        })
        return Object.entries(qtyByProd)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }))
    }, [issues])

    const topIssuedMaterials = useMemo(() => {
        return usageByProduct.slice(0, 10).map(p => ({
            material: p.name,
            qty: p.value
        }))
    }, [usageByProduct])

    const warehouseUtilization = useMemo(() => {
        const counts: Record<string, number> = {}
        issues.forEach(i => {
            const w = i.warehouse?.name || 'Main Warehouse'
            counts[w] = (counts[w] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [issues])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Material Issue Analytics</h1>
                    <p className={styles.subtitle}>Material consumption tracking, warehouse loads and issue trends</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Material_Issue_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/production/material-issue')}>
                        ← Back to Material Issues
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Material Issues</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalIssues}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Quantity Issued</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalQtyIssued.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Material Usage by Product" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={usageByProduct.slice(0, 10)} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {usageByProduct.slice(0, 10).map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Warehouse Issue Load" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={warehouseUtilization} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {warehouseUtilization.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly Issue Trends" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issuesByMonth} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="count" name="Issue Count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Issued Materials" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topIssuedMaterials.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topIssuedMaterials} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="material" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="qty" name="Quantity Issued" fill="#34d399" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
