'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleVendorStatus } from '@/app/actions/vendors'
import type { Vendor } from '@/types/vendor'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { vendors: Vendor[] }

export default function VendorList({ vendors }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.mobile?.includes(search) ||
    v.gstin?.toLowerCase().includes(search.toLowerCase()) ||
    v.code?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggle(id: number, is_active: number) {
    await toggleVendorStatus(id, is_active)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendors</h1>
          <p className={styles.subtitle}>{vendors.length} total vendors</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="ghost" onClick={() => router.push('/dashboard/masters/vendors/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/masters/vendors/new')}>
            + New Vendor
          </Button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, mobile, GSTIN or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'gstin', label: 'GSTIN' },
            { key: 'city', label: 'City' },
            { key: 'payment_terms', label: 'Payment Days', align: 'c' },
            {
              key: 'is_active', label: 'Status', align: 'c',
              render: (v) => (
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
                    onClick={() => router.push(`/dashboard/masters/vendors/${v}`)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => handleToggle(v as number, row.is_active as number)}
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