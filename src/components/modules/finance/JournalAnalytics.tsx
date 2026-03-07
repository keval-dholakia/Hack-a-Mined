'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Voucher, Account } from '@/data/financeMock'
import { fetchVouchers, fetchAccounts } from '@/data/financeMock'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from '@/components/modules/masters/CustomerAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
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
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') || p.name.includes('Volume') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function JournalAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchVouchers('Journal'), fetchAccounts()]).then(([vs, as]) => {
            setVouchers(vs)
            setAccounts(as)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalEntries = vouchers.length
        const totalVolume = vouchers.reduce((s, v) => s + v.totalAmount, 0)
        return { totalEntries, totalVolume }
    }, [vouchers])

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        vouchers.forEach(v => {
            const m = v.date.substring(0, 7)
            byMonth[m] = (byMonth[m] || 0) + v.totalAmount
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [vouchers])

    const accountFlows = useMemo(() => {
        const flows: Record<string, { debit: number, credit: number }> = {}
        accounts.forEach(a => flows[a.id] = { debit: 0, credit: 0 })

        vouchers.forEach(v => {
            v.entries.forEach(e => {
                if (!flows[e.accountId]) flows[e.accountId] = { debit: 0, credit: 0 }
                flows[e.accountId].debit += e.debit
                flows[e.accountId].credit += e.credit
            })
        })

        return Object.entries(flows)
            .map(([accId, data]) => {
                const acc = accounts.find(a => a.id === accId)
                return { name: acc?.name || 'Unknown', totalFlow: data.debit + data.credit, ...data }
            })
            .filter(a => a.totalFlow > 0)
            .sort((a, b) => b.totalFlow - a.totalFlow)
            .slice(0, 10)
    }, [vouchers, accounts])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Journal Analytics</h1>
                    <p className={styles.subtitle}>Adjustment entries, volume trends & account flows</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Journal_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/journal')}>
                        ← Back to Journals
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Journal Entries</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalEntries}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Journal Volume</p>
                    <p className={styles.kpiValue} style={{ color: '#34d399' }}>₹{stats.totalVolume.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Monthly Journal Volume" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="monotone" dataKey="amount" name="Volume (₹)" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Accounts by Flow (Debit & Credit)" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, accountFlows.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={accountFlows} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="debit" name="Debited (₹)" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={16} />
                                <Bar dataKey="credit" name="Credited (₹)" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
