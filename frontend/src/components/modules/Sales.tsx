'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import styles from './Sales.module.css';

type BadgeVariant = 'default' | 'warning' | 'info' | 'success' | 'danger';

const STATUS_TYPES: Record<string, BadgeVariant> = {
    New: 'default', Processing: 'warning', Quoted: 'info', Lost: 'danger',
    Pending: 'warning', Dispatched: 'info', Closed: 'success', Overdue: 'danger',
    Paid: 'success', 'Due Today': 'warning',
};

const TABS = ['Inquiries', 'Quotations', 'Sale Orders', 'Invoices', 'Collections'];

interface InquiryItem { item: string; qty: string; price: string; }

function InquiryForm({ onCancel }: { onCancel: () => void }) {
    const [items, setItems] = useState<InquiryItem[]>([{ item: '', qty: '', price: '' }]);

    const addItem = () => setItems(prev => [...prev, { item: '', qty: '', price: '' }]);
    const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

    return (
        <Card title="New Inquiry">
            <div className={styles.formGrid3}>
                <Field label="Inquiry No" required><input className="inp" placeholder="Auto-generated" readOnly /></Field>
                <Field label="Customer Name" required><input className="inp" placeholder="Select customer..." /></Field>
                <Field label="Inquiry Date" required><input className="inp" type="date" /></Field>
                <Field label="Sales Person" required>
                    <select className="inp">
                        <option value="">Select person</option>
                        <option value="rajan">Rajan M.</option>
                        <option value="priya">Priya S.</option>
                    </select>
                </Field>
                <Field label="Status">
                    <select className="inp">
                        <option value="new">New</option>
                        <option value="processing">Processing</option>
                        <option value="quoted">Quoted</option>
                        <option value="lost">Lost</option>
                    </select>
                </Field>
            </div>

            <div className="section-label">Items</div>
            <div className={styles.itemHeader}>
                {['Item Name', 'Quantity', 'Target Price', ''].map(l => (
                    <span key={l} style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</span>
                ))}
            </div>
            {items.map((_, i) => (
                <div key={i} className={styles.itemRow}>
                    <input className="inp" placeholder="Product name" />
                    <input className="inp" type="number" placeholder="0" />
                    <input className="inp" placeholder="₹ 0.00" />
                    <button style={{ color: 'var(--text-muted)', fontSize: 16 }} onClick={() => removeItem(i)}>×</button>
                </div>
            ))}
            <Button variant="ghost" onClick={addItem}>+ Add Item</Button>

            <div className={styles.formFooter}>
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant="primary">Save Inquiry</Button>
            </div>
        </Card>
    );
}

export default function Sales() {
    const [activeTab, setActiveTab] = useState('Inquiries');
    const [showForm, setShowForm] = useState(false);

    const inquiryRows = [
        { no: 'INQ-2024-042', customer: 'Maruti Suzuki', date: '05 Jun 2024', person: 'Rajan M.', items: 3, status: 'New' },
        { no: 'INQ-2024-041', customer: 'Hero MotoCorp', date: '04 Jun 2024', person: 'Priya S.', items: 1, status: 'Quoted' },
        { no: 'INQ-2024-040', customer: 'Tata Motors', date: '03 Jun 2024', person: 'Rajan M.', items: 2, status: 'Processing' },
        { no: 'INQ-2024-039', customer: 'Bajaj Auto', date: '01 Jun 2024', person: 'Amit K.', items: 5, status: 'Lost' },
    ];

    const soRows = [
        { so: 'SO-2024-112', po: 'MSIL/PO/4421', customer: 'Maruti Suzuki', ship: 'Gurugram', value: '₹4,82,000', status: 'Pending' },
        { so: 'SO-2024-111', po: 'TML/PO/887', customer: 'Tata Motors', ship: 'Pune', value: '₹2,10,500', status: 'Dispatched' },
        { so: 'SO-2024-110', po: 'HMC/PO/231', customer: 'Hero MotoCorp', ship: 'Dharuhera', value: '₹88,000', status: 'Closed' },
    ];

    const invoiceRows = [
        { inv: 'INV-2024-089', so: 'SO-2024-109', customer: 'Bajaj Auto', taxable: '₹3,05,085', gst: '₹54,915', total: '₹3,60,000', due: '2 Jul' },
        { inv: 'INV-2024-088', so: 'SO-2024-108', customer: 'Maruti Suzuki', taxable: '₹1,77,966', gst: '₹32,034', total: '₹2,10,000', due: '28 Jun' },
    ];

    const collectionRows = [
        { inv: 'INV-2024-075', customer: 'Hero MotoCorp', amount: '₹88,000', due: '01 Jun', days: '+4', status: 'Overdue' },
        { inv: 'INV-2024-082', customer: 'Tata Motors', amount: '₹2,10,500', due: '10 Jun', days: '0', status: 'Due Today' },
        { inv: 'INV-2024-085', customer: 'Maruti Suzuki', amount: '₹4,82,000', due: '20 Jun', days: '-10', status: 'Paid' },
    ];

    const renderContent = () => {
        const statusCol = { key: 'status', label: 'Status', align: 'c' as const, render: (v: unknown) => <Badge label={v as string} variant={STATUS_TYPES[v as string]} /> };

        if (activeTab === 'Inquiries') {
            if (showForm) return <InquiryForm onCancel={() => setShowForm(false)} />;
            return (
                <Card title="All Inquiries" noPad action={<Button variant="primary" size="sm" onClick={() => setShowForm(true)}>+ New Inquiry</Button>}>
                    <Table columns={[
                        { key: 'no', label: 'Inquiry No' }, { key: 'customer', label: 'Customer' },
                        { key: 'date', label: 'Date' }, { key: 'person', label: 'Sales Person' },
                        { key: 'items', label: 'Items', align: 'c' }, statusCol,
                    ]} rows={inquiryRows} />
                </Card>
            );
        }
        if (activeTab === 'Sale Orders') {
            return (
                <Card title="Sale Orders" noPad action={<Button variant="primary" size="sm">+ New SO</Button>}>
                    <Table columns={[
                        { key: 'so', label: 'SO No' }, { key: 'po', label: 'Customer PO' },
                        { key: 'customer', label: 'Customer' }, { key: 'ship', label: 'Ship To' },
                        { key: 'value', label: 'Value', align: 'r' }, statusCol,
                    ]} rows={soRows} />
                </Card>
            );
        }
        if (activeTab === 'Invoices') {
            return (
                <Card title="Invoices" noPad action={<Button variant="primary" size="sm">+ New Invoice</Button>}>
                    <Table columns={[
                        { key: 'inv', label: 'Invoice No' }, { key: 'so', label: 'SO Ref' }, { key: 'customer', label: 'Customer' },
                        { key: 'taxable', label: 'Taxable Value', align: 'r' }, { key: 'gst', label: 'GST', align: 'r' },
                        { key: 'total', label: 'Grand Total', align: 'r' }, { key: 'due', label: 'Due Date', align: 'c' },
                    ]} rows={invoiceRows} />
                </Card>
            );
        }
        if (activeTab === 'Collections') {
            return (
                <>
                    <div className={styles.statGrid3}>
                        <StatCard label="Total Outstanding" value="₹12.4L" />
                        <StatCard label="Due This Week" value="₹3.2L" />
                        <StatCard label="Collected MTD" value="₹8.6L" />
                    </div>
                    <Card title="Collection Status" noPad>
                        <Table columns={[
                            { key: 'inv', label: 'Invoice' }, { key: 'customer', label: 'Customer' },
                            { key: 'amount', label: 'Amount', align: 'r' }, { key: 'due', label: 'Due Date', align: 'c' },
                            { key: 'days', label: 'Days', align: 'c' }, statusCol,
                        ]} rows={collectionRows} />
                    </Card>
                </>
            );
        }
        return <Card title={activeTab}><div className="empty">{activeTab} content coming soon</div></Card>;
    };

    return (
        <>
            <PageHeader
                title="Sales Management"
                description="Inquiries to invoices — complete sales lifecycle"
                actions={<Button variant="secondary" icon="⬇">Export</Button>}
            />
            <Tabs tabs={TABS} active={activeTab} onChange={t => { setActiveTab(t); setShowForm(false); }} />
            {renderContent()}
        </>
    );
}
