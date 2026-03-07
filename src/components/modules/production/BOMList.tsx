'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { boms: any[] }

export default function BOMList({ boms }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = boms.filter(b =>
    b.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    b.version?.toLowerCase().includes(search.toLowerCase()) ||
    b.process_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bill of Materials</h1>
          <p className={styles.subtitle}>{boms.length} BOMs defined</p>
        </div>
        <Button onClick={() => router.push('/dashboard/production/bom/new')}>
          + New BOM
        </Button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by product, version or process..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'product',              label: 'Finished Good',
              render: v => (v as any)?.name ?? '—' },
            { key: 'version',              label: 'Version'     },
            { key: 'process_name',         label: 'Process',
              render: v => v as string || '—'
            },
            { key: 'machine',              label: 'Machine',
              render: v => v as string || '—'
            },
            { key: 'output_qty',           label: 'Output Qty', align: 'c' },
            { key: 'man_hours_per_unit',   label: 'Man Hrs/Unit', align: 'c' },
            { key: 'is_active', label: 'Status', align: 'c',
              render: v => (
                <Badge
                  label={v === 1 ? 'Active' : 'Inactive'}
                  variant={v === 1 ? 'success' : 'default'}
                />
              )
            },
            { key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/production/bom/${v}`)}>
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