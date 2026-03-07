'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getGRNsWithItems } from '@/app/actions/purchase'
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
                    {p.name}: <strong>{p.name.includes('Count') || p.name.includes('Volume') ? p.value : p.value.toLocaleString('en-IN')}</strong>
                </p>
            ))}
        </div>
    )
}

export default function GrnAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [grns, setGrns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getGRNsWithItems().then(data => {
            setGrns(data)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalGrns = grns.length
        let totalItemsReceived = 0
        grns.forEach(g => {
            g.items?.forEach((i: any) => {
                totalItemsReceived += Number(i.received_qty || 0)
            })
        })
        return { totalGrns, totalItemsReceived }
    }, [grns])

    const monthlyVolume = useMemo(() => {
        const byMonth: Record<string, { volume: number }> = {}
        grns.forEach(g => {
            const m = g.gate_entry_date?.substring(0, 7) || 'Unknown'
            if (!byMonth[m]) byMonth[m] = { volume: 0 }
            byMonth[m].volume += 1
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({ month, ...data }))
    }, [grns])

    const vendorReceiving = useMemo(() => {
        const venData: Record<string, number> = {}
        grns.forEach(g => {
            const v = g.vendor?.name || 'Unknown'
            let val = 0
            g.items?.forEach((i: any) => {
                val += Number(i.received_qty || 0)
            })
            venData[v] = (venData[v] || 0) + val
        })
        return Object.entries(venData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }))
    }, [grns])

    const statusDist = useMemo(() => {
        const counts: Record<string, number> = {}
        grns.forEach(g => {
            const st = g.status || 'Unknown'
            counts[st] = (counts[st] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [grns])

    const orderedVsReceived = useMemo(() => {
        // Group by product name
        const prodData: Record<string, { ordered: number, received: number }> = {}
        grns.forEach(g => {
            // For received, we just take the grn_items
            g.items?.forEach((i: any) => {
                const name = i.product?.name || 'Unknown'
                if (!prodData[name]) prodData[name] = { ordered: 0, received: 0 }
                prodData[name].received += Number(i.received_qty || 0)
            })

            // To approximate ordered, we need to know the PO items.
            // Wait, we don't have PO items product detail in getGRNsWithItems, only quantities.
            // Let's just group by PO instead.
        })

        const poData: Record<string, { ordered: number, received: number }> = {}
        grns.forEach(g => {
            const po = g.purchase_order?.po_no || 'Unknown'
            if (!poData[po]) poData[po] = { ordered: 0, received: 0 }

            // get total ordered for this PO
            if (g.purchase_order?.items) {
                const poItems = Array.isArray(g.purchase_order.items) ? g.purchase_order.items : []
                // only add this once per PO
                if (poData[po].ordered === 0) {
                    let totOrd = 0
                    poItems.forEach((poi: any) => totOrd += Number(poi.quantity || 0))
                    poData[po].ordered = totOrd
                }
            }
            // add received
            g.items?.forEach((i: any) => {
                poData[po].received += Number(i.received_qty || 0)
            })
        })

        return Object.entries(poData)
            .filter(([po, data]) => data.ordered > 0 || data.received > 0)
            .sort((a, b) => b[1].ordered - a[1].ordered)
            .slice(0, 10)
            .map(([po_no, data]) => ({ po_no, ...data }))

    }, [grns])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>GRN Analytics</h1>
                    <p className={styles.subtitle}>Receiving trends, vendor delivery performance and completion</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'GRN_Analytics')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/grn')}>
                        ← Back to GRNs
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total GRNs Received</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalGrns}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Items Received</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalItemsReceived.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Vendor-wise Receiving (Items)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={vendorReceiving} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {vendorReceiving.map((e, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="GRN Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusDist.map((e, i) => {
                                        let color = COLORS[i % COLORS.length]
                                        if (e.name === 'Received') color = '#34d399'
                                        if (e.name === 'Pending') color = '#facc15'
                                        if (e.name === 'IQC Done') color = '#22d3ee'
                                        return <Cell key={i} fill={color} />
                                    })}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly GRN Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyVolume} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="volume" name="GRN Volume" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Qty Ordered vs Received (Top 10 POs)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderedVsReceived} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="po_no" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="ordered" name="Ordered Qty" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="received" name="Received Qty" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
