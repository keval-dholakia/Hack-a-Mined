'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleProductStatus } from '@/app/actions/products'
import type { Product } from '@/types/product'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { products: Product[] }

const STOCK_VARIANT = (p: Product): 'danger' | 'warning' | 'success' => {
  if (p.current_stock <= 0) return 'danger'
  if (p.current_stock <= p.min_stock_level) return 'warning'
  return 'success'
}

export default function ProductList({ products }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.hsn_code?.includes(search)
    const matchCat = category ? p.category === category : true
    return matchSearch && matchCat
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{products.length} total products</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button variant="ghost" onClick={() => router.push('/dashboard/masters/products/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/masters/products/new')}>
            + New Product
          </Button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search by name, code or HSN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c!}>{c}</option>
          ))}
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'category', label: 'Category' },
            { key: 'unit', label: 'Unit', align: 'c' },
            { key: 'hsn_code', label: 'HSN' },
            {
              key: 'gst_percent', label: 'GST%', align: 'c',
              render: v => `${v}%`
            },
            {
              key: 'sale_price', label: 'Sale Price', align: 'r',
              render: v => `₹${Number(v).toLocaleString('en-IN')}`
            },
            {
              key: 'current_stock', label: 'Stock', align: 'c',
              render: (v, row) => (
                <Badge
                  label={`${v} ${row.unit}`}
                  variant={STOCK_VARIANT(row as unknown as Product)}
                />
              )
            },
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
                    onClick={() => router.push(`/dashboard/masters/products/${v}`)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggleProductStatus(v as number, row.is_active as number)}
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