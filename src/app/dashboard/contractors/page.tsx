import { contractorFirms, contractorWorkers, contractorSheets, contractorPayments, contractorAdvances } from '@/data/contractorMock'
import Link from 'next/link'

export default function ContractorsDashboard() {
    const paid = contractorSheets.filter(s => s.status === 'Paid')
    const approved = contractorSheets.filter(s => s.status === 'Approved')
    const draft = contractorSheets.filter(s => s.status === 'Draft')
    const totalPaid = contractorPayments.reduce((s, p) => s + p.netAmountPaid, 0)
    const outstandingAdv = contractorAdvances.filter(a => !a.recovered).reduce((s, a) => s + a.amount, 0)
    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

    const kpis = [
        { label: 'Contractor Firms', value: contractorFirms.length, color: '#6366f1', href: '/dashboard/contractors/workers' },
        { label: 'Total Workers', value: contractorWorkers.length, color: '#22d3ee', href: '/dashboard/contractors/workers' },
        { label: 'Sheets — Draft', value: draft.length, color: '#facc15', href: '/dashboard/contractors/salary-sheet' },
        { label: 'Sheets — Approved', value: approved.length, color: '#a78bfa', href: '/dashboard/contractors/salary-sheet' },
        { label: 'Sheets — Paid', value: paid.length, color: '#34d399', href: '/dashboard/contractors/salary-sheet' },
        { label: 'Total Payments', value: fmt(totalPaid), color: '#34d399', href: '/dashboard/contractors/payments' },
        { label: 'Outstanding Advances', value: fmt(outstandingAdv), color: outstandingAdv > 0 ? '#f43f5e' : '#34d399', href: '/dashboard/contractors/advance-memo' },
    ]

    const QuickLink = ({ href, label }: { href: string; label: string }) => (
        <Link href={href} style={{
            display: 'block', padding: '0.9rem 1.2rem', background: '#13151f', border: '1px solid #1f2235', borderRadius: '10px',
            color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 600,
            transition: 'border-color 0.2s, transform 0.15s'
        }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1f2235'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            → {label}
        </Link>
    )

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Contractors Overview</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Manage contract labour across {contractorFirms.length} firms — wages, advances and payments
                </p>
            </div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {kpis.map(k => (
                    <Link href={k.href} key={k.label} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#13151f', border: `1px solid #1f2235`, borderRadius: '10px', padding: '0.9rem 1.1rem', transition: 'transform 0.15s, border-color 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = k.color }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = '#1f2235' }}>
                            <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, marginBottom: '0.25rem' }}>{k.label}</p>
                            <p style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--mono)', color: k.color, margin: 0 }}>{k.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Firm Summary */}
                <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', padding: '1.2rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contractor Firms</h3>
                    {contractorFirms.map(firm => {
                        const fw = contractorWorkers.filter(w => w.firmId === firm.id)
                        const fPaid = contractorPayments.filter(p => p.firmId === firm.id).reduce((s, p) => s + p.netAmountPaid, 0)
                        return (
                            <div key={firm.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #1a1d27' }}>
                                <p style={{ fontWeight: 600, margin: 0 }}>{firm.name}</p>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.3rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#22d3ee' }}>{fw.length} Workers</span>
                                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Paid: {fmt(fPaid)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Navigation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <QuickLink href="/dashboard/contractors/workers" label="Register Contract Worker" />
                        <QuickLink href="/dashboard/contractors/roles" label="Define Salary Head Rates" />
                        <QuickLink href="/dashboard/contractors/salary-structure" label="Map Worker to Role" />
                        <QuickLink href="/dashboard/contractors/salary-sheet" label="Generate Salary Sheet" />
                        <QuickLink href="/dashboard/contractors/advance-memo" label="Issue Advance Memo" />
                        <QuickLink href="/dashboard/contractors/payments" label="Post Payment Voucher" />
                    </div>
                </div>
            </div>
        </div>
    )
}
