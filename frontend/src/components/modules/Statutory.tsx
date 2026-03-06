'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Tabs from '@/components/ui/Tabs';
import { BALANCE_SHEET_LINES, GST_RETURNS, TDS_TCS_ENTRIES } from '@/lib/statutoryData';
import styles from './Finance.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const fmtC = (v: number) => `INR ${Number(v).toLocaleString('en-IN')}`;
const fmtL = (v: number) => `INR ${(v / 100000).toFixed(2)}L`;

const STAT_TABS = ['Dashboard', 'GST', 'TDS/TCS', 'Balance Sheet'];

interface StatutoryProps {
    initialTab?: string;
}

const statusVariant = (status: string): BadgeVariant => {
    if (status === 'Filed') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Overdue') return 'danger';
    return 'default';
};

function StatDashboard() {
    const gstPayable = GST_RETURNS.filter(r => r.status !== 'Filed').reduce((sum, r) => sum + r.payable, 0);
    const tdsPayable = TDS_TCS_ENTRIES.filter(r => r.status !== 'Filed').reduce((sum, r) => sum + r.amount, 0);
    const upcomingCount = [...GST_RETURNS, ...TDS_TCS_ENTRIES].filter(r => r.status !== 'Filed').length;
    const totalAssets = BALANCE_SHEET_LINES.filter(r => r.group === 'Assets').reduce((sum, r) => sum + r.amount, 0);
    const totalLiabilities = BALANCE_SHEET_LINES.filter(r => r.group === 'Liabilities').reduce((sum, r) => sum + r.amount, 0);
    const netPosition = totalAssets - totalLiabilities;

    const complianceActions = [
        { text: 'GSTR-3B (May 2024) filing due on 20 Jun 2024', badge: 'Due Soon', variant: 'warning' as BadgeVariant },
        { text: 'TDS challan payment for May 2024 due on 07 Jun 2024', badge: 'Priority', variant: 'danger' as BadgeVariant },
        { text: 'TCS return reconciliation pending for May 2024', badge: 'Pending', variant: 'info' as BadgeVariant },
    ];

    const taxBars = [
        { label: 'Output GST', value: GST_RETURNS.reduce((sum, r) => sum + r.outputTax, 0), color: 'var(--red)' },
        { label: 'Input Credit', value: GST_RETURNS.reduce((sum, r) => sum + r.inputCredit, 0), color: 'var(--green)' },
        { label: 'TDS', value: TDS_TCS_ENTRIES.filter(r => r.kind === 'TDS').reduce((sum, r) => sum + r.amount, 0), color: 'var(--amber)' },
        { label: 'TCS', value: TDS_TCS_ENTRIES.filter(r => r.kind === 'TCS').reduce((sum, r) => sum + r.amount, 0), color: 'var(--accent)' },
    ];
    const maxTaxBar = Math.max(...taxBars.map(item => item.value), 1);

    return (
        <>
            <div className={styles.grid4}>
                <StatCard label="GST Payable" value={fmtL(gstPayable)} sub="current month provisional" />
                <StatCard label="TDS/TCS Payable" value={fmtL(tdsPayable)} sub="as per challan register" />
                <StatCard label="Open Compliance Items" value={upcomingCount.toString()} sub="pending filings/challans" />
                <StatCard
                    label="Net Position"
                    value={fmtL(netPosition)}
                    sub="assets minus liabilities"
                    trend={netPosition >= 0 ? 2.4 : -2.4}
                />
            </div>

            <div className={styles.grid2}>
                <Card title="Compliance Calendar">
                    {complianceActions.map((item, index) => (
                        <div key={index} className={styles.actionRow}>
                            <span style={{ color: 'var(--amber)', fontSize: 10 }}>●</span>
                            <div style={{ flex: 1, fontSize: 12.5 }}>{item.text}</div>
                            <Badge label={item.badge} variant={item.variant} />
                        </div>
                    ))}
                </Card>

                <Card title="Tax Position Overview">
                    {taxBars.map(bar => (
                        <div key={bar.label} className={styles.hbarWrap}>
                            <div className={styles.hbarLabel}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{bar.label}</span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{fmtC(bar.value)}</span>
                            </div>
                            <div className={styles.hbarTrack}>
                                <div
                                    className={styles.hbarFill}
                                    style={{ width: `${(bar.value / maxTaxBar) * 100}%`, background: bar.color }}
                                />
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}

function StatGST() {
    const outputTax = GST_RETURNS.reduce((sum, row) => sum + row.outputTax, 0);
    const inputCredit = GST_RETURNS.reduce((sum, row) => sum + row.inputCredit, 0);
    const payable = GST_RETURNS.reduce((sum, row) => sum + row.payable, 0);

    return (
        <>
            <div className={styles.grid3}>
                <StatCard label="Output Tax" value={fmtL(outputTax)} sub="across selected periods" />
                <StatCard label="Input Credit" value={fmtL(inputCredit)} sub="eligible ITC" />
                <StatCard label="Net GST Payable" value={fmtL(payable)} sub="post adjustment" />
            </div>
            <Card title="GST Returns & Ledger Entries" noPad action={<Button variant="primary" size="sm">+ New GST Entry</Button>}>
                <Table
                    columns={[
                        { key: 'returnType', label: 'Return' },
                        { key: 'period', label: 'Period' },
                        { key: 'dueDate', label: 'Due Date' },
                        { key: 'outputTax', label: 'Output Tax', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtC(v as number)}</span> },
                        { key: 'inputCredit', label: 'Input Credit', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmtC(v as number)}</span> },
                        { key: 'payable', label: 'Payable', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--red)' }}>{fmtC(v as number)}</span> },
                        { key: 'challan', label: 'Challan Ref', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'status', label: 'Status', align: 'c', render: v => <Badge label={v as string} variant={statusVariant(v as string)} /> },
                    ]}
                    rows={GST_RETURNS as unknown as Record<string, unknown>[]}
                />
            </Card>
        </>
    );
}

function StatTDSTCS() {
    const totalTds = TDS_TCS_ENTRIES.filter(row => row.kind === 'TDS').reduce((sum, row) => sum + row.amount, 0);
    const totalTcs = TDS_TCS_ENTRIES.filter(row => row.kind === 'TCS').reduce((sum, row) => sum + row.amount, 0);
    const pendingCount = TDS_TCS_ENTRIES.filter(row => row.status !== 'Filed').length;

    return (
        <>
            <div className={styles.grid3}>
                <StatCard label="TDS Amount" value={fmtL(totalTds)} sub="all open periods" />
                <StatCard label="TCS Amount" value={fmtL(totalTcs)} sub="all open periods" />
                <StatCard label="Pending Challans" value={pendingCount.toString()} sub="requires filing/payment" />
            </div>
            <Card title="TDS/TCS Challan Register" noPad action={<Button variant="primary" size="sm">+ New Challan</Button>}>
                <Table
                    columns={[
                        { key: 'challan', label: 'Challan No', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'kind', label: 'Type', render: v => <Badge label={v as string} variant={(v === 'TDS' ? 'info' : 'default') as BadgeVariant} /> },
                        { key: 'section', label: 'Section' },
                        { key: 'period', label: 'Period' },
                        { key: 'dueDate', label: 'Due Date' },
                        { key: 'deductees', label: 'Deductees', align: 'c' },
                        { key: 'amount', label: 'Amount', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(v as number)}</span> },
                        { key: 'status', label: 'Status', align: 'c', render: v => <Badge label={v as string} variant={statusVariant(v as string)} /> },
                    ]}
                    rows={TDS_TCS_ENTRIES as unknown as Record<string, unknown>[]}
                />
            </Card>
        </>
    );
}

function StatBalanceSheet() {
    const assets = BALANCE_SHEET_LINES.filter(row => row.group === 'Assets');
    const liabilities = BALANCE_SHEET_LINES.filter(row => row.group === 'Liabilities');
    const totalAssets = assets.reduce((sum, row) => sum + row.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, row) => sum + row.amount, 0);
    const difference = totalAssets - totalLiabilities;

    const summaryRows = [
        { head: 'Total Assets', amount: totalAssets, type: 'Assets' },
        { head: 'Total Liabilities', amount: totalLiabilities, type: 'Liabilities' },
        { head: 'Difference', amount: difference, type: 'Check' },
    ];

    return (
        <>
            <div className={styles.grid3}>
                <StatCard label="Total Assets" value={fmtL(totalAssets)} sub="as on reporting date" />
                <StatCard label="Total Liabilities" value={fmtL(totalLiabilities)} sub="as on reporting date" />
                <StatCard label="Balance Check" value={fmtL(difference)} sub="assets minus liabilities" trend={difference === 0 ? 0 : difference > 0 ? 1 : -1} />
            </div>
            <div className={styles.grid2}>
                <Card title="Assets">
                    {assets.map(row => (
                        <div key={row.head} className={styles.cashRow}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.head}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(row.amount)}</span>
                        </div>
                    ))}
                </Card>
                <Card title="Liabilities">
                    {liabilities.map(row => (
                        <div key={row.head} className={styles.cashRow}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.head}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmtC(row.amount)}</span>
                        </div>
                    ))}
                </Card>
            </div>
            <Card title="Balance Sheet Summary" noPad>
                <Table
                    columns={[
                        { key: 'head', label: 'Line Item' },
                        { key: 'type', label: 'Category', render: v => <Badge label={v as string} variant="default" /> },
                        {
                            key: 'amount',
                            label: 'Amount',
                            align: 'r',
                            render: (v, row) => (
                                <span
                                    style={{
                                        fontFamily: 'var(--mono)',
                                        fontWeight: 700,
                                        color: (row as { type: string }).type === 'Check'
                                            ? ((v as number) === 0 ? 'var(--green)' : 'var(--amber)')
                                            : 'inherit',
                                    }}
                                >
                                    {fmtC(v as number)}
                                </span>
                            ),
                        },
                    ]}
                    rows={summaryRows as unknown as Record<string, unknown>[]}
                />
            </Card>
        </>
    );
}

export default function Statutory({ initialTab }: StatutoryProps) {
    const [activeTab, setActiveTab] = useState(
        () => (initialTab && STAT_TABS.includes(initialTab) ? initialTab : 'Dashboard'),
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard': return <StatDashboard />;
            case 'GST': return <StatGST />;
            case 'TDS/TCS': return <StatTDSTCS />;
            case 'Balance Sheet': return <StatBalanceSheet />;
            default: return null;
        }
    };

    return (
        <>
            <PageHeader
                title="Statutory Management"
                description="GST, TDS/TCS filings and balance sheet compliance tracking"
                actions={<Button variant="secondary">Export</Button>}
            />
            <Tabs tabs={STAT_TABS} active={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </>
    );
}

