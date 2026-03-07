'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MaterialReceipt } from '@/types/stores'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { receipts: MaterialReceipt[] }

export default function MaterialReceiptList({ receipts }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [whFilter, setWhFilter] = useState('')

    const warehouses = [...new Set(receipts.map(r => r.warehouse_name).filter(Boolean))]

    const filtered = receipts.filter(r => {
        const matchSearch =
            r.source_doc_ref?.toLowerCase().includes(search.toLowerCase()) ||
            r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.warehouse_name?.toLowerCase().includes(search.toLowerCase())
        const matchWh = !whFilter || r.warehouse_name === whFilter
        return matchSearch && matchWh
    })

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Warehouse Material Receipt</h1>
                    <p className={styles.subtitle}>{receipts.length} receipt entries</p>
                </div>
                <div className={styles.headerRight} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Warehouse Material Receipts Registry',
                        subtitle: `${filtered.length} receipt entries`,
                        columns: [
                            { header: 'Source Doc Ref', dataKey: 'source_doc_ref' },
                            { header: 'Receipt Date', dataKey: 'receipt_date' },
                            { header: 'Warehouse', dataKey: 'warehouse_name' },
                            { header: 'Item', dataKey: 'product_name' },
                            { header: 'Qty Received', dataKey: 'qty_received', align: 'right' },
                            { header: 'Remarks', dataKey: 'remarks' },
                        ],
                        rows: filtered.map(r => ({
                            ...r,
                            source_doc_ref: r.source_doc_ref || '—',
                            receipt_date: r.receipt_date ? fmtDate(r.receipt_date) : '—',
                            warehouse_name: r.warehouse_name || '—',
                            product_name: r.product_name || '—',
                            qty_received: Number(r.qty_received) || 0,
                            remarks: r.remarks || '—'
                        })),
                        fileName: 'Material_Receipts_Registry'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/material-receipt/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => router.push('/dashboard/stores/material-receipt/new')}>
                        + New Receipt
                    </Button>
                </div>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search source doc, product or warehouse..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className={styles.filterSelect}
                    value={whFilter}
                    onChange={e => setWhFilter(e.target.value)}
                >
                    <option value="">All Warehouses</option>
                    {warehouses.map(w => (
                        <option key={w} value={w!}>{w}</option>
                    ))}
                </select>
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'source_doc_ref', label: 'Source Doc Ref' },
                        { key: 'receipt_date', label: 'Receipt Date' },
                        { key: 'warehouse_name', label: 'Warehouse' },
                        { key: 'product_name', label: 'Item' },
                        { key: 'qty_received', label: 'Qty Received', align: 'r' },
                        { key: 'remarks', label: 'Remarks' },
                    ]}
                    rows={filtered}
                />
            </Card>
        </div>
    )
}
