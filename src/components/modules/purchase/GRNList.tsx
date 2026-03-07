'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { grns: any[] }

const STATUS_VARIANT: Record<string, any> = {
  Pending:    'warning',
  'IQC Done': 'info',
  Received:   'success',
}

export default function GRNList({ grns }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = grns.filter(g => {
    const matchSearch =
      g.grn_no.toLowerCase().includes(search.toLowerCase()) ||
      g.vendor?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? g.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>GRN</h1>
          <p className={styles.subtitle}>{grns.length} total receipts</p>
        </div>
        <Button onClick={() => router.push('/dashboard/purchase/grn/new')}>+ New GRN</Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by GRN no or vendor..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="IQC Done">IQC Done</option>
          <option value="Received">Received</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'grn_no',           label: 'GRN No'    },
            { key: 'vendor',           label: 'Vendor',       render: v => (v as any)?.name ?? '—' },
            { key: 'purchase_order',   label: 'PO Ref',       render: v => (v as any)?.po_no ?? '—' },
            { key: 'gate_entry_date',  label: 'Entry Date' },
            { key: 'vendor_challan_no',label: 'Challan No',   render: v => v as string || '—' },
            { key: 'warehouse',        label: 'Warehouse',    render: v => (v as any)?.name ?? '—' },
            { key: 'status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/grn/${v}`)}>Edit</button>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/iqc/new?grn=${v}`)}>IQC</button>
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