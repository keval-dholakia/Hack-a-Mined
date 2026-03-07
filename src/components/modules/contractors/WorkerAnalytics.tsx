'use client'

import { useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorWorker, ContractorFirm } from '@/data/contractorMock'
import { contractorFirms } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { workers: ContractorWorker[] }

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function WorkerAnalytics({ workers }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const total = workers.length
        const skilled = workers.filter(w => w.skillLevel === 'Skilled').length
        const semi = workers.filter(w => w.skillLevel === 'Semi-Skilled').length
        const unskilled = workers.filter(w => w.skillLevel === 'Unskilled').length
        return { total, skilled, semi, unskilled }
    }, [workers])

    const firmData = useMemo(() => {
        const counts: Record<string, number> = {}
        workers.forEach(w => {
            const fName = contractorFirms.find(f => f.id === w.firmId)?.name || 'Unknown'
            counts[fName] = (counts[fName] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [workers])

    const skillData = [
        { name: 'Skilled', value: stats.skilled },
        { name: 'Semi-Skilled', value: stats.semi },
        { name: 'Unskilled', value: stats.unskilled },
    ]

    const tradeData = useMemo(() => {
        const counts: Record<string, number> = {}
        workers.forEach(w => counts[w.trade] = (counts[w.trade] || 0) + 1)
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [workers])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contractor Workers Analytics</h1>
                    <p className={styles.subtitle}>Labour force insights & distribution</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Workers_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/workers')}>
                        ← Back to Workers
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Workers</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.total}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Skilled Labour</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.skilled}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Semi-Skilled Labour</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>{stats.semi}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Unskilled Labour</p>
                    <p className={styles.kpiValue} style={{ color: '#94a3b8' }}>{stats.unskilled}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Workers by Firm" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={firmData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {firmData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Skill Level Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={skillData} outerRadius={80} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#facc15" />
                                    <Cell fill="#94a3b8" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Workers by Trade" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 340, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tradeData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Workers" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
