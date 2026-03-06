'use client'

import { useState } from 'react'
import {
    contractorPayments, contractorSheets, contractorFirms, contractorWorkers,
    addPayment, ContractorPayment
} from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const MODES = ['NEFT', 'RTGS', 'Cheque', 'Cash'] as const

export default function ContractorPaymentsPage() {
    const [payments, setPayments] = useState([...contractorPayments])
    const [showForm, setShowForm] = useState(false)

    const [firmId, setFirmId] = useState('')
    const [sheetId, setSheetId] = useState('')
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [mode, setMode] = useState<ContractorPayment['paymentMode']>('NEFT')
    const [tds, setTds] = useState<number | ''>('')

    // Approved sheets not yet Paid
    const approvedSheets = contractorSheets.filter(s => s.status === 'Approved' && (firmId ? s.firmId === firmId : true))
    const selectedSheet = contractorSheets.find(s => s.id === sheetId)
    const netPaid = selectedSheet ? selectedSheet.netPayable - Number(tds || 0) : 0

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedSheet) return
        if (netPaid < 0) return alert('Net paid cannot be negative!')
        addPayment({
            firmId, sheetId, date, netAmountPaid: netPaid,
            tdsDeducted: Number(tds || 0), paymentMode: mode
        })
        setPayments([...contractorPayments])
        setShowForm(false)
        setFirmId(''); setSheetId(''); setTds('')
    }

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
    const totalPaid = payments.reduce((s, p) => s + p.netAmountPaid, 0)
    const totalTds = payments.reduce((s, p) => s + p.tdsDeducted, 0)

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Contractor Payments</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Issue payment vouchers against approved salary sheets with TDS deduction</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Make Payment'}</Button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Payments', value: payments.length.toString(), color: '#6366f1' },
                    { label: 'Total Paid', value: fmt(totalPaid), color: '#34d399' },
                    { label: 'TDS Withheld', value: fmt(totalTds), color: '#facc15' },
                    { label: 'Sheets Pending Payment', value: contractorSheets.filter(s => s.status === 'Approved').length.toString(), color: '#f43f5e' },
                ].map(k => (
                    <div key={k.label} style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '0.25rem' }}>{k.label}</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--mono)', color: k.color, margin: 0 }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <Card title="Issue Payment Voucher" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contractor Firm</label>
                                <select value={firmId} onChange={e => { setFirmId(e.target.value); setSheetId('') }} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Firm</option>
                                    {contractorFirms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Approved Salary Sheet</label>
                                <select value={sheetId} onChange={e => setSheetId(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Sheet</option>
                                    {approvedSheets.map(s => {
                                        const w = contractorWorkers.find(x => x.id === s.workerId)
                                        return <option key={s.id} value={s.id}>{s.sheetNo} — {w?.name} — {s.month} — Net: {fmt(s.netPayable)}</option>
                                    })}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Payment Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Payment Mode</label>
                                <select value={mode} onChange={e => setMode(e.target.value as any)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TDS Deducted @ 2%</label>
                                <input type="number" min={0} value={tds} onChange={e => setTds(Number(e.target.value))}
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            {selectedSheet && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Amount Payable</p>
                                    <p style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.3rem', color: netPaid < 0 ? '#f43f5e' : '#6366f1' }}>
                                        {fmt(netPaid < 0 ? 0 : netPaid)}
                                    </p>
                                </div>
                            )}
                        </div>
                        {approvedSheets.length === 0 && (
                            <p style={{ color: '#facc15', fontSize: '0.82rem' }}>⚠ No approved salary sheets pending payment for this firm. Approve sheets first.</p>
                        )}
                        <div style={{ alignSelf: 'flex-end' }}>
                            <Button type="submit" disabled={!selectedSheet || netPaid < 0}>Post Payment Voucher</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                        <tr style={{ background: '#0f1117', color: 'var(--text-muted)', textAlign: 'left' }}>
                            {['Voucher No', 'Contractor Firm', 'Sheet Ref', 'Date', 'Mode', 'TDS Deducted', 'Net Paid'].map(h => (
                                <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => {
                            const firm = contractorFirms.find(f => f.id === p.firmId)
                            const sheet = contractorSheets.find(s => s.id === p.sheetId)
                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{p.voucherNo}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{firm?.name}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#6366f1' }}>{sheet?.sheetNo}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}>{p.date}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', background: '#1f2235' }}>{p.paymentMode}</span>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#f43f5e' }}>{fmt(p.tdsDeducted)}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', fontWeight: 700, color: '#34d399' }}>{fmt(p.netAmountPaid)}</td>
                                </tr>
                            )
                        })}
                        {payments.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
