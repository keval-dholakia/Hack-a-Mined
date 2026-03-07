'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DispatchSRV } from '@/types/stores'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type Props = { srvs: DispatchSRV[] }

export default function DispatchSRVList({ srvs }: Props) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [retFilter, setRetFilter] = useState('')

    const filtered = srvs.filter(s => {
        const matchSearch =
            s.srv_no.toLowerCase().includes(search.toLowerCase()) ||
            s.party_name?.toLowerCase().includes(search.toLowerCase()) ||
            s.product_name?.toLowerCase().includes(search.toLowerCase())
        const matchRet = retFilter === '' ? true : (retFilter === '1' ? s.returnable === 1 : s.returnable === 0)
        return matchSearch && matchRet
    })

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Dispatch SRV</h1>
                    <p className={styles.subtitle}>{srvs.length} dispatch vouchers</p>
                </div>
                <Button onClick={() => router.push('/dashboard/stores/dispatch-srv/new')}>
                    + New SRV
                </Button>
            </div>

            <div className={styles.searchBar}>
                <input
                    className={styles.searchInput}
                    placeholder="Search SRV no, party or item..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className={styles.filterSelect}
                    value={retFilter}
                    onChange={e => setRetFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="1">Returnable</option>
                    <option value="0">Non-Returnable</option>
                </select>
            </div>

            <Card noPad>
                <Table
                    columns={[
                        { key: 'srv_no', label: 'SRV No' },
                        { key: 'srv_date', label: 'Date' },
                        { key: 'party_name', label: 'Party' },
                        { key: 'product_name', label: 'Item' },
                        { key: 'qty', label: 'Qty', align: 'r' },
                        {
                            key: 'returnable', label: 'Returnable', align: 'c',
                            render: v => (
                                <Badge
                                    label={v === 1 ? 'Yes' : 'No'}
                                    variant={v === 1 ? 'warning' : 'default'}
                                />
                            ),
                        },
                        { key: 'return_by_date', label: 'Return By' },
                        {
                            key: 'id', label: 'Actions', align: 'c',
                            render: v => (
                                <div className={styles.actions}>
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => router.push(`/dashboard/stores/dispatch-srv/${v}`)}
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
