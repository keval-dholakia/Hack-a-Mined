'use client';

import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

const STATUS_TYPES: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
    Pending: 'warning', Dispatched: 'info', Closed: 'success', New: 'default',
};

const TREND_DATA = [
    { label: 'Sales', data: [12, 18, 14, 22, 19, 28, 24], color: 'var(--accent)', val: '₹24L' },
    { label: 'Purchase', data: [8, 12, 10, 15, 13, 18, 16], color: 'var(--green)', val: '₹16L' },
    { label: 'Production', data: [5, 8, 7, 10, 9, 12, 11], color: 'var(--amber)', val: '₹11L' },
];

const MODULE_STATUS = [
    { name: 'Sales', val: 78, color: 'var(--accent)' },
    { name: 'Purchase', val: 55, color: 'var(--green)' },
    { name: 'Production', val: 91, color: 'var(--amber)' },
    { name: 'Quality', val: 64, color: 'var(--red)' },
];

const ALERTS = [
    { type: 'danger', msg: 'Low stock: Steel Rod — only 12 units remaining', time: '2m ago' },
    { type: 'warning', msg: 'Payment overdue: Sharma Traders — ₹1,24,500', time: '18m ago' },
    { type: 'info', msg: 'GRN #GRN-2024-089 pending IQC approval', time: '1h ago' },
    { type: 'success', msg: 'Route Card RC-441 closed successfully', time: '2h ago' },
];

const DOT_COLORS: Record<string, string> = {
    danger: 'var(--red)', warning: 'var(--amber)', info: 'var(--accent)', success: 'var(--green)',
};

function SparkLine({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data
        .map((v, i) => `${(i / (data.length - 1)) * 120},${40 - ((v - min) / (max - min || 1)) * 40}`)
        .join(' ');
    return (
        <svg width={120} height={40}>
            <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" points={pts} />
        </svg>
    );
}

export default function Dashboard() {
    const router = useRouter();

    const soRows = [
        { id: 'SO-2024-112', customer: 'Maruti Suzuki Ltd', value: '₹4,82,000', status: 'Pending', date: '05 Jun' },
        { id: 'SO-2024-111', customer: 'Tata Motors', value: '₹2,10,500', status: 'Dispatched', date: '04 Jun' },
        { id: 'SO-2024-110', customer: 'Hero MotoCorp', value: '₹88,000', status: 'Closed', date: '03 Jun' },
        { id: 'SO-2024-109', customer: 'Bajaj Auto', value: '₹3,60,000', status: 'Pending', date: '02 Jun' },
    ];

    return (
        <>
            {/* Stat Grid */}
            <div className={styles.statGrid}>
                <StatCard label="Revenue MTD" value="₹28.4L" trend={12.3} sub="vs last month" />
                <StatCard label="Open Orders" value="34" trend={-4.1} sub="sale orders" />
                <StatCard label="Production Qty" value="1,240" trend={8.7} sub="units this week" />
                <StatCard label="Pending Payments" value="₹6.2L" trend={-2.1} sub="overdue" />
            </div>

            {/* Row 2: Trend + Module Status + Quick Actions */}
            <div className={styles.row3}>
                <Card title="Revenue Trend">
                    <div className={styles.trendList}>
                        {TREND_DATA.map(t => (
                            <div key={t.label} className={styles.trendRow}>
                                <span className={styles.trendLabel}>{t.label}</span>
                                <SparkLine data={t.data} color={t.color} />
                                <span className={styles.trendVal}>{t.val}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Module Status">
                    <div className={styles.modList}>
                        {MODULE_STATUS.map(m => (
                            <div key={m.name} className={styles.modRow}>
                                <span className={styles.modLabel}>{m.name}</span>
                                <div className="mini-bar">
                                    <div className="mini-bar-fill" style={{ width: `${m.val}%`, background: m.color }} />
                                </div>
                                <span className={styles.modPct}>{m.val}%</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Quick Actions">
                    <div className={styles.quickList}>
                        {[['New Inquiry', '/sales'], ['New PO', '/purchase'], ['New Route Card', '/production'], ['New Invoice', '/sales']].map(([l, p]) => (
                            <Button key={l} variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' } as React.CSSProperties} onClick={() => router.push(p)}>
                                {l}
                            </Button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Row 3: Recent Orders + Alerts */}
            <div className={styles.row2}>
                <Card
                    title="Recent Sale Orders"
                    noPad
                    action={<span className={styles.viewAll} onClick={() => router.push('/sales')}>View all →</span>}
                >
                    <Table
                        columns={[
                            { key: 'id', label: 'Order ID' },
                            { key: 'customer', label: 'Customer' },
                            { key: 'value', label: 'Value', align: 'r' },
                            { key: 'date', label: 'Date', align: 'c' },
                            { key: 'status', label: 'Status', align: 'c', render: v => <Badge label={v as string} variant={STATUS_TYPES[v as string]} /> },
                        ]}
                        rows={soRows}
                    />
                </Card>

                <Card title="System Alerts">
                    {ALERTS.map((a, i) => (
                        <div key={i} className="alert-item">
                            <div className="dot" style={{ background: DOT_COLORS[a.type] }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12.5px', lineHeight: 1.4 }}>{a.msg}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 3 }}>{a.time}</div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}
