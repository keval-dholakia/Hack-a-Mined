'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSalaryHead, updateSalaryHead, toggleSalaryHeadStatus } from '@/app/actions/hr'
import type { SalaryHead } from '@/types/hr'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './HR.module.scss'

type Props = { heads: SalaryHead[] }

export default function SalaryHeadMaster({ heads }: Props) {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [editHead, setEditHead] = useState<SalaryHead | null>(null)
    const [name, setName] = useState('')
    const [type, setType] = useState<'Earning' | 'Deduction'>('Earning')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'' | 'Earning' | 'Deduction'>('')

    const filtered = filter ? heads.filter(h => h.type === filter) : heads
    const earnings = heads.filter(h => h.type === 'Earning' && h.is_active === 1).length
    const deductions = heads.filter(h => h.type === 'Deduction' && h.is_active === 1).length

    function openNew() {
        setEditHead(null); setName(''); setType('Earning'); setError(null); setShowForm(true)
    }
    function openEdit(h: SalaryHead) {
        setEditHead(h); setName(h.name); setType(h.type); setError(null); setShowForm(true)
    }
    function cancel() { setShowForm(false); setEditHead(null) }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true); setError(null)
        const result = editHead
            ? await updateSalaryHead(editHead.id, name.trim(), type)
            : await createSalaryHead(name.trim(), type)
        setLoading(false)
        if (result.error) { setError(result.error); return }
        setShowForm(false); setEditHead(null)
    }

    async function handleToggle(id: number, is_active: number) {
        await toggleSalaryHeadStatus(id, is_active)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Salary Head Master</h1>
                    <p className={styles.subtitle}>Define salary components — {earnings} earnings, {deductions} deductions</p>
                </div>
                <div className={styles.headerRight}>
                    <Button variant="ghost" onClick={() => router.push('/dashboard/hr/salary-heads/analytics')}
                        style={{ color: '#22d3ee' }}>
                        ◎ Analytics
                    </Button>
                    <Button variant="ghost" onClick={openNew}>+ Add Head</Button>
                </div>
            </div>

            {/* Inline Create / Edit Form */}
            {showForm && (
                <Card title={editHead ? `Edit: ${editHead.name}` : 'New Salary Head'}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Component Name <span className={styles.req}>*</span></label>
                                <input
                                    placeholder="e.g. Basic, HRA, PF Deduction..."
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Type <span className={styles.req}>*</span></label>
                                <select value={type} onChange={e => setType(e.target.value as any)}>
                                    <option value="Earning">Earning</option>
                                    <option value="Deduction">Deduction</option>
                                </select>
                            </div>
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <div className={styles.footer} style={{ marginTop: '1rem' }}>
                            <Button variant="ghost" type="button" onClick={cancel}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : editHead ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Filter */}
            <div className={styles.searchBar}>
                {(['', 'Earning', 'Deduction'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '7px',
                            border: '1px solid #1f2235',
                            background: filter === f ? 'var(--accent)' : '#13151f',
                            color: filter === f ? '#fff' : 'var(--text-muted)',
                            fontFamily: 'inherit',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        {f === '' ? 'All' : f}s
                    </button>
                ))}
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'id', label: '#', render: (v) => String(filtered.findIndex(h => h.id === v) + 1) },
                        { key: 'name', label: 'Component Name' },
                        {
                            key: 'type', label: 'Type', align: 'c',
                            render: v => (
                                <span style={{
                                    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '5px',
                                    fontSize: '0.72rem', fontWeight: 700,
                                    background: v === 'Earning' ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)',
                                    color: v === 'Earning' ? '#34d399' : '#f43f5e',
                                }}>
                                    {v as string}
                                </span>
                            )
                        },
                        {
                            key: 'is_active', label: 'Status', align: 'c',
                            render: v => <Badge label={v === 1 ? 'Active' : 'Inactive'} variant={v === 1 ? 'success' : 'default'} />
                        },
                        {
                            key: 'id', label: 'Actions', align: 'c',
                            render: (v, row) => (
                                <div className={styles.actions}>
                                    <button className={styles.editBtn} onClick={() => openEdit(row as unknown as SalaryHead)}>Edit</button>
                                    <button className={styles.toggleBtn} onClick={() => handleToggle(v as number, row.is_active as number)}>
                                        {row.is_active === 1 ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            )
                        },
                    ]}
                    rows={filtered}
                />
            </Card>
        </div>
    )
}
