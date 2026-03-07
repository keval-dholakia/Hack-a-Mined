'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadTransactionHtmlPdf } from '@/lib/pdf/downloadTransactionHtmlPdf'
import { fetchVouchers, fetchAccounts, createVoucher, Voucher, Account, VoucherType } from '@/data/financeMock'

export default function PaymentReceiptPage() {
    const router = useRouter()
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const [type, setType] = useState<'Payment' | 'Receipt'>('Payment')
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [partyAcc, setPartyAcc] = useState('')
    const [bankCashAcc, setBankCashAcc] = useState('')
    const [amount, setAmount] = useState<number | ''>('')
    const [mode, setMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque'>('Bank Transfer')
    const [narration, setNarration] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const pvs = await fetchVouchers('Payment')
        const rvs = await fetchVouchers('Receipt')
        setVouchers([...pvs, ...rvs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        const ac = await fetchAccounts()
        setAccounts(ac)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!partyAcc || !bankCashAcc || !amount) return
        setLoading(true)

        const partyName = accounts.find(a => a.id === partyAcc)?.name || 'Unknown Party'

        // Logic:
        // Payment: Debit Party, Credit Bank/Cash
        // Receipt: Debit Bank/Cash, Credit Party
        const entries = type === 'Payment'
            ? [{ accountId: partyAcc, debit: Number(amount), credit: 0 }, { accountId: bankCashAcc, debit: 0, credit: Number(amount) }]
            : [{ accountId: bankCashAcc, debit: Number(amount), credit: 0 }, { accountId: partyAcc, debit: 0, credit: Number(amount) }]

        await createVoucher({
            type, date, narration, totalAmount: Number(amount), partyName, mode, entries
        })

        setLoading(false)
        setShowForm(false)
        setPartyAcc(''); setBankCashAcc(''); setAmount(''); setNarration('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Payment & Receipt</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Bank & Cash Transactions with Parties</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Payment & Receipt Register',
                        subtitle: `${vouchers.length} transactions recorded`,
                        columns: [
                            { header: 'Voucher No', dataKey: 'voucherNo' },
                            { header: 'Type', dataKey: 'type' },
                            { header: 'Date', dataKey: 'date' },
                            { header: 'Party Name', dataKey: 'partyName' },
                            { header: 'Mode', dataKey: 'mode' },
                            { header: 'Narration', dataKey: 'narration' },
                            { header: 'Amount', dataKey: 'totalAmount', format: 'currency', align: 'right' },
                        ],
                        rows: vouchers,
                        fileName: 'Payment_Receipt_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/payment-receipt/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Payment/Receipt'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card title="Issue Voucher" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Voucher Type</label>
                                <select value={type} onChange={e => setType(e.target.value as any)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="Payment">Payment</option>
                                    <option value="Receipt">Receipt</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Mode</label>
                                <select value={mode} onChange={e => setMode(e.target.value as any)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Cash">Cash</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Party/Vendor Account</label>
                                <select value={partyAcc} onChange={e => setPartyAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Party</option>
                                    {accounts.filter(a => a.subType === 'Party').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Payment Account ({mode === 'Cash' ? 'Cash' : 'Bank'})</label>
                                <select value={bankCashAcc} onChange={e => setBankCashAcc(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select internal account</option>
                                    {accounts.filter(a => mode === 'Cash' ? a.subType === 'Cash' : a.subType === 'Bank').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Amount</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Narration</label>
                            <input type="text" value={narration} onChange={e => setNarration(e.target.value)} required style={{ padding: '0.75rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                        </div>

                        <div style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Voucher'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Voucher No</th>
                            <th style={{ padding: '1rem' }}>Type</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Party Name</th>
                            <th style={{ padding: '1rem' }}>Mode</th>
                            <th style={{ padding: '1rem' }}>Narration</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                <td style={{ padding: '1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{v.voucherNo}</td>
                                <td style={{ padding: '1rem', color: v.type === 'Receipt' ? '#34d399' : '#f43f5e', fontWeight: 600 }}>{v.type}</td>
                                <td style={{ padding: '1rem' }}>{v.date}</td>
                                <td style={{ padding: '1rem' }}>{v.partyName}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.mode}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.narration}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)' }}>{fmt(v.totalAmount)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <DownloadButton
                                        variant="voucher"
                                        onClick={() => downloadTransactionHtmlPdf({
                                            type: v.type === 'Payment' ? 'Payment Voucher' : 'Receipt Voucher',
                                            voucherNo: v.voucherNo,
                                            date: v.date,
                                            partyName: v.partyName,
                                            amount: v.totalAmount,
                                            narration: v.narration,
                                            entries: v.entries.map(e => ({
                                                label: accounts.find(a => a.id === e.accountId)?.name || 'Unknown Account',
                                                debit: e.debit,
                                                credit: e.credit
                                            })),
                                            extras: {
                                                'Payment Mode': v.mode || '—'
                                            }
                                        })}
                                    />
                                </td>
                            </tr>
                        ))}
                        {vouchers.length === 0 && (
                            <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No Payment/Receipts found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
