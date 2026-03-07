'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { fetchBankRecon, fetchAccounts, updateBankRecon, BankReconLine, Account } from '@/data/financeMock'

export default function BankReconPage() {
    const router = useRouter()
    const [lines, setLines] = useState<BankReconLine[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(false)

    // Editor state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draftBankBal, setDraftBankBal] = useState<string>('')

    useEffect(() => { load() }, [])

    async function load() {
        const br = await fetchBankRecon()
        setLines(br)
        const ac = await fetchAccounts()
        setAccounts(ac)
    }

    async function handleSave(id: string) {
        setLoading(true)
        await updateBankRecon(id, Number(draftBankBal))
        setLoading(false)
        setEditingId(null)
        setDraftBankBal('')
        load()
    }

    const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Bank Reconciliation</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Match system balances against actual bank statements</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Bank Reconciliation Statement',
                        subtitle: `${lines.length} reconciliation records`,
                        columns: [
                            { header: 'Bank Account', dataKey: 'bankName' },
                            { header: 'Statement Date', dataKey: 'statementDate' },
                            { header: 'Status', dataKey: 'status' },
                            { header: 'System Balance', dataKey: 'systemBalance', format: 'currency', align: 'right' },
                            { header: 'Bank Balance', dataKey: 'bankBalance', format: 'currency', align: 'right' },
                            { header: 'Unreconciled', dataKey: 'unreconciledAmount', format: 'currency', align: 'right' },
                        ],
                        rows: lines.map(line => ({
                            ...line,
                            bankName: accounts.find(a => a.id === line.bankAccountId)?.name || 'Unknown'
                        })),
                        fileName: 'Bank_Reconciliation_Statement'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/finance/bank-recon/analytics')}>
                        ◎ Analytics
                    </Button>
                </div>
            </div>

            <Card style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235', color: 'var(--text-muted)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Bank Account</th>
                            <th style={{ padding: '1rem' }}>Statement Date</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>System Balance</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Bank Balance</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Unreconciled</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map(line => {
                            const acc = accounts.find(a => a.id === line.bankAccountId)?.name || 'Unknown'
                            const isEditing = editingId === line.id
                            return (
                                <tr key={line.id} style={{ borderBottom: '1px solid #1a1d27' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{acc}</td>
                                    <td style={{ padding: '1rem' }}>{line.statementDate}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                            background: line.status === 'Reconciled' ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.1)',
                                            color: line.status === 'Reconciled' ? '#34d399' : '#facc15'
                                        }}>
                                            {line.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)', color: '#22d3ee' }}>
                                        {fmt(line.systemBalance)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={draftBankBal}
                                                onChange={e => setDraftBankBal(e.target.value)}
                                                style={{ width: '100px', padding: '0.4rem', background: '#0f1117', border: '1px solid #1f2235', color: '#fff', borderRadius: '4px', textAlign: 'right' }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span style={{ fontFamily: 'var(--mono)' }}>{fmt(line.bankBalance)}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'var(--mono)', color: line.unreconciledAmount === 0 ? '#34d399' : '#f43f5e' }}>
                                        {line.unreconciledAmount === 0 ? '₹0' : fmt(line.unreconciledAmount)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <Button onClick={() => handleSave(line.id)} disabled={loading}>Save</Button>
                                                <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" onClick={() => { setEditingId(line.id); setDraftBankBal(line.bankBalance.toString()) }}>
                                                Edit Statement Bal
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {lines.length === 0 && (
                            <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No banking statments found pending reconciliation.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
