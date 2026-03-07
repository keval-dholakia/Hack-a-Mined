'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorAdvance } from '@/data/contractorMock'
import { contractorFirms, contractorWorkers } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { advances: ContractorAdvance[] }

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.includes('Amount') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function AdvanceAnalytics({ advances }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const totalAmount = advances.reduce((s, a) => s + a.amount, 0)
        const recoveredAmount = advances.filter(a => a.recovered).reduce((s, a) => s + a.amount, 0)
        const outstandingAmount = totalAmount - recoveredAmount
        return { totalAmount, recoveredAmount, outstandingAmount, count: advances.length }
    }, [advances])

    const firmData = useMemo(() => {
        const amounts: Record<string, number> = {}
        advances.forEach(a => {
            const fName = contractorFirms.find(f => f.id === a.firmId)?.name || 'Unknown'
            amounts[fName] = (amounts[fName] || 0) + a.amount
        })
        return Object.entries(amounts).map(([name, value]) => ({ name, value }))
    }, [advances])

    const statusData = [
        { name: 'Recovered', value: stats.recoveredAmount },
        { name: 'Outstanding', value: stats.outstandingAmount }
    ]

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        advances.forEach(a => {
            const m = a.date.substring(0, 7)
            byMonth[m] = (byMonth[m] || 0) + a.amount
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [advances])

    const topRecipients = useMemo(() => {
        const workerAmts: Record<string, number> = {}
        advances.forEach(a => {
            workerAmts[a.workerId] = (workerAmts[a.workerId] || 0) + a.amount
        })
        return Object.entries(workerAmts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([workerId, amount]) => {
                const w = contractorWorkers.find(x => x.id === workerId)
                return { name: w?.name || 'Unknown', amount }
            })
    }, [advances])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contractor Advances Analytics</h1>
                    <p className={styles.subtitle}>Advance disbursement trends & recovery status</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Advances_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/advance-memo')}>
                        ← Back to Advances
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Advances Issued</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.count}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Disbursed</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Recovered</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.recoveredAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Outstanding Tracker</p>
                    <p className={styles.kpiValue} style={{ color: stats.outstandingAmount > 0 ? '#f43f5e' : '#34d399' }}>₹{stats.outstandingAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Amount Disbursed by Firm" noPad>
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

                <Card title="Recovery Status by Amount" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} outerRadius={80} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly Advance Disbursement" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="monotone" dataKey="amount" name="Total Amount" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Advance Recipients" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topRecipients.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRecipients} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="amount" name="Amount Disbursed (₹)" fill="#facc15" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
