'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { fetchCcStatements, fetchAccounts, createCcStatement, CreditCardTx, Account } from '@/data/financeMock'

export default function CreditCardPage() {
    const [txs, setTxs] = useState<CreditCardTx[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [cardNo, setCardNo] = useState('')
    const [merchant, setMerchant] = useState('')
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [amount, setAmount] = useState<number | ''>('')
    const [expenseHead, setExpenseHead] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const statements = await fetchCcStatements()
        setTxs(statements.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()))
        const ac = await fetchAccounts()
        setAccounts(ac)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!expenseHead || !amount) return
        setLoading(true)

        // Month format like 'Feb 2026'
        const d = new Date(date)
        const monthName = d.toLocaleString('default', { month: 'short' })
        const year = d.getFullYear()
        const statementMonth = `${monthName} ${year}`

        await createCcStatement({
            cardNo: cardNo || '**** 9999',
            statementMonth,
            transactionDate: date,
            merchant,
            amount: Number(amount),
            expenseHeadId: expenseHead
        })

        setLoading(false)
        setShowForm(false)
        setMerchant(''); setAmount(''); setExpenseHead('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Credit Card Statements</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Log Corporate Expenses Directly to Statements</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Log Expense'}
                </Button>
            </div>

            {showForm && (
                <Card title="New Credit Card Transaction" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Card No (Last 4 Digits)</label>
                                <input type="text" placeholder="**** 1234" value={cardNo} onChange={e => setCardNo(e.target.value)} style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Transaction Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Merchant / Description</label>
                                <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Expense Ledger Head</label>
                                <select value={expenseHead} onChange={e => setExpenseHead(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Expense Type</option>
                                    {accounts.filter(a => a.type === 'Expense').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Log Expense & Auto-Journal'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Card No</th>
                            <th style={{ padding: '1rem' }}>Merchant</th>
                            <th style={{ padding: '1rem' }}>Statement Month</th>
                            <th style={{ padding: '1rem' }}>Tx Date</th>
                            <th style={{ padding: '1rem' }}>Expense Ledger</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map(tx => {
                            const expAcc = accounts.find(a => a.id === tx.expenseHeadId)?.name || 'Unknown'
                            return (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '1rem', color: '#facc15' }}>{tx.cardNo}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{tx.merchant}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', background: '#1f2235', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {tx.statementMonth}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{tx.transactionDate}</td>
                                    <td style={{ padding: '1rem', color: '#34d399' }}>{expAcc}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)', color: '#22d3ee' }}>
                                        {fmt(tx.amount)}
                                    </td>
                                </tr>
                            )
                        })}
                        {txs.length === 0 && (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No Credit Card transactions logged</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
