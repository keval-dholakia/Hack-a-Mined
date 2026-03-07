'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { StockTransfer } from '@/types/stores'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { transfers: StockTransfer[] }

export default function StockTransferList({ transfers }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [fromFilter, setFromFilter] = useState('')

    const warehouses = [...new Set(transfers.map(t => t.from_warehouse_name).filter(Boolean))]

    const filtered = transfers.filter(t => {
        const matchSearch =
            t.transfer_no.toLowerCase().includes(search.toLowerCase()) ||
            t.from_warehouse_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.to_warehouse_name?.toLowerCase().includes(search.toLowerCase()) ||
            t.product_name?.toLowerCase().includes(search.toLowerCase())
        const matchFrom = !fromFilter || t.from_warehouse_name === fromFilter
        return matchSearch && matchFrom
    })

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Stock Transfer</h1>
                    <p className={styles.subtitle}>{transfers.length} transfer records</p>
                </div>
                <div className={styles.headerRight} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Stock Transfer Registry',
                        subtitle: `${filtered.length} transfer records`,
                        columns: [
                            { header: 'Transfer No', dataKey: 'transfer_no' },
                            { header: 'Date', dataKey: 'transfer_date' },
                            { header: 'From Warehouse', dataKey: 'from_warehouse_name' },
                            { header: 'To Warehouse', dataKey: 'to_warehouse_name' },
                            { header: 'Item', dataKey: 'product_name' },
                            { header: 'Qty', dataKey: 'qty', align: 'right' },
                            { header: 'Remarks', dataKey: 'remarks' },
                        ],
                        rows: filtered.map(t => ({
                            ...t,
                            transfer_date: t.transfer_date ? fmtDate(t.transfer_date) : '—',
                            from_warehouse_name: t.from_warehouse_name || '—',
                            to_warehouse_name: t.to_warehouse_name || '—',
                            product_name: t.product_name || '—',
                            qty: Number(t.qty) || 0,
                            remarks: t.remarks || '—'
                        })),
                        fileName: 'Stock_Transfer_Registry'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/stock-transfer/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => router.push('/dashboard/stores/stock-transfer/new')}>
                        + New Transfer
                    </Button>
                </div>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search transfer no, warehouse or item..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className={styles.filterSelect}
                    value={fromFilter}
                    onChange={e => setFromFilter(e.target.value)}
                >
                    <option value="">All From Warehouses</option>
                    {warehouses.map(w => (
                        <option key={w} value={w!}>{w}</option>
                    ))}
                </select>
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'transfer_no', label: 'Transfer No' },
                        { key: 'transfer_date', label: 'Date' },
                        { key: 'from_warehouse_name', label: 'From Warehouse' },
                        { key: 'to_warehouse_name', label: 'To Warehouse' },
                        { key: 'product_name', label: 'Item' },
                        { key: 'qty', label: 'Qty', align: 'r' },
                        { key: 'remarks', label: 'Remarks' },
                        {
                            key: 'id', label: 'Receipt', align: 'c',
                            render: v => (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => router.push(
                                            `/dashboard/stores/material-receipt/new?transfer_id=${v}`
                                        )}
                                    >
                                        Receive
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    rows={filtered}
                />
            </Card>
        </div>
    )
}
