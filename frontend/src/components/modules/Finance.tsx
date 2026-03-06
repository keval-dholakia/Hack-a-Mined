'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Tabs from '@/components/ui/Tabs';
import {
    JOURNALS, VOUCHERS, CONTRAS, GST_VOUCHERS, BANK_RECON, CREDIT_CARDS,
} from '@/lib/financeData';
import styles from './Finance.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const fmtC = (v: number) => `₹${Number(v).toLocaleString('en-IN')}`;
const fmtL = (v: number) => `₹${(v / 100000).toFixed(2)}L`;

const FIN_TABS = ['Dashboard', 'Voucher Journal', 'Payment & Receipt', 'Contra', 'GST Entries', 'Bank Recon', 'Credit Cards'];

// ─── Finance Dashboard ────────────────────────────────────
function FinDashboard() {
    const CASH_FLOW = [
        { label: 'Opening Balance', value: 2100000, color: 'var(--text-muted)' },
        { label: 'Receipts MTD', value: 985000, color: 'var(--green)' },
        { label: 'Payments MTD', value: 621000, color: 'var(--red)' },
        { label: 'Closing Balance', value: 2464000, color: 'var(--accent)' },
    ];
    const ACTIONS = [
        { color: 'var(--red)', text: 'Bank recon pending — HDFC Jun 2024', badge: 'Overdue', bv: 'danger' },
        { color: 'var(--amber)', text: '3 supplier payments due this week', badge: 'Due Soon', bv: 'warning' },
        { color: 'var(--amber)', text: 'GST payment — ₹1.24L payable by 20 Jun', badge: 'Due Soon', bv: 'warning' },
        { color: 'var(--accent)', text: 'TDS filing — May 2024 pending', badge: 'Upcoming', bv: 'info' },
    ];
    return (
        <>
            <div className={styles.grid4}>
                <StatCard label="Bank Balance" value="₹28.4L" sub="HDFC Current" trend={3.2} />
                <StatCard label="Receipts MTD" value="₹9.85L" sub="total received" trend={8.1} />
                <StatCard label="Payments MTD" value="₹6.21L" sub="total paid out" trend={-2.4} />
                <StatCard label="Outstanding GST" value="₹1.24L" sub="payable this month" />
            </div>
            <div className={styles.grid2}>
                <Card title="Cash Flow Summary">
                    {CASH_FLOW.map((item, i) => (
                        <div key={item.label} className={styles.cashRow} style={{ borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 80, height: 3, background: 'var(--bg-active)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ width: `${(item.value / 2464000) * 100}%`, height: '100%', background: item.color, borderRadius: 2 }} />
                                </div>
                                <span style={{ fontFamily: 'var(--mono)', fontWeight: i === 3 ? 700 : 500, fontSize: i === 3 ? 14 : 13, color: item.color }}>{fmtL(item.value)}</span>
                            </div>
                        </div>
                    ))}
                </Card>
                <Card title="Pending Actions">
                    {ACTIONS.map((a, i) => (
                        <div key={i} className={styles.actionRow}>
                            <span style={{ color: a.color, fontSize: 10 }}>●</span>
                            <div style={{ flex: 1, fontSize: 12.5 }}>{a.text}</div>
                            <Badge label={a.badge} variant={a.bv as BadgeVariant} />
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}

// ─── Voucher Journal Tab ──────────────────────────────────
function FinJournal() {
    return (
        <Card title="Journal Vouchers" noPad action={<Button variant="primary" size="sm">+ New Journal</Button>}>
            <Table
                columns={[
                    { key: 'no', label: 'Voucher No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                    { key: 'date', label: 'Date' },
                    { key: 'debit', label: 'Debit Account', render: v => <span style={{ color: 'var(--green)' }}>Dr — {v as string}</span> },
                    { key: 'credit', label: 'Credit Account', render: v => <span style={{ color: 'var(--red)' }}>Cr — {v as string}</span> },
                    { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                    { key: 'narration', label: 'Narration', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v as string}</span> },
                ]}
                rows={JOURNALS}
            />
        </Card>
    );
}

// ─── Payment & Receipt Tab ────────────────────────────────
function FinVouchers() {
    const tPay = VOUCHERS.filter(v => v.type === 'Payment').reduce((s, v) => s + v.amount, 0);
    const tRec = VOUCHERS.filter(v => v.type === 'Receipt').reduce((s, v) => s + v.amount, 0);
    return (
        <>
            <div className={styles.grid3}>
                <StatCard label="Total Payments" value={fmtL(tPay)} sub="this month" />
                <StatCard label="Total Receipts" value={fmtL(tRec)} sub="this month" />
                <StatCard label="Net Cash Flow" value={fmtL(tRec - tPay)} sub="receipts − payments" trend={5.2} />
            </div>
            <Card title="Payment & Receipt Vouchers" noPad action={<Button variant="primary" size="sm">+ New Voucher</Button>}>
                <Table
                    columns={[
                        { key: 'no', label: 'Voucher No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'type', label: 'Type', render: v => <Badge label={v as string} variant={(v === 'Receipt' ? 'success' : 'info') as BadgeVariant} /> },
                        { key: 'date', label: 'Date' },
                        { key: 'party', label: 'Party', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        {
                            key: 'amount', label: 'Amount', align: 'r',
                            render: (v, row) => <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: (row as { type: string }).type === 'Receipt' ? 'var(--green)' : 'var(--red)' }}>
                                {(row as { type: string }).type === 'Receipt' ? '+' : '−'}{fmtC(v as number)}
                            </span>
                        },
                        { key: 'mode', label: 'Mode', render: v => <Badge label={v as string} variant="default" /> },
                        { key: 'ref', label: 'Ref No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>{v as string}</span> },
                        { key: 'bank', label: 'Bank A/c', render: v => <span style={{ fontSize: 12 }}>{v as string}</span> },
                    ]}
                    rows={VOUCHERS}
                />
            </Card>
        </>
    );
}

// ─── Contra Tab ───────────────────────────────────────────
function FinContra() {
    return (
        <Card title="Contra Entries" noPad action={<Button variant="primary" size="sm">+ New Contra</Button>}>
            <Table
                columns={[
                    { key: 'no', label: 'Contra No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                    { key: 'date', label: 'Date' },
                    { key: 'from', label: 'From Account', render: v => <span style={{ color: 'var(--red)' }}>← {v as string}</span> },
                    { key: 'to', label: 'To Account', render: v => <span style={{ color: 'var(--green)' }}>→ {v as string}</span> },
                    { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                    { key: 'purpose', label: 'Purpose' },
                ]}
                rows={CONTRAS}
            />
        </Card>
    );
}

// ─── GST Entries Tab ──────────────────────────────────────
function FinGST() {
    const adjVariant = (t: string): BadgeVariant =>
        t === 'Reversal' ? 'danger' : t === 'Claim' ? 'success' : t === 'Adjustment' ? 'warning' : 'default';
    return (
        <Card title="GST Journal Entries" noPad action={<Button variant="primary" size="sm">+ New GST Entry</Button>}>
            <Table
                columns={[
                    { key: 'no', label: 'Voucher No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                    { key: 'date', label: 'Date' },
                    { key: 'ledger', label: 'GST Ledger', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                    { key: 'adjType', label: 'Adjustment', render: v => <Badge label={v as string} variant={adjVariant(v as string)} /> },
                    { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                    { key: 'remark', label: 'Remark', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v as string}</span> },
                ]}
                rows={GST_VOUCHERS}
            />
        </Card>
    );
}

// ─── Bank Recon Tab ───────────────────────────────────────
function FinRecon() {
    const BANK_BAL = 2842500, BOOK_BAL = 2814300, DIFF = 28200;
    const statusVariant = (s: string): BadgeVariant =>
        s === 'Matched' ? 'success' : s === 'In Transit' ? 'warning' : 'info';
    return (
        <>
            {/* Account selector */}
            <Card>
                <div className={styles.reconHeader}>
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Bank Account</div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>HDFC Current A/c — ···4521</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Statement Date</div>
                        <div style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>05 Jun 2024</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        <Button variant="secondary" size="sm">Change Account</Button>
                        <Button variant="primary" size="sm">Mark Reconciled</Button>
                    </div>
                </div>
            </Card>

            {/* Balance cards */}
            <div className={styles.grid3}>
                {[
                    { label: 'BANK BALANCE (Statement)', val: BANK_BAL, color: 'var(--green)', note: null },
                    { label: 'BOOK BALANCE (System)', val: BOOK_BAL, color: 'var(--accent)', note: null },
                    { label: 'UNRECONCILED DIFFERENCE', val: DIFF, color: 'var(--amber)', note: 'Requires attention' },
                ].map(b => (
                    <div key={b.label} className={styles.balanceCard} style={{ borderLeft: `3px solid ${b.color}` }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{b.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color: b.color }}>{fmtC(b.val)}</div>
                        {b.note && <div style={{ fontSize: 11, color: b.color, marginTop: 4 }}>{b.note}</div>}
                    </div>
                ))}
            </div>

            <Card title="Transaction Matching" noPad>
                <Table
                    columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'desc', label: 'Description', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        {
                            key: 'bankAmt', label: 'Bank Amount', align: 'r',
                            render: v => v != null
                                ? <span style={{ fontFamily: 'var(--mono)', color: (v as number) >= 0 ? 'var(--green)' : 'var(--red)' }}>{(v as number) >= 0 ? '+' : ''}{fmtC(v as number)}</span>
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        },
                        {
                            key: 'bookAmt', label: 'Book Amount', align: 'r',
                            render: v => v != null
                                ? <span style={{ fontFamily: 'var(--mono)', color: (v as number) >= 0 ? 'var(--green)' : 'var(--red)' }}>{(v as number) >= 0 ? '+' : ''}{fmtC(v as number)}</span>
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        },
                        { key: 'status', label: 'Status', align: 'c', render: v => <Badge label={v as string} variant={statusVariant(v as string)} /> },
                    ]}
                    rows={BANK_RECON}
                />
            </Card>
        </>
    );
}

// ─── Credit Cards Tab ─────────────────────────────────────
function FinCards() {
    const total = CREDIT_CARDS.reduce((s, c) => s + c.amount, 0);
    const byHead: Record<string, number> = {};
    CREDIT_CARDS.forEach(c => { byHead[c.head] = (byHead[c.head] || 0) + c.amount; });
    const maxH = Math.max(...Object.values(byHead));
    const COLORS = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--red)', 'var(--text-muted)'];

    return (
        <div className={styles.grid2}>
            <Card title="Credit Card Transactions — May 2024" noPad
                action={<Button variant="primary" size="sm">+ Add Transaction</Button>}
            >
                <Table
                    columns={[
                        { key: 'card', label: 'Card', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{v as string}</span> },
                        { key: 'date', label: 'Date' },
                        { key: 'merchant', label: 'Merchant', render: v => <span style={{ fontWeight: 500 }}>{v as string}</span> },
                        { key: 'head', label: 'Category', render: v => <Badge label={v as string} variant="default" /> },
                        { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, color: 'var(--red)' }}>−{fmtC(v as number)}</span> },
                    ]}
                    rows={CREDIT_CARDS}
                />
                <div className={styles.cardTotal}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Total Spend</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14, color: 'var(--red)' }}>−{fmtC(total)}</span>
                </div>
            </Card>

            <Card title="Spend by Category">
                {Object.entries(byHead).sort(([, a], [, b]) => b - a).map(([head, val], i) => (
                    <div key={head} className={styles.hbarWrap}>
                        <div className={styles.hbarLabel}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{head}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{fmtC(val)}</span>
                        </div>
                        <div className={styles.hbarTrack}>
                            <div className={styles.hbarFill} style={{ width: `${(val / maxH) * 100}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                    </div>
                ))}
                <div className={styles.spendTotal}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Total</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{fmtC(total)}</span>
                </div>
            </Card>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────
export default function Finance() {
    const [activeTab, setActiveTab] = useState('Dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return <FinDashboard />;
            case 'Voucher Journal': return <FinJournal />;
            case 'Payment & Receipt': return <FinVouchers />;
            case 'Contra': return <FinContra />;
            case 'GST Entries': return <FinGST />;
            case 'Bank Recon': return <FinRecon />;
            case 'Credit Cards': return <FinCards />;
            default: return null;
        }
    };

    return (
        <>
            <PageHeader
                title="Finance Management"
                description="Vouchers, reconciliation, GST entries & expense tracking"
                actions={<Button variant="secondary" icon="⬇">Export</Button>}
            />
            <Tabs tabs={FIN_TABS} active={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </>
    );
}
