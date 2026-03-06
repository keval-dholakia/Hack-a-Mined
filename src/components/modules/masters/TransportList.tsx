'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleTransportStatus } from '@/app/actions/transport'
import type { TransportMaster } from '@/types/transport'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { transporters: TransportMaster[] }

export default function TransportList({ transporters }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = transporters.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.mobile?.includes(search) ||
    t.gstin?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transport Masters</h1>
          <p className={styles.subtitle}>{transporters.length} total transporters</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="ghost" onClick={() => router.push('/dashboard/masters/transport/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/masters/transport/new')}>
            + New Transporter
          </Button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, owner, mobile or GSTIN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'name', label: 'Transporter Name' },
            { key: 'owner_name', label: 'Owner' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'gstin', label: 'GSTIN' },
            { key: 'address', label: 'Address' },
            {
              key: 'is_active', label: 'Status', align: 'c',
              render: v => (
                <Badge
                  label={v === 1 ? 'Active' : 'Inactive'}
                  variant={v === 1 ? 'success' : 'default'}
                />
              )
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, row) => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/masters/transport/${v}`)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggleTransportStatus(v as number, row.is_active as number)}
                  >
                    {row.is_active === 1 ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}