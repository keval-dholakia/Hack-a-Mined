'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCustomerStatus } from '@/app/actions/customers'
import type { Customer } from '@/types/customer'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

type Props = { customers: Customer[] }

export default function CustomerList({ customers }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search) ||
    c.gstin?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggle(id: number, is_active: number) {
    await toggleCustomerStatus(id, is_active)
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Customers</h1>
          <p className={styles.subtitle}>{customers.length} total customers</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Customer Register',
            subtitle: `${filtered.length} customers`,
            columns: [
              { header: 'Code', dataKey: 'code' },
              { header: 'Name', dataKey: 'name' },
              { header: 'Mobile', dataKey: 'mobile' },
              { header: 'GSTIN', dataKey: 'gstin' },
              { header: 'City', dataKey: 'city' },
              { header: 'Credit Days', dataKey: 'credit_period', align: 'right' },
              { header: 'Status', dataKey: 'is_active' },
            ],
            rows: filtered.map(c => ({ ...c, is_active: c.is_active === 1 ? 'Active' : 'Inactive' })),
            fileName: 'Customer_Register',
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/masters/customers/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/masters/customers/new')}>
            + New Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, mobile, GSTIN or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card noPad>
        <Table
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'gstin', label: 'GSTIN' },
            { key: 'city', label: 'City' },
            { key: 'credit_period', label: 'Credit Days', align: 'c' },
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
                    onClick={() => router.push(`/dashboard/masters/customers/${v}`)}
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