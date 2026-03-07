'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { routeCards: any[] }

const STATUS_VARIANT: Record<string, any> = {
  'Open':        'default',
  'In Progress': 'info',
  'Closed':      'success',
}

export default function RouteCardList({ routeCards }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = routeCards.filter(rc => {
    const matchSearch =
      rc.route_card_no.toLowerCase().includes(search.toLowerCase()) ||
      rc.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      rc.batch_no?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? rc.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Route Cards</h1>
          <p className={styles.subtitle}>{routeCards.length} total route cards</p>
        </div>
        <Button onClick={() => router.push('/dashboard/production/route-card/new')}>
          + New Route Card
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by route card no, product or batch..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'route_card_no', label: 'RC No'      },
            { key: 'product',       label: 'Product',    render: v => (v as any)?.name ?? '—' },
            { key: 'batch_no',      label: 'Batch',      render: v => v as string || '—' },
            { key: 'plan_qty',      label: 'Plan',       align: 'c' },
            { key: 'produced_qty',  label: 'Produced',   align: 'c' },
            { key: 'rejection_qty', label: 'Rejected',   align: 'c' },
            { key: 'start_date',    label: 'Start',      render: v => v as string || '—' },
            { key: 'end_date',      label: 'End',        render: v => v as string || '—' },
            { key: 'status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/production/route-card/${v}`)}>
                    Edit
                  </button>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/production/report/new?rc=${v}`)}>
                    Report
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