'use client'

import { useState } from 'react'
import { contractorAdvances, contractorFirms, contractorWorkers, addAdvance, ContractorAdvance } from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadVoucherPdf } from '@/lib/pdf/downloadVoucherPdf'

export default function ContractorAdvancePage() {
    const router = useRouter()
    const [advances, setAdvances] = useState([...contractorAdvances])
    const [showForm, setShowForm] = useState(false)

    const [firmId, setFirmId] = useState('')
    const [workerId, setWorkerId] = useState('')
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10))
    const [amount, setAmount] = useState<number | ''>('')
    const [remarks, setRemarks] = useState('')

    const firmWorkers = contractorWorkers.filter(w => firmId ? w.firmId === firmId : true)

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        addAdvance({ firmId, workerId, date, amount: Number(amount), remarks, recovered: false })
        setAdvances([...contractorAdvances])
        setShowForm(false)
        setFirmId(''); setWorkerId(''); setAmount(''); setRemarks('')
    }

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
    const total = advances.reduce((s, a) => s + a.amount, 0)
    const recovered = advances.filter(a => a.recovered).reduce((s, a) => s + a.amount, 0)
    const outstanding = total - recovered

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Advance Memo</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Advances disbursed to contractor workers against upcoming wages</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Contractor Advance Register',
                        subtitle: `${advances.length} advance memos tracked`,
                        columns: [
                            { header: 'Memo No', dataKey: 'memoNo' },
                            { header: 'Date', dataKey: 'date' },
                            { header: 'Firm', dataKey: 'firm_name' },
                            { header: 'Worker', dataKey: 'worker_name' },
                            { header: 'Amount', dataKey: 'amount', format: 'currency', align: 'right' },
                            { header: 'Remarks', dataKey: 'remarks' },
                            { header: 'Status', dataKey: 'statusName' },
                        ],
                        rows: advances.map(a => {
                            const firm = contractorFirms.find(f => f.id === a.firmId)
                            const worker = contractorWorkers.find(w => w.id === a.workerId)
                            return {
                                ...a,
                                firm_name: firm?.name || '—',
                                worker_name: worker?.name || '—',
                                statusName: a.recovered ? 'Recovered' : 'Outstanding',
                            }
                        }),
                        fileName: 'Contractor_Advance_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/advance-memo/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Issue Advance'}
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Disbursed', value: fmt(total), color: '#6366f1' },
                    { label: 'Recovered', value: fmt(recovered), color: '#34d399' },
                    { label: 'Outstanding', value: fmt(outstanding), color: outstanding > 0 ? '#f43f5e' : '#34d399' },
                ].map(k => (
                    <div key={k.label} style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '0.25rem' }}>{k.label}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--mono)', color: k.color, margin: 0 }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <Card title="Issue Advance to Worker" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contractor Firm</label>
                                <select value={firmId} onChange={e => { setFirmId(e.target.value); setWorkerId('') }} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Firm</option>
                                    {contractorFirms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Worker</label>
                                <select value={workerId} onChange={e => setWorkerId(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Worker</option>
                                    {firmWorkers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.workerId})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Amount (₹)</label>
                                <input type="number" min={1} value={amount} onChange={e => setAmount(Number(e.target.value))} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Remarks</label>
                                <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} required
                                    placeholder="e.g. Medical emergency, festival advance…"
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}><Button type="submit">Issue Advance</Button></div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                        <tr style={{ background: '#0f1117', color: 'var(--text-muted)', textAlign: 'left' }}>
                            {['Memo No', 'Contractor Firm', 'Worker', 'Date', 'Amount', 'Remarks', 'Status', ''].map(h => (
                                <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {advances.map(a => {
                            const worker = contractorWorkers.find(w => w.id === a.workerId)
                            const firm = contractorFirms.find(f => f.id === a.firmId)
                            return (
                                <tr key={a.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{a.memoNo}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{firm?.name}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{worker?.name}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}>{a.date}</td>
                                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#6366f1' }}>{fmt(a.amount)}</td>
                                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{a.remarks}</td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                                            background: a.recovered ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)',
                                            color: a.recovered ? '#34d399' : '#f43f5e'
                                        }}>
                                            {a.recovered ? 'Recovered' : 'Outstanding'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                        <DownloadButton
                                            variant="voucher"
                                            onClick={() => downloadVoucherPdf({
                                                type: 'Advance Memo',
                                                voucherNo: a.memoNo,
                                                date: a.date,
                                                partyName: worker?.name || 'Unknown',
                                                amount: a.amount,
                                                narration: a.remarks,
                                                entries: [
                                                    { label: `Advance Given to ${worker?.name}`, debit: a.amount, credit: 0 },
                                                    { label: 'Cash / Bank Account', debit: 0, credit: a.amount },
                                                ],
                                                extras: {
                                                    'Contractor Firm': firm?.name || '—',
                                                    'Worker ID': worker?.workerId || '—',
                                                    'Status': a.recovered ? 'Recovered' : 'Outstanding',
                                                }
                                            })}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        {advances.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No advance memos</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
