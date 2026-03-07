'use client'

import { useState } from 'react'
import { contractorWorkers, contractorStructures, contractorRoles, contractorFirms, addStructure } from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ContractorStructurePage() {
    const [structures, setStructures] = useState([...contractorStructures])
    const [showForm, setShowForm] = useState(false)
    const [workerId, setWorkerId] = useState('')
    const [roleId, setRoleId] = useState('')
    const [dailyRate, setDailyRate] = useState<number | ''>('')

    const selectedRole = contractorRoles.find(r => r.id === roleId)

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        addStructure({ workerId, roleId, dailyRate: Number(dailyRate) || selectedRole?.dailyRate || 0 })
        setStructures([...contractorStructures])
        setShowForm(false)
        setWorkerId(''); setRoleId(''); setDailyRate('')
    }

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

    const enriched = structures.map(s => ({
        ...s,
        worker: contractorWorkers.find(w => w.id === s.workerId),
        role: contractorRoles.find(r => r.id === s.roleId),
    }))

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Salary Structure</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Map each worker to a role with applicable daily rates</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Map Worker'}</Button>
            </div>

            {showForm && (
                <Card title="Map Worker to Role" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Worker</label>
                                <select value={workerId} onChange={e => setWorkerId(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Worker</option>
                                    {contractorWorkers.map(w => <option key={w.id} value={w.id}>{w.workerId} — {w.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Role</label>
                                <select value={roleId} onChange={e => { setRoleId(e.target.value); const r = contractorRoles.find(x => x.id === e.target.value); setDailyRate(r?.dailyRate ?? '') }} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Role</option>
                                    {contractorRoles.map(r => <option key={r.id} value={r.id}>{r.role}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Applicable Daily Rate (auto-filled from role)</label>
                                <input type="number" value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        </div>
                        {selectedRole && (
                            <p style={{ fontSize: '0.78rem', color: '#facc15' }}>OT Rate for {selectedRole.role}: {fmt(selectedRole.otRate)}/hr</p>
                        )}
                        <div style={{ alignSelf: 'flex-end' }}><Button type="submit">Save Structure</Button></div>
                    </form>
                </Card>
            )}

            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                        <tr style={{ background: '#0f1117', color: 'var(--text-muted)', textAlign: 'left' }}>
                            {['Worker ID', 'Worker Name', 'Firm', 'Role', 'Daily Rate', 'OT Rate/hr'].map(h => (
                                <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {enriched.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{s.worker?.workerId}</td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{s.worker?.name}</td>
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{contractorFirms.find(f => f.id === s.worker?.firmId)?.name}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>{s.role?.role}</td>
                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#34d399' }}>{fmt(s.dailyRate)}</td>
                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#facc15' }}>{fmt(s.role?.otRate ?? 0)}</td>
                            </tr>
                        ))}
                        {enriched.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No structures defined</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
