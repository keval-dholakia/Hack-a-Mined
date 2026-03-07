'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorStructure } from '@/data/contractorMock'
import { contractorWorkers, contractorRoles } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { structures: ContractorStructure[] }

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.includes('Rate') ? `₹${p.value}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function SalaryStructureAnalytics({ structures }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const totalWorkers = contractorWorkers.length
        const totalConfigured = structures.length
        const missing = totalWorkers - totalConfigured
        return { totalWorkers, totalConfigured, missing }
    }, [structures])

    const coverageData = [
        { name: 'Configured', value: stats.totalConfigured },
        { name: 'Missing', value: stats.missing }
    ]

    const rateDistribution = useMemo(() => {
        const dist = { '< 500': 0, '500 - 750': 0, '750 - 1000': 0, '> 1000': 0 }
        structures.forEach(s => {
            if (s.dailyRate < 500) dist['< 500']++
            else if (s.dailyRate <= 750) dist['500 - 750']++
            else if (s.dailyRate <= 1000) dist['750 - 1000']++
            else dist['> 1000']++
        })
        return Object.entries(dist).map(([name, value]) => ({ name, value }))
    }, [structures])

    const structureByRole = useMemo(() => {
        const byRole: Record<string, { role: string, avgRate: number, count: number }> = {}
        structures.forEach(s => {
            const roleName = contractorRoles.find(r => r.id === s.roleId)?.role || 'Unknown'
            if (!byRole[roleName]) byRole[roleName] = { role: roleName, avgRate: 0, count: 0 }
            byRole[roleName].avgRate += s.dailyRate
            byRole[roleName].count += 1
        })
        return Object.values(byRole).map(x => ({
            role: x.role,
            avgRate: Math.round(x.avgRate / x.count),
            count: x.count
        }))
    }, [structures])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Structure Analytics</h1>
                    <p className={styles.subtitle}>Labour rate mapping & coverage insights</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Structure_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/salary-structure')}>
                        ← Back to Structures
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Workers</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalWorkers}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Configured Structures</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>{stats.totalConfigured}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Missing Mappings</p>
                    <p className={styles.kpiValue} style={{ color: stats.missing > 0 ? '#f43f5e' : '#94a3b8' }}>{stats.missing}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Structure Mapping Coverage" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={coverageData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Worker Rate Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rateDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Workers Count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Average Rate by Role" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, structureByRole.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={structureByRole} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="role" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="avgRate" name="Avg Daily Rate (₹)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
