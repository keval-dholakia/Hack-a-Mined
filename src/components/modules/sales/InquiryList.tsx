'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import InquiryAnalytics from './InquiryAnalytics'
import styles from './Sales.module.scss'

type Props = { inquiries: any[] }

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  New:        'default',
  Processing: 'info',
  Quoted:     'success',
  Lost:       'danger',
}

export default function InquiryList({ inquiries }: Props) {
  const router  = useRouter()
  const [search,        setSearch]        = useState('')
  const [status,        setStatus]        = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)

  // ── Analytics view (full replacement, has its own Back button) ──
  if (showAnalytics) {
    return <InquiryAnalytics inquiries={inquiries} onClose={() => setShowAnalytics(false)} />
  }

  const filtered = inquiries.filter(i => {
    const matchSearch =
      i.inquiry_no.toLowerCase().includes(search.toLowerCase()) ||
      i.customer?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? i.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inquiries</h1>
          <p className={styles.subtitle}>{inquiries.length} total inquiries</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAnalytics(true)}
            className={styles.analyticsBtn}
          >
            Analytics
          </button>
          <Button onClick={() => router.push('/dashboard/sales/inquiry/new')}>
            + New Inquiry
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by inquiry no or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Processing">Processing</option>
          <option value="Quoted">Quoted</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'inquiry_no',   label: 'Inquiry No'  },
            { key: 'customer',     label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            { key: 'inquiry_date', label: 'Date'        },
            { key: 'delivery_date',label: 'Delivery',
              render: v => v as string ?? '—'
            },
            { key: 'sales_person', label: 'Sales Person',
              render: v => (v as any)?.name ?? '—'
            },
            { key: 'status', label: 'Status', align: 'c',
              render: v => (
                <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
              )
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/sales/inquiry/${v}`)}>
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