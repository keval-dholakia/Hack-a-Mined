'use client'

import { useState } from 'react'
import { contractorWorkers, contractorFirms, contractorStructures, contractorRoles, addWorker, ContractorWorker } from '@/data/contractorMock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

const SKILL = ['Skilled', 'Semi-Skilled', 'Unskilled'] as const

export default function ContractorWorkersPage() {
    const router = useRouter()
    const [workers, setWorkers] = useState([...contractorWorkers])
    const [firms] = useState([...contractorFirms])
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [filterFirm, setFilterFirm] = useState('')

    // Form
    const [firmId, setFirmId] = useState('')
    const [name, setName] = useState('')
    const [workerId, setWorkerId] = useState('')
    const [skill, setSkill] = useState<ContractorWorker['skillLevel']>('Skilled')
    const [aadhar, setAadhar] = useState('')
    const [trade, setTrade] = useState('')

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        addWorker({ firmId, name, workerId, skillLevel: skill, aadhar, trade })
        setWorkers([...contractorWorkers])
        setShowForm(false)
        setFirmId(''); setName(''); setWorkerId(''); setAadhar(''); setTrade('')
    }

    const skillColor = (s: string) =>
        s === 'Skilled' ? '#34d399' : s === 'Semi-Skilled' ? '#facc15' : '#94a3b8'

    const displayed = workers.filter(w => {
        const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.workerId.toLowerCase().includes(search.toLowerCase())
        const matchFirm = filterFirm ? w.firmId === filterFirm : true
        return matchSearch && matchFirm
    })

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Contractor Workers</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Register and manage contract labour across firms</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Contractor Worker Register',
                        subtitle: `${displayed.length} workers registered`,
                        columns: [
                            { header: 'Worker ID', dataKey: 'workerId' },
                            { header: 'Name', dataKey: 'name' },
                            { header: 'Contractor Firm', dataKey: 'firm_name' },
                            { header: 'Trade', dataKey: 'trade' },
                            { header: 'Skill Level', dataKey: 'skillLevel' },
                            { header: 'Aadhar No.', dataKey: 'aadhar' },
                        ],
                        rows: displayed.map(w => ({
                            ...w,
                            firm_name: firms.find(f => f.id === w.firmId)?.name || '—',
                        })),
                        fileName: 'Contractor_Worker_Register'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/contractors/workers/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Register Worker'}
                    </Button>
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Workers', value: workers.length, color: '#6366f1' },
                    { label: 'Skilled', value: workers.filter(w => w.skillLevel === 'Skilled').length, color: '#34d399' },
                    { label: 'Semi-Skilled', value: workers.filter(w => w.skillLevel === 'Semi-Skilled').length, color: '#facc15' },
                    { label: 'Unskilled', value: workers.filter(w => w.skillLevel === 'Unskilled').length, color: '#94a3b8' },
                ].map(k => (
                    <div key={k.label} style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '0.25rem' }}>{k.label}</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--mono)', color: k.color, margin: 0 }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <Card title="Register New Contract Worker" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {[
                                { label: 'Worker ID', val: workerId, set: setWorkerId, ph: 'CW-009' },
                                { label: 'Worker Name', val: name, set: setName, ph: 'Full Name' },
                                { label: 'Trade / Specialization', val: trade, set: setTrade, ph: 'Welding, Fitting…' },
                                { label: 'Aadhar No.', val: aadhar, set: setAadhar, ph: 'XXXX XXXX XXXX' },
                            ].map(f => (
                                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.label}</label>
                                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required
                                        style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }} />
                                </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contractor Firm</label>
                                <select value={firmId} onChange={e => setFirmId(e.target.value)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    <option value="">Select Firm</option>
                                    {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Skill Level</label>
                                <select value={skill} onChange={e => setSkill(e.target.value as any)} required
                                    style={{ padding: '0.7rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '6px' }}>
                                    {SKILL.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}><Button type="submit">Register Worker</Button></div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input placeholder="Search name / worker ID…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem 1rem', background: '#0f1117', border: '1px solid #1f2235', borderRadius: '8px', color: '#fff', outline: 'none' }} />
                <select value={filterFirm} onChange={e => setFilterFirm(e.target.value)}
                    style={{ padding: '0.65rem 1rem', background: '#0f1117', border: '1px solid #1f2235', borderRadius: '8px', color: '#fff' }}>
                    <option value="">All Firms</option>
                    {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                        <tr style={{ background: '#0f1117', color: 'var(--text-muted)', textAlign: 'left' }}>
                            {['Worker ID', 'Name', 'Contractor Firm', 'Trade', 'Skill Level', 'Aadhar No.'].map(h => (
                                <th key={h} style={{ padding: '0.9rem 1rem', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.map(w => (
                            <tr key={w.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: '#22d3ee' }}>{w.workerId}</td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{w.name}</td>
                                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{firms.find(f => f.id === w.firmId)?.name || '—'}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>{w.trade}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                                        background: `${skillColor(w.skillLevel)}22`, color: skillColor(w.skillLevel)
                                    }}>
                                        {w.skillLevel}
                                    </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{w.aadhar}</td>
                            </tr>
                        ))}
                        {displayed.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No workers found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
