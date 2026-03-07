'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { entries: any[] }

const RESULT_VARIANT: Record<string, any> = {
  Pass:    'success',
  Fail:    'danger',
  Partial: 'warning',
}

export default function IQCList({ entries }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e =>
    e.grn?.grn_no.toLowerCase().includes(search.toLowerCase()) ||
    e.product?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>IQC Entries</h1>
          <p className={styles.subtitle}>{entries.length} total checks</p>
        </div>
        <Button onClick={() => router.push('/dashboard/purchase/iqc/new')}>+ New IQC</Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by GRN no or product..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'grn',            label: 'GRN Ref',    render: v => (v as any)?.grn_no ?? '—' },
            { key: 'product',        label: 'Product',    render: v => (v as any)?.name   ?? '—' },
            { key: 'check_date',     label: 'Date'        },
            { key: 'total_qty',      label: 'Total Qty',  align: 'c' },
            { key: 'accepted_qty',   label: 'Accepted',   align: 'c' },
            { key: 'rejected_qty',   label: 'Rejected',   align: 'c' },
            { key: 'visual_check',   label: 'Visual',     align: 'c',
              render: v => <Badge label={v as string} variant={v === 'Pass' ? 'success' : 'danger'} />
            },
            { key: 'dimension_check',label: 'Dimension',  align: 'c',
              render: v => <Badge label={v as string} variant={v === 'Pass' ? 'success' : 'danger'} />
            },
            { key: 'result', label: 'Result', align: 'c',
              render: v => <Badge label={v as string} variant={RESULT_VARIANT[v as string]} />
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}