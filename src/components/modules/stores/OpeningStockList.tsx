'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WarehouseOpeningRow } from '@/types/stores'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type Props = { rows: WarehouseOpeningRow[] }

export default function OpeningStockList({ rows }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [whFilter, setWhFilter] = useState('')

    const warehouses = [...new Set(rows.map(r => r.warehouse_name).filter(Boolean))]

    const filtered = rows.filter(r => {
        const matchSearch =
            r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.product_code?.toLowerCase().includes(search.toLowerCase()) ||
            r.warehouse_name?.toLowerCase().includes(search.toLowerCase())
        const matchWh = !whFilter || r.warehouse_name === whFilter
        return matchSearch && matchWh
    })

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Warehouse Opening Stock</h1>
                    <p className={styles.subtitle}>{rows.length} opening entries</p>
                </div>
                <Button onClick={() => router.push('/dashboard/stores/opening-stock/new')}>
                    + Add Opening Entry
                </Button>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search product or warehouse..."
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
                        { key: 'warehouse_name', label: 'Warehouse' },
                        { key: 'product_code', label: 'Item Code' },
                        { key: 'product_name', label: 'Item Name' },
                        { key: 'opening_qty', label: 'Opening Qty', align: 'r' },
                        { key: 'opening_date', label: 'Date' },
                        { key: 'remarks', label: 'Remarks' },
                    ]}
                    rows={filtered}
                />
            </Card>
        </div>
    )
}
