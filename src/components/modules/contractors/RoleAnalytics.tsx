'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorRole } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { roles: ContractorRole[] }

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

export default function RoleAnalytics({ roles }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const total = roles.length
        const avgDaily = roles.length ? roles.reduce((s, r) => s + r.dailyRate, 0) / roles.length : 0
        const avgOt = roles.length ? roles.reduce((s, r) => s + r.otRate, 0) / roles.length : 0
        return { total, avgDaily: Math.round(avgDaily), avgOt: Math.round(avgOt) }
    }, [roles])

    // Roles by rate range (<500, 500-750, 750-1000, 1000+)
    const rateDistribution = useMemo(() => {
        const dist = { '< 500': 0, '500 - 750': 0, '750 - 1000': 0, '> 1000': 0 }
        roles.forEach(r => {
            if (r.dailyRate < 500) dist['< 500']++
            else if (r.dailyRate <= 750) dist['500 - 750']++
            else if (r.dailyRate <= 1000) dist['750 - 1000']++
            else dist['> 1000']++
        })
        return Object.entries(dist).map(([name, value]) => ({ name, value }))
    }, [roles])

    const rateComparison = useMemo(() => {
        return [...roles].sort((a, b) => b.dailyRate - a.dailyRate)
    }, [roles])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contractor Roles Analytics</h1>
                    <p className={styles.subtitle}>Salary head & rate distribution insights</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Roles_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/roles')}>
                        ← Back to Roles
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Configured Roles</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.total}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average Daily Rate</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.avgDaily}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Average OT Rate / hr</p>
                    <p className={styles.kpiValue} style={{ color: '#facc15' }}>₹{stats.avgOt}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Roles by Daily Rate Range" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rateDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Roles Count" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Role Rate Comparison" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, roles.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rateComparison} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="role" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="dailyRate" name="Daily Rate (₹)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
