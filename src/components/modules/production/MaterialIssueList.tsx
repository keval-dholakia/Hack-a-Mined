'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { issues: any[] }

export default function MaterialIssueList({ issues }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = issues.filter(i =>
    i.issue_no.toLowerCase().includes(search.toLowerCase()) ||
    i.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.route_card?.route_card_no.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Material Issues</h1>
          <p className={styles.subtitle}>{issues.length} total issues</p>
        </div>
        <Button onClick={() => router.push('/dashboard/production/material-issue/new')}>
          + New Issue
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by issue no, product or route card..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'issue_no',    label: 'Issue No'   },
            { key: 'route_card',  label: 'Route Card', render: v => (v as any)?.route_card_no ?? '—' },
            { key: 'product',     label: 'Product',    render: v => (v as any)?.name ?? '—' },
            { key: 'warehouse',   label: 'Warehouse',  render: v => (v as any)?.name ?? '—' },
            { key: 'issue_date',  label: 'Date'       },
            { key: 'qty_requested', label: 'Requested', align: 'c' },
            { key: 'qty_issued',    label: 'Issued',    align: 'c' },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}