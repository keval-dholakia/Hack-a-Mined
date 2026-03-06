'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import styles from './Production.module.css';

type BadgeVariant = 'default' | 'warning' | 'info' | 'success' | 'danger';

const STATUS_TYPES: Record<string, BadgeVariant> = {
    'In Progress': 'info', 'Closed': 'success', 'On Hold': 'warning',
};

const TABS = ['BOM', 'Route Card', 'Material Issue', 'Job Order', 'Reports', 'Closure'];

export default function Production() {
    const [activeTab, setActiveTab] = useState('Route Card');

    const renderContent = () => {
        if (activeTab === 'Route Card') {
            const rows = [
                { no: 'RC-2024-441', batch: 'B-441', product: 'Alto Bracket', plan: 500, done: 340, start: '01 Jun', end: '07 Jun', status: 'In Progress' },
                { no: 'RC-2024-440', batch: 'B-440', product: 'Swift Frame', plan: 300, done: 300, start: '28 May', end: '03 Jun', status: 'Closed' },
                { no: 'RC-2024-439', batch: 'B-439', product: 'Baleno Panel', plan: 200, done: 120, start: '30 May', end: '06 Jun', status: 'On Hold' },
            ];
            return (
                <>
                    <div className={styles.statGrid}>
                        <StatCard label="Active Batches" value="8" />
                        <StatCard label="Completed Today" value="2" trend={0} />
                        <StatCard label="Output Units" value="1,240" trend={8.7} sub="this week" />
                        <StatCard label="Rejection Rate" value="2.1%" trend={-0.4} sub="vs last week" />
                    </div>
                    <Card title="Route Cards" noPad action={<Button variant="primary" size="sm">+ New Route Card</Button>}>
                        <Table columns={[
                            { key: 'no', label: 'Route Card No' }, { key: 'batch', label: 'Batch No' },
                            { key: 'product', label: 'Product' }, { key: 'plan', label: 'Plan Qty', align: 'c' },
                            { key: 'done', label: 'Done Qty', align: 'c' }, { key: 'start', label: 'Start' },
                            { key: 'end', label: 'End' },
                            { key: 'status', label: 'Status', align: 'c', render: (v: unknown) => <Badge label={v as string} variant={STATUS_TYPES[v as string]} /> },
                        ]} rows={rows} />
                    </Card>
                </>
            );
        }
        if (activeTab === 'BOM') {
            const rows = [
                { fg: 'Alto Bracket', process: 'Cutting', machine: 'CNC-01', rawMat: 'MS Sheet 2mm', output: 50 },
                { fg: 'Alto Bracket', process: 'Bending', machine: 'Bend-02', rawMat: 'Cut Pieces', output: 50 },
                { fg: 'Swift Frame', process: 'Welding', machine: 'Weld-01', rawMat: 'MS Pipe 40mm', output: 25 },
            ];
            return (
                <Card title="Bill of Materials" noPad action={<Button variant="primary" size="sm">+ Add BOM</Button>}>
                    <Table columns={[
                        { key: 'fg', label: 'Finished Good' }, { key: 'process', label: 'Process' },
                        { key: 'machine', label: 'Machine' }, { key: 'rawMat', label: 'Raw Material' },
                        { key: 'output', label: 'Output Qty', align: 'c' },
                    ]} rows={rows} />
                </Card>
            );
        }
        if (activeTab === 'Reports') {
            const rows = [
                { date: '05 Jun', shift: 'A', machine: 'CNC-01', operator: 'Ramesh K.', prodQty: 180, rejQty: 4 },
                { date: '05 Jun', shift: 'A', machine: 'Weld-01', operator: 'Suresh P.', prodQty: 120, rejQty: 2 },
                { date: '05 Jun', shift: 'B', machine: 'CNC-01', operator: 'Dinesh L.', prodQty: 160, rejQty: 8 },
            ];
            return (
                <Card title="Daily Production Report" noPad action={<Button variant="primary" size="sm">+ Add Entry</Button>}>
                    <Table columns={[
                        { key: 'date', label: 'Date' }, { key: 'shift', label: 'Shift', align: 'c' },
                        { key: 'machine', label: 'Machine' }, { key: 'operator', label: 'Operator' },
                        { key: 'prodQty', label: 'Prod Qty', align: 'c' },
                        {
                            key: 'rejQty', label: 'Rejection', align: 'c',
                            render: (v: unknown) => <span style={{ color: (v as number) > 5 ? 'var(--red)' : 'var(--text-primary)' }}>{String(v)}</span>
                        },
                    ]} rows={rows} />
                </Card>
            );
        }
        return <Card title={activeTab}><div className="empty">{activeTab} content coming soon</div></Card>;
    };

    return (
        <>
            <PageHeader title="Production Management" description="BOM to batch closure — full production lifecycle" />
            <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </>
    );
}
