'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'

type Props = { saleOrders: any[] }

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  Pending:    'warning',
  Dispatched: 'info',
  Closed:     'success',
}

export default function SaleOrderList({ saleOrders }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = saleOrders.filter(so => {
    const matchSearch =
      so.so_no.toLowerCase().includes(search.toLowerCase()) ||
      so.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      so.customer_po_no?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? so.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sale Orders</h1>
          <p className={styles.subtitle}>{saleOrders.length} total orders</p>
        </div>
        <Button onClick={() => router.push('/dashboard/sales/sale-order/new')}>
          + New Sale Order
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by SO no, customer or PO no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'so_no',          label: 'SO No'       },
            { key: 'customer',       label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            { key: 'customer_po_no', label: 'Customer PO',
              render: v => v as string || '—'
            },
            { key: 'so_date',        label: 'SO Date'     },
            { key: 'delivery_date',  label: 'Delivery',
              render: v => v as string || '—'
            },
            { key: 'transporter',    label: 'Transporter',
              render: v => (v as any)?.name ?? '—'
            },
            { key: 'status', label: 'Status', align: 'c',
              render: v => (
                <Badge
                  label={v as string}
                  variant={STATUS_VARIANT[v as string]}
                />
              )
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/sales/sale-order/${v}`)}
                  >
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