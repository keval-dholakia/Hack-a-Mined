'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadVoucherPdf } from '@/lib/pdf/downloadVoucherPdf'
import { fetchVouchers, fetchAccounts, createVoucher, Voucher, Account } from '@/data/financeMock'

export default function JournalPage() {
    const router = useRouter()
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [debitAcc, setDebitAcc] = useState('')
    const [creditAcc, setCreditAcc] = useState('')
    const [amount, setAmount] = useState<number | ''>('')
    const [narration, setNarration] = useState('')

    useEffect(() => {
        load()
    }, [])

    async function load() {
        const vs = await fetchVouchers('Journal')
        setVouchers(vs)
        const ac = await fetchAccounts()
        setAccounts(ac)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!debitAcc || !creditAcc || !amount) return
        if (debitAcc === creditAcc) {
            alert("Debit and Credit accounts must be different.")
            return
        }

        setLoading(true)
        await createVoucher({
            type: 'Journal',
            date,
            narration,
            totalAmount: Number(amount),
            entries: [
                { accountId: debitAcc, debit: Number(amount), credit: 0 },
                { accountId: creditAcc, debit: 0, credit: Number(amount) }
            ]
        })
        setLoading(false)
        setShowForm(false)
        setDebitAcc(''); setCreditAcc(''); setAmount(''); setNarration('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Voucher Journal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Adjustment Entries (Debit/Credit matching)</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Journal Register',
                        subtitle: `${vouchers.length} adjustment entries`,
                        columns: [
                            { header: 'Journal No', dataKey: 'voucherNo' },
                            { header: 'Date', dataKey: 'date' },
                            { header: 'Debit Account', dataKey: 'd_acc' },
                            { header: 'Credit Account', dataKey: 'c_acc' },
                            { header: 'Narration', dataKey: 'narration' },
                            { header: 'Amount', dataKey: 'totalAmount', format: 'currency', align: 'right' },
                        ],
                        rows: vouchers.map(v => {
                            const d_entry = v.entries.find(x => x.debit > 0)
                            const c_entry = v.entries.find(x => x.credit > 0)
                            return {
                                ...v,
                                d_acc: accounts.find(a => a.id === d_entry?.accountId)?.name || '-',
                                c_acc: accounts.find(a => a.id === c_entry?.accountId)?.name || '-',
                            }
                        }),
                        fileName: 'Journal_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/journal/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Journal'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card title="Create Journal Entry" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Debit Account</label>
                                <select value={debitAcc} onChange={e => setDebitAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Credit Account</label>
                                <select value={creditAcc} onChange={e => setCreditAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Narration</label>
                                <input type="text" value={narration} onChange={e => setNarration(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Entry'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Journal No</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Debit Account</th>
                            <th style={{ padding: '1rem' }}>Credit Account</th>
                            <th style={{ padding: '1rem' }}>Narration</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => {
                            const d_entry = v.entries.find(x => x.debit > 0)
                            const c_entry = v.entries.find(x => x.credit > 0)
                            const d_acc = accounts.find(a => a.id === d_entry?.accountId)?.name || '-'
                            const c_acc = accounts.find(a => a.id === c_entry?.accountId)?.name || '-'
                            return (
                                <tr key={v.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{v.voucherNo}</td>
                                    <td style={{ padding: '1rem' }}>{v.date}</td>
                                    <td style={{ padding: '1rem', color: '#34d399' }}>{d_acc}</td>
                                    <td style={{ padding: '1rem', color: '#f43f5e' }}>{c_acc}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.narration}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)' }}>{fmt(v.totalAmount)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <DownloadButton
                                            variant="voucher"
                                            onClick={() => downloadVoucherPdf({
                                                type: 'Journal Voucher',
                                                voucherNo: v.voucherNo,
                                                date: v.date,
                                                amount: v.totalAmount,
                                                narration: v.narration,
                                                entries: v.entries.map(e => ({
                                                    label: accounts.find(a => a.id === e.accountId)?.name || 'Unknown Account',
                                                    debit: e.debit,
                                                    credit: e.credit
                                                }))
                                            })}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {vouchers.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No Journal Entries found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
