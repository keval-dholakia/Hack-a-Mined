'use client'

import { useState } from 'react'
import {
    contractorSheets, contractorFirms, contractorWorkers, contractorStructures,
    contractorRoles, contractorAdvances, addSheet, updateSheetStatus, ContractorSheet
} from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadVoucherPdf } from '@/lib/pdf/downloadVoucherPdf'

const STATUS_COLORS: Record<ContractorSheet['status'], string> = { Draft: '#facc15', Approved: '#6366f1', Paid: '#34d399' }

export default function ContractorSalarySheetPage() {
    const router = useRouter()
    const [sheets, setSheets] = useState([...contractorSheets])
    const [showForm, setShowForm] = useState(false)
    const [filterFirm, setFilterFirm] = useState('')
    const [filterMonth, setFilterMonth] = useState('')

    // form
    const [firmId, setFirmId] = useState('')
    const [workerId, setWorkerId] = useState('')
    const [month, setMonth] = useState('')
    const [days, setDays] = useState<number | ''>('')
    const [ot, setOt] = useState<number | ''>('')
    const [advance, setAdvance] = useState<number | ''>('')

    const selectedStructure = contractorStructures.find(s => s.workerId === workerId)
    const selectedRole = contractorRoles.find(r => r.id === selectedStructure?.roleId)

    const dailyRate = selectedStructure?.dailyRate ?? 0
    const otRate = selectedRole?.otRate ?? 0
    const gross = Math.round(Number(days || 0) * dailyRate + Number(ot || 0) * otRate)
    const net = gross - Number(advance || 0)

    function handleWorkerChange(wid: string) {
        setWorkerId(wid)
        const w = contractorWorkers.find(x => x.id === wid)
        if (w) setFirmId(w.firmId)
    }

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (net < 0) return alert('Net payable cannot be negative!')
        addSheet({
            firmId, workerId, month, daysWorked: Number(days), otHours: Number(ot),
            dailyRate, otRate, advanceDeducted: Number(advance || 0), tdsDeducted: 0, status: 'Draft'
        })
        setSheets([...contractorSheets])
        setShowForm(false)
        setFirmId(''); setWorkerId(''); setMonth(''); setDays(''); setOt(''); setAdvance('')
    }

    function handleStatus(id: string, current: ContractorSheet['status']) {
        const next: ContractorSheet['status'] = current === 'Draft' ? 'Approved' : 'Paid'
        updateSheetStatus(id, next)
        setSheets([...contractorSheets])
    }

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
    const firmWorkers = contractorWorkers.filter(w => firmId ? w.firmId === firmId : true)

    const displayed = sheets.filter(s => {
        const matchFirm = filterFirm ? s.firmId === filterFirm : true
        const matchMonth = filterMonth ? s.month.toLowerCase().includes(filterMonth.toLowerCase()) : true
        return matchFirm && matchMonth
    })

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Contractor Salary Sheet</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Generate and track payout: (Days × Daily Rate) + (OT hrs × OT Rate) − Advance
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Contractor Salary Sheet Register',
                        subtitle: `${displayed.length} salary sheets generated`,
                        columns: [
                            { header: 'Sheet No', dataKey: 'sheetNo' },
                            { header: 'Contractor', dataKey: 'firm_name' },
                            { header: 'Worker', dataKey: 'worker_name' },
                            { header: 'Month', dataKey: 'month' },
                            { header: 'Gross Pay', dataKey: 'grossPay', format: 'currency', align: 'right' },
                            { header: 'Net Payable', dataKey: 'netPayable', format: 'currency', align: 'right' },
                            { header: 'Status', dataKey: 'status' },
                        ],
                        rows: displayed.map(s => {
                            const firm = contractorFirms.find(f => f.id === s.firmId)
                            const worker = contractorWorkers.find(w => w.id === s.workerId)
                            return {
                                ...s,
                                firm_name: firm?.name || '—',
                                worker_name: worker?.name || '—',
                            }
                        }),
                        fileName: 'Contractor_Salary_Sheet_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/salary-sheet/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Sheet'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card title="Generate Salary Sheet" style={{ marginBottom: '1.5rem' }}>
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
                                <select value={workerId} onChange={e => handleWorkerChange(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Worker</option>
                                    {firmWorkers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.workerId})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Month</label>
                                <input type="text" placeholder="Mar 2026" value={month} onChange={e => setMonth(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Days Worked</label>
                                <input type="number" min={0} max={31} value={days} onChange={e => setDays(Number(e.target.value))} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overtime Hours</label>
                                <input type="number" min={0} value={ot} onChange={e => setOt(Number(e.target.value))}
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Advance Deducted</label>
                                <input type="number" min={0} value={advance} onChange={e => setAdvance(Number(e.target.value))}
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>

                        {/* Live Calculator */}
                        {workerId && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', background: '#0f1117', borderRadius: '10px', padding: '1rem' }}>
                                {[
                                    { label: 'Daily Rate', value: fmt(dailyRate), color: '#22d3ee' },
                                    { label: 'OT Rate/hr', value: fmt(otRate), color: '#facc15' },
                                    { label: 'Gross Pay', value: fmt(gross), color: '#34d399' },
                                    { label: 'Net Payable', value: fmt(net), color: net < 0 ? '#f43f5e' : '#6366f1' },
                                ].map(k => (
                                    <div key={k.label} style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</p>
                                        <p style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.1rem', color: k.color }}>{k.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {net < 0 && <p style={{ color: '#f43f5e', fontSize: '0.82rem' }}>⚠ Net payable cannot be negative — reduce advance or increase days!</p>}

                        <div style={{ alignSelf: 'flex-end' }}><Button type="submit" disabled={net < 0}>Generate Sheet</Button></div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select value={filterFirm} onChange={e => setFilterFirm(e.target.value)}
                    style={{ padding: '0.65rem 1rem', background: '#0f1117', border: '1px solid #1f2235', borderRadius: '8px', color: '#fff' }}>
                    <option value="">All Firms</option>
                    {contractorFirms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input placeholder="Filter by month (e.g. Feb 2026)…" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                    style={{ padding: '0.65rem 1rem', background: '#0f1117', border: '1px solid #1f2235', borderRadius: '8px', color: '#fff', flex: 1, outline: 'none' }} />
            </div>

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <thead>
                        <tr style={{ background: '#0f1117', color: 'var(--text-muted)', textAlign: 'left' }}>
                            {['Sheet No', 'Contractor', 'Worker', 'Month', 'Days', 'OT Hrs', 'Gross', 'Advance', 'Net Payable', 'Status', ''].map(h => (
                                <th key={h} style={{ padding: '0.9rem 0.85rem', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.map(s => {
                            const firm = contractorFirms.find(f => f.id === s.firmId)
                            const worker = contractorWorkers.find(w => w.id === s.workerId)
                            return (
                                <tr key={s.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '0.8rem 0.85rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{s.sheetNo}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{firm?.name}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', fontWeight: 600 }}>{worker?.name}</td>
                                    <td style={{ padding: '0.8rem 0.85rem' }}>{s.month}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', textAlign: 'center' }}>{s.daysWorked}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', textAlign: 'center' }}>{s.otHours}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', fontFamily: 'var(--mono)', color: '#34d399' }}>{fmt(s.grossPay)}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', fontFamily: 'var(--mono)', color: '#f43f5e' }}>{fmt(s.advanceDeducted)}</td>
                                    <td style={{ padding: '0.8rem 0.85rem', fontFamily: 'var(--mono)', fontWeight: 700, color: '#6366f1' }}>{fmt(s.netPayable)}</td>
                                    <td style={{ padding: '0.8rem 0.85rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                                            background: `${STATUS_COLORS[s.status]}22`, color: STATUS_COLORS[s.status]
                                        }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem 0.85rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {s.status !== 'Paid' && (
                                                <Button variant="ghost" onClick={() => handleStatus(s.id, s.status)}>
                                                    {s.status === 'Draft' ? '✓ Approve' : '✓ Mark Paid'}
                                                </Button>
                                            )}
                                            <DownloadButton
                                                variant="voucher"
                                                onClick={() => downloadVoucherPdf({
                                                    type: 'Contractor Payslip',
                                                    voucherNo: s.sheetNo,
                                                    date: new Date().toISOString().substring(0, 10), // mock current date as generated date
                                                    partyName: worker?.name || 'Unknown',
                                                    amount: s.netPayable,
                                                    narration: `Payslip for ${s.month}. Worked: ${s.daysWorked} days, OT: ${s.otHours} hrs.`,
                                                    entries: [
                                                        { label: `Basic Pay (${s.daysWorked} days @ ${s.dailyRate}/day)`, debit: s.daysWorked * s.dailyRate, credit: 0 },
                                                        { label: `OT Pay (${s.otHours} hrs @ ${s.otRate}/hr)`, debit: s.otHours * s.otRate, credit: 0 },
                                                        { label: 'Advance Deducted', debit: 0, credit: s.advanceDeducted },
                                                        { label: 'TDS Deducted', debit: 0, credit: s.tdsDeducted },
                                                        { label: 'Net Payable', debit: 0, credit: s.netPayable },
                                                    ],
                                                    extras: {
                                                        'Contractor Firm': firm?.name || '—',
                                                        'Worker ID': worker?.workerId || '—',
                                                        'Payout Month': s.month,
                                                    }
                                                })}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {displayed.length === 0 && <tr><td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sheets found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
