'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

type BadgeVariant = 'default' | 'warning' | 'info' | 'success' | 'danger';

const TABS = ['Indent', 'PO', 'Schedule', 'GRN', 'IQC', 'Bill Book', 'Payments'];

export default function Purchase() {
    const [activeTab, setActiveTab] = useState('Indent');

    const renderContent = () => {
        if (activeTab === 'Indent') {
            const rows = [
                { no: 'IND-2024-021', dept: 'Production', date: '05 Jun', priority: 'High', items: 4, status: 'Pending' },
                { no: 'IND-2024-020', dept: 'Maintenance', date: '04 Jun', priority: 'Medium', items: 2, status: 'Pending' },
            ];
            return (
                <Card title="Material Indents" noPad action={<Button variant="primary" size="sm">+ New Indent</Button>}>
                    <Table columns={[
                        { key: 'no', label: 'Indent No' },
                        { key: 'dept', label: 'Department' },
                        { key: 'date', label: 'Date' },
                        { key: 'priority', label: 'Priority', render: v => <Badge label={v as string} variant={v === 'High' ? 'danger' : 'warning'} /> },
                        { key: 'items', label: 'Items', align: 'c' },
                        { key: 'status', label: 'Status', render: () => <Badge label="Pending" variant="warning" /> },
                    ]} rows={rows} />
                </Card>
            );
        }
        if (activeTab === 'GRN') {
            const rows = [
                { no: 'GRN-2024-089', po: 'PO-2024-060', vendor: 'Steel India Ltd', challan: 'SI/DC/441', date: '04 Jun', vehicle: 'GJ05-AB-1234' },
                { no: 'GRN-2024-088', po: 'PO-2024-058', vendor: 'Rubber Works', challan: 'RW/DC/220', date: '03 Jun', vehicle: 'MH12-CD-5678' },
            ];
            return (
                <Card title="Goods Receipt Notes" noPad action={<Button variant="primary" size="sm">+ New GRN</Button>}>
                    <Table columns={[
                        { key: 'no', label: 'GRN No' }, { key: 'po', label: 'PO Ref' }, { key: 'vendor', label: 'Vendor' },
                        { key: 'challan', label: 'Vendor Challan' }, { key: 'date', label: 'Date' }, { key: 'vehicle', label: 'Vehicle No' },
                    ]} rows={rows} />
                </Card>
            );
        }
        if (activeTab === 'IQC') {
            const rows = [
                { grn: 'GRN-2024-089', item: 'MS Steel Rod 12mm', total: 500, sample: 50, accepted: 48, rejected: 2, status: 'Accepted' },
                { grn: 'GRN-2024-088', item: 'Rubber Gasket 40mm', total: 200, sample: 20, accepted: 18, rejected: 2, status: 'Partial' },
            ];
            return (
                <Card title="Incoming Quality Control" noPad action={<Button variant="primary" size="sm">+ New IQC</Button>}>
                    <Table columns={[
                        { key: 'grn', label: 'GRN Ref' }, { key: 'item', label: 'Item' },
                        { key: 'total', label: 'Total', align: 'c' }, { key: 'sample', label: 'Sample', align: 'c' },
                        { key: 'accepted', label: 'Accepted', align: 'c' }, { key: 'rejected', label: 'Rejected', align: 'c' },
                        { key: 'status', label: 'Result', align: 'c', render: (v: unknown) => <Badge label={v as string} variant={(v === 'Accepted' ? 'success' : 'warning') as BadgeVariant} /> },
                    ]} rows={rows} />
                </Card>
            );
        }
        return <Card title={activeTab}><div className="empty">{activeTab} content coming soon</div></Card>;
    };

    return (
        <>
            <PageHeader
                title="Purchase Management"
                description="Indent to payment — complete procurement flow"
                actions={<Button variant="secondary" icon="⬇">Export</Button>}
            />
            <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
            {renderContent()}
        </>
    );
}
