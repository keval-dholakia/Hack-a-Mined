'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { fetchVouchers, fetchAccounts, createVoucher, Voucher, Account } from '@/data/financeMock'

export default function GSTJournalPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [gstLedger, setGstLedger] = useState('')
    const [offsetLedger, setOffsetLedger] = useState('')
    const [adjustmentType, setAdjustmentType] = useState('Reversal') // Reversal, Output Adjustment, Input Claim
    const [amount, setAmount] = useState<number | ''>('')
    const [narration, setNarration] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const vs = await fetchVouchers('GST')
        setVouchers(vs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        const ac = await fetchAccounts()
        setAccounts(ac)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!gstLedger || !offsetLedger || !amount) return
        if (gstLedger === offsetLedger) return alert("Accounts must differ")

        setLoading(true)

        let entries = []
        if (adjustmentType === 'Reversal') {
            // Debit expense/offset, Credit GST ledger
            entries = [
                { accountId: offsetLedger, debit: Number(amount), credit: 0 },
                { accountId: gstLedger, debit: 0, credit: Number(amount) }
            ]
        } else {
            // Debit GST ledger, Credit offset
            entries = [
                { accountId: gstLedger, debit: Number(amount), credit: 0 },
                { accountId: offsetLedger, debit: 0, credit: Number(amount) }
            ]
        }

        await createVoucher({
            type: 'GST', date, narration, totalAmount: Number(amount),
            gstAdjustmentType: adjustmentType, entries
        })
        setLoading(false)
        setShowForm(false)
        setGstLedger(''); setOffsetLedger(''); setAmount(''); setNarration('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>GST Journal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Input/Output Tax Adjustments and ITC Reversals</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New GST Adjustment'}
                </Button>
            </div>

            {showForm && (
                <Card title="GST Adjustment Entry" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>GST Ledger (Tax Account)</label>
                                <select value={gstLedger} onChange={e => setGstLedger(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select tax ledger</option>
                                    {accounts.filter(a => a.subType === 'Tax').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Adjustment Type</label>
                                <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="Reversal">ITC Reversal / Credit Memo</option>
                                    <option value="Input Claim">ITC Claim</option>
                                    <option value="Output Adjustment">Output Tax Adjustment</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Offset Ledger (Expense / Party Account)</label>
                                <select value={offsetLedger} onChange={e => setOffsetLedger(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select offset account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Narration (Tax Invoice Reference, Reason)</label>
                            <input type="text" value={narration} onChange={e => setNarration(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                        </div>

                        <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post GST Journal'}</Button>
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
                            <th style={{ padding: '1rem' }}>Adjustment Type</th>
                            <th style={{ padding: '1rem' }}>Narration</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => {
                            return (
                                <tr key={v.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{v.voucherNo}</td>
                                    <td style={{ padding: '1rem' }}>{v.date}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', background: '#1f2235', borderRadius: '4px', fontSize: '0.75rem' }}>
                                            {v.gstAdjustmentType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.narration}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)' }}>{fmt(v.totalAmount)}</td>
                                </tr>
                            )
                        })}
                        {vouchers.length === 0 && (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No GST Journals found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
