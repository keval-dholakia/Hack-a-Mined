'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { BankReconLine, Account } from '@/data/financeMock'
import { fetchBankRecon, fetchAccounts } from '@/data/financeMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'

const ACCENT = '#6366f1'

function DarkTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.tooltipLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') || p.name.includes('Balance') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function BankReconAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [lines, setLines] = useState<BankReconLine[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchBankRecon(), fetchAccounts()]).then(([br, ac]) => {
            setLines(br)
            setAccounts(ac)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalLines = lines.length
        const unreconciledCount = lines.filter(l => l.status === 'Pending').length
        const totalUnreconciledAmt = lines.reduce((s, l) => s + Math.abs(l.unreconciledAmount), 0)
        return { totalLines, unreconciledCount, totalUnreconciledAmt }
    }, [lines])

    const statusData = [
        { name: 'Reconciled', value: lines.filter(l => l.status === 'Reconciled').length },
        { name: 'Pending', value: lines.filter(l => l.status === 'Pending').length }
    ]

    const unreconciledData = useMemo(() => {
        const amtByBank: Record<string, number> = {}
        lines.filter(l => l.unreconciledAmount !== 0).forEach(l => {
            const accName = accounts.find(a => a.id === l.bankAccountId)?.name || 'Unknown'
            amtByBank[accName] = (amtByBank[accName] || 0) + Math.abs(l.unreconciledAmount)
        })
        return Object.entries(amtByBank).map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
    }, [lines, accounts])

    const balanceComparison = useMemo(() => {
        const balByBank: Record<string, { system: number, bank: number }> = {}
        lines.forEach(l => {
            const accName = accounts.find(a => a.id === l.bankAccountId)?.name || 'Unknown'
            if (!balByBank[accName]) balByBank[accName] = { system: 0, bank: 0 }
            balByBank[accName].system += l.systemBalance
            balByBank[accName].bank += l.bankBalance
        })
        return Object.entries(balByBank).map(([name, balances]) => ({ name, ...balances }))
    }, [lines, accounts])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Bank Reconciliation Analytics</h1>
                    <p className={styles.subtitle}>System vs Bank balance matching and drift</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Bank_Recon_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/bank-recon')}>
                        ← Back to Bank Recon
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Recon Statements</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalLines}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Pending Reconciliation</p>
                    <p className={styles.kpiValue} style={{ color: stats.unreconciledCount > 0 ? '#facc15' : '#34d399' }}>{stats.unreconciledCount}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Net Unreconciled Value</p>
                    <p className={styles.kpiValue} style={{ color: stats.totalUnreconciledAmt > 0 ? '#f43f5e' : '#34d399' }}>₹{stats.totalUnreconciledAmt.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Reconciliation Status" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#34d399" />
                                    <Cell fill="#facc15" />
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Unreconciled Amounts by Bank" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={unreconciledData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="amount" name="Unreconciled (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="System Balance vs Bank Statement Balance" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={balanceComparison} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="system" name="System Balance (₹)" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="bank" name="Bank Statement Balance (₹)" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
