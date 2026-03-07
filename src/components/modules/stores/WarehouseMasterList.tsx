'use client'

import { useRouter } from 'next/navigation'
import type { Warehouse } from '@/types/warehouse'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'
import { useState } from 'react'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

type Props = { warehouses: Warehouse[] }

export default function WarehouseMasterList({ warehouses }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')

    const filtered = warehouses.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.code?.toLowerCase().includes(search.toLowerCase()) ||
        w.city?.toLowerCase().includes(search.toLowerCase()) ||
        w.manager_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Warehouse Master</h1>
                    <p className={styles.subtitle}>{warehouses.length} warehouses configured</p>
                </div>
                <div className={styles.headerRight} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <DownloadButton variant="list" onClick={() => downloadTablePdf({
                        title: 'Warehouse Master Registry',
                        subtitle: `${filtered.length} warehouses configured`,
                        columns: [
                            { header: 'Code', dataKey: 'code' },
                            { header: 'Warehouse Name', dataKey: 'name' },
                            { header: 'City', dataKey: 'city' },
                            { header: 'State', dataKey: 'state' },
                            { header: 'Manager', dataKey: 'manager_name' },
                            { header: 'Mobile', dataKey: 'manager_mobile' },
                            { header: 'Status', dataKey: 'is_active', align: 'center' },
                        ],
                        rows: filtered.map(w => ({
                            ...w,
                            code: w.code || '—',
                            city: w.city || '—',
                            state: w.state || '—',
                            manager_name: w.manager_name || '—',
                            manager_mobile: w.manager_mobile || '—',
                            is_active: w.is_active === 1 ? 'Active' : 'Inactive'
                        })),
                        fileName: 'Warehouse_Master_Registry'
                    })} />
                    <Button variant="ghost" onClick={() => router.push('/dashboard/stores/warehouse-master/analytics')}>
                        ◎ Analytics
                    </Button>
                    <Button onClick={() => router.push('/dashboard/masters/warehouses/new')}>
                        + New Warehouse
                    </Button>
                </div>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search by name, code, city or manager..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'code', label: 'Code' },
                        { key: 'name', label: 'Warehouse Name' },
                        { key: 'city', label: 'City' },
                        { key: 'state', label: 'State' },
                        { key: 'manager_name', label: 'Manager' },
                        { key: 'manager_mobile', label: 'Mobile' },
                        {
                            key: 'is_active', label: 'Status', align: 'c',
                            render: v => (
                                <Badge
                                    label={v === 1 ? 'Active' : 'Inactive'}
                                    variant={v === 1 ? 'success' : 'default'}
                                />
                            ),
                        },
                        {
                            key: 'id', label: 'Actions', align: 'c',
                            render: v => (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => router.push(`/dashboard/masters/warehouses/${v}`)}
                                    >
                                        Edit
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
