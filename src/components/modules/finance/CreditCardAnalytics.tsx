'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CreditCardTx, Account } from '@/data/financeMock'
import { fetchCcStatements, fetchAccounts } from '@/data/financeMock'
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
                    {p.name}: <strong>{p.name.includes('₹') || p.name.toLowerCase().includes('amount') || p.name.includes('Spending') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

export default function CreditCardAnalytics() {
    const router = useRouter()
    const reportRef = useRef<HTMLDivElement>(null)
    const [txs, setTxs] = useState<CreditCardTx[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetchCcStatements(), fetchAccounts()]).then(([ts, ac]) => {
            setTxs(ts)
            setAccounts(ac)
            setLoading(false)
        })
    }, [])

    const stats = useMemo(() => {
        const totalAmount = txs.reduce((s, t) => s + t.amount, 0)
        const totalTx = txs.length
        return { totalAmount, totalTx }
    }, [txs])

    const expenseHeadData = useMemo(() => {
        const amtByHead: Record<string, number> = {}
        txs.forEach(t => {
            const expAcc = accounts.find(a => a.id === t.expenseHeadId)?.name || 'Unknown'
            amtByHead[expAcc] = (amtByHead[expAcc] || 0) + t.amount
        })
        return Object.entries(amtByHead).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [txs, accounts])

    const trendData = useMemo(() => {
        const byMonth: Record<string, number> = {}
        txs.forEach(t => {
            const m = t.transactionDate.substring(0, 7)
            byMonth[m] = (byMonth[m] || 0) + t.amount
        })
        return Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, amount]) => ({ month, amount }))
    }, [txs])

    const topMerchants = useMemo(() => {
        const amts: Record<string, number> = {}
        txs.forEach(t => {
            amts[t.merchant] = (amts[t.merchant] || 0) + t.amount
        })
        return Object.entries(amts)
            .map(([merchant, amount]) => ({ merchant, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10)
    }, [txs])

    if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Loading analytics...</div>

    return (
        <div className={styles.container} ref={reportRef}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Corporate Credit Card Analytics</h1>
                    <p className={styles.subtitle}>Spending patterns, merchants and expense heads</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <DownloadButton
                        variant="analytics"
                        onClick={() => downloadAnalysisPdf(reportRef, 'Credit_Card_Analytics_Report')}
                    />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/credit-card')}>
                        ← Back to Statements
                    </Button>
                </div>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Transactions</p>
                    <p className={styles.kpiValue} style={{ color: '#6366f1' }}>{stats.totalTx}</p>
                </div>
                <div className={styles.kpiCard}>
                    <p className={styles.kpiLabel}>Total Amount Spent</p>
                    <p className={styles.kpiValue} style={{ color: '#f43f5e' }}>₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Spending by Expense Head" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={expenseHeadData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {expenseHeadData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DarkTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Monthly Spending Trend" noPad>
                    <div style={{ height: 300, padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} />
                                <Line type="monotone" dataKey="amount" name="Amount Spent (₹)" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Top Merchants" noPad style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: Math.max(300, topMerchants.length * 40 + 50), padding: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMerchants} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="merchant" type="category" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#1a1d27' }} />
                                <Bar dataKey="amount" name="Spending (₹)" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    )
}
