'use client'

import { useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractorSheet } from '@/data/contractorMock'
import { contractorFirms, contractorWorkers } from '@/data/contractorMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

type Props = { sheets: ContractorSheet[] }

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#facc15', '#f472b6', '#a78bfa']
const STATUS_COLORS: Record<string, string> = { Draft: '#facc15', Approved: '#6366f1', Paid: '#34d399' }
const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.includes('Pay') || p.name.includes('Amount') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function SalarySheetAnalytics({ sheets }: Props) {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)

    const stats = useMemo(() => {
        const total = sheets.length
        const totalGross = sheets.reduce((s, x) => s + x.grossPay, 0)
        const totalAdvance = sheets.reduce((s, x) => s + x.advanceDeducted, 0)
        const totalNet = sheets.reduce((s, x) => s + x.netPayable, 0)
        return { total, totalGross, totalAdvance, totalNet }
    }, [sheets])

    const firmData = useMemo(() => {
        const amounts: Record<string, number> = {}
        sheets.forEach(s => {
            const fName = contractorFirms.find(f => f.id === s.firmId)?.name || 'Unknown'
            amounts[fName] = (amounts[fName] || 0) + s.netPayable
        })
        return Object.entries(amounts).map(([name, value]) => ({ name, value }))
    }, [sheets])

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {}
        sheets.forEach(s => counts[s.status] = (counts[s.status] || 0) + 1)
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [sheets])

    const trendData = useMemo(() => {
        const byMonth: Record<string, { gross: number, net: number }> = {}
        sheets.forEach(s => {
            const m = s.month
            if (!byMonth[m]) byMonth[m] = { gross: 0, net: 0 }
            byMonth[m].gross += s.grossPay
            byMonth[m].net += s.netPayable
        })
        return Object.entries(byMonth)
            .map(([month, data]) => ({ month, ...data }))
    }, [sheets])

    const topEarners = useMemo(() => {
        return [...sheets]
            .sort((a, b) => b.netPayable - a.netPayable)
            .slice(0, 10)
            .map(s => {
                const w = contractorWorkers.find(x => x.id === s.workerId)
                return { name: w?.name || 'Unknown', netPayable: s.netPayable, grossPay: s.grossPay }
            })
    }, [sheets])

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Contractor Payroll Analytics</h1>
                    <p className={styles.subtitle}>Salary sheets, deductions & payout trends</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Contractor_Payroll_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/salary-sheet')}>
                        ← Back to Salary Sheets
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Salary Sheets</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.total}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Gross Pay</p>
                    <p className={styles.kpiValue} style={{ color: '#22d3ee' }}>₹{stats.totalGross.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Advances Deducted</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.totalAdvance.toLocaleString('en-IN')}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Net Payable</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalNet.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Payroll Trend" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Area type="monotone" dataKey="gross" name="Gross Pay" fill="#6366f1" stroke="none" fillOpacity={0.2} />
                                <Line type="monotone" dataKey="net" name="Net Payable" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Salary by Firm (Net)" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={firmData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="value" name="Net Pay" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Sheet Status Distribution" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Earners (Net Pay)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topEarners.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topEarners} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="grossPay" name="Gross Pay" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="netPayable" name="Net Pay" fill="#34d399" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
