'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { orders: any[] }

const STATUS_VARIANT: Record<string, any> = {
  Open:      'info',
  Partial:   'warning',
  Received:  'success',
  Cancelled: 'danger',
}

export default function POList({ orders }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = orders.filter(o => {
    const matchSearch =
      o.po_no.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? o.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Purchase Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
        <Button onClick={() => router.push('/dashboard/purchase/po/new')}>
          + New PO
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by PO no or vendor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'po_no',        label: 'PO No'    },
            { key: 'vendor',       label: 'Vendor',   render: v => (v as any)?.name ?? '—' },
            { key: 'po_date',      label: 'PO Date'  },
            { key: 'valid_until',  label: 'Valid Until', render: v => v as string || '—' },
            { key: 'delivery_date',label: 'Delivery',    render: v => v as string || '—' },
            { key: 'status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/po/${v}`)}>
                    Edit
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