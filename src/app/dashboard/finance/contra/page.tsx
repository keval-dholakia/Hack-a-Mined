'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadVoucherPdf } from '@/lib/pdf/downloadVoucherPdf'
import { fetchVouchers, fetchAccounts, createVoucher, Voucher, Account } from '@/data/financeMock'

export default function ContraPage() {
    const router = useRouter()
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [fromAcc, setFromAcc] = useState('')
    const [toAcc, setToAcc] = useState('')
    const [amount, setAmount] = useState<number | ''>('')
    const [narration, setNarration] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const vs = await fetchVouchers('Contra')
        setVouchers(vs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        const ac = await fetchAccounts()
        // Contra is between Cash, Bank, CC only
        setAccounts(ac.filter(a => ['Bank', 'Cash', 'CreditCard'].includes(a.subType)))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!fromAcc || !toAcc || !amount) return
        if (fromAcc === toAcc) {
            alert('From and To accounts must be different')
            return
        }
        setLoading(true)

        const fromAccountName = accounts.find(a => a.id === fromAcc)?.name || ''
        const toAccountName = accounts.find(a => a.id === toAcc)?.name || ''

        // Logic: From Acc is Credited, To Acc is Debited
        const entries = [
            { accountId: toAcc, debit: Number(amount), credit: 0 },
            { accountId: fromAcc, debit: 0, credit: Number(amount) }
        ]

        await createVoucher({
            type: 'Contra', date, narration, totalAmount: Number(amount), fromAccount: fromAccountName, toAccount: toAccountName, entries
        })

        setLoading(false)
        setShowForm(false)
        setFromAcc(''); setToAcc(''); setAmount(''); setNarration('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Voucher Contra</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Deposit/Withdrawal between Cash & Bank ledgers</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Contra Register',
                        subtitle: `${vouchers.length} contra entries recorded`,
                        columns: [
                            { header: 'Voucher No', dataKey: 'voucherNo' },
                            { header: 'Date', dataKey: 'date' },
                            { header: 'From Account ↓', dataKey: 'fromAccount' },
                            { header: 'To Account ↑', dataKey: 'toAccount' },
                            { header: 'Narration', dataKey: 'narration' },
                            { header: 'Amount', dataKey: 'totalAmount', format: 'currency', align: 'right' },
                        ],
                        rows: vouchers,
                        fileName: 'Contra_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/contra/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Contra'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card title="Issue Contra Voucher" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>From Account (Credit)</label>
                                <select value={fromAcc} onChange={e => setFromAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>To Account (Debit)</label>
                                <select value={toAcc} onChange={e => setToAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Narration (e.g., Transfer to Petty Cash)</label>
                            <input type="text" value={narration} onChange={e => setNarration(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                        </div>

                        <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Contra'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Voucher No</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>From Account ↓</th>
                            <th style={{ padding: '1rem' }}>To Account ↑</th>
                            <th style={{ padding: '1rem' }}>Narration</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                <td style={{ padding: '1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{v.voucherNo}</td>
                                <td style={{ padding: '1rem' }}>{v.date}</td>
                                <td style={{ padding: '1rem', color: '#f43f5e' }}>{v.fromAccount}</td>
                                <td style={{ padding: '1rem', color: '#34d399' }}>{v.toAccount}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.narration}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)' }}>{fmt(v.totalAmount)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <DownloadButton
                                        variant="voucher"
                                        onClick={() => downloadVoucherPdf({
                                            type: 'Contra Voucher',
                                            voucherNo: v.voucherNo,
                                            date: v.date,
                                            amount: v.totalAmount,
                                            narration: v.narration,
                                            entries: [
                                                { label: v.toAccount || 'Unknown Account', debit: v.totalAmount, credit: 0 },
                                                { label: v.fromAccount || 'Unknown Account', debit: 0, credit: v.totalAmount },
                                            ]
                                        })}
                                    />
                                </td>
                            </tr>
                        ))}
                        {vouchers.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No Contra entries found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
