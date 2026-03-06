'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWarehouseStatus } from '@/app/actions/warehouses'
import type { Warehouse } from '@/types/warehouse'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { warehouses: Warehouse[] }

export default function WarehouseList({ warehouses }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code?.toLowerCase().includes(search.toLowerCase()) ||
    w.city?.toLowerCase().includes(search.toLowerCase()) ||
    w.manager_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Warehouses</h1>
          <p className={styles.subtitle}>{warehouses.length} total warehouses</p>
        </div>
        <Button onClick={() => router.push('/dashboard/masters/warehouses/new')}>
          + New Warehouse
        </Button>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, code, city or manager..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'code',           label: 'Code'    },
            { key: 'name',           label: 'Name'    },
            { key: 'city',           label: 'City'    },
            { key: 'state',          label: 'State'   },
            { key: 'manager_name',   label: 'Manager' },
            { key: 'manager_mobile', label: 'Mobile'  },
            {
              key: 'is_active', label: 'Status', align: 'c',
              render: v => (
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
                    onClick={() => router.push(`/dashboard/masters/warehouses/${v}`)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggleWarehouseStatus(v as number, row.is_active as number)}
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