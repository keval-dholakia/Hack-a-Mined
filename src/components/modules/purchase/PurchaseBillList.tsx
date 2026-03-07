'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { bills: any[] }

const PAYMENT_VARIANT: Record<string, any> = {
  Unpaid:  'danger',
  Partial: 'warning',
  Paid:    'success',
}

export default function PurchaseBillList({ bills }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = bills.filter(b => {
    const matchSearch =
      b.bill_no.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor_invoice_no?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? b.payment_status === status : true
    return matchSearch && matchStatus
  })

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  const totalPayable = bills
    .filter(b => b.payment_status !== 'Paid')
    .reduce((s, b) => s + Number(b.total), 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Purchase Billbook</h1>
          <p className={styles.subtitle}>
            {bills.length} bills • Payable: {fmt(totalPayable)}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/purchase/billbook/new')}>
          + New Bill
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by bill no, vendor or invoice no..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'bill_no',          label: 'Bill No'     },
            { key: 'vendor',           label: 'Vendor',      render: v => (v as any)?.name ?? '—' },
            { key: 'grn',              label: 'GRN Ref',     render: v => (v as any)?.grn_no ?? '—' },
            { key: 'vendor_invoice_no',label: 'Vendor Inv',  render: v => v as string || '—' },
            { key: 'invoice_date',     label: 'Date'         },
            { key: 'taxable_value',    label: 'Taxable', align: 'r',
              render: v => fmt(v as number)
            },
            { key: 'gst_amount',       label: 'GST', align: 'r',
              render: v => fmt(v as number)
            },
            { key: 'total',            label: 'Total', align: 'r',
              render: v => fmt(v as number)
            },
            { key: 'payment_status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={PAYMENT_VARIANT[v as string]} />
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/billbook/${v}`)}>Edit</button>
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