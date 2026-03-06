'use client'

import { useState } from 'react'
import { contractorRoles, ContractorRole } from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function ContractorRolesPage() {
    const [roles, setRoles] = useState([...contractorRoles])
    const [showForm, setShowForm] = useState(false)
    const [role, setRole] = useState('')
    const [daily, setDaily] = useState<number | ''>('')
    const [ot, setOt] = useState<number | ''>('')

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        const n: ContractorRole = { id: `r${Date.now()}`, role, dailyRate: Number(daily), otRate: Number(ot) }
        contractorRoles.push(n)
        setRoles([...contractorRoles])
        setShowForm(false)
        setRole(''); setDaily(''); setOt('')
    }

    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Salary Head Master</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Define role-wise daily rates and overtime rates for contract labour</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Role'}</Button>
            </div>

            {showForm && (
                <Card title="Define New Role Rate" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Role Name', val: role, set: setRole as any, ph: 'e.g. Helper, Welder', type: 'text' },
                            { label: 'Daily Rate (₹)', val: daily, set: setDaily as any, ph: '750', type: 'number' },
                            { label: 'Overtime Rate per Hour (₹)', val: ot, set: setOt as any, ph: '110', type: 'number' },
                        ].map(f => (
                            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '180px' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.label}</label>
                                <input type={f.type} value={f.val as any} onChange={e => f.set(f.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={f.ph} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}><Button type="submit">Save Rate</Button></div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                {roles.map(r => (
                    <div key={r.id} style={{
                        background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', padding: '1.2rem 1.4rem',
                        transition: 'transform 0.2s', cursor: 'default'
                    }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>{r.role}</p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Daily Rate</p>
                                <p style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: '#34d399', fontSize: '1.15rem' }}>{fmt(r.dailyRate)}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>OT Rate / Hr</p>
                                <p style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: '#facc15', fontSize: '1.15rem' }}>{fmt(r.otRate)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
