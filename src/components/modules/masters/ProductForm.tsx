'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/products'
import type { Product, ProductFormData } from '@/types/product'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { product?: Product }

const UNITS = ['PCS', 'KG', 'MTR', 'LTR', 'BOX', 'SET', 'NOS', 'TON', 'SQM', 'RMT']
const GST_RATES = [0, 5, 12, 18, 28]
const CATEGORIES = [
  'Raw Material', 'Finished Good', 'Semi-Finished',
  'Consumable', 'Spare Part', 'Packaging', 'Service'
]

const EMPTY: ProductFormData = {
  code: '', name: '', description: '',
  category: '', unit: 'PCS', hsn_code: '',
  gst_percent: 18, purchase_price: 0,
  sale_price: 0, min_stock_level: 0,
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState<ProductFormData>(
    product ? {
      code:            product.code            ?? '',
      name:            product.name,
      description:     product.description     ?? '',
      category:        product.category        ?? '',
      unit:            product.unit,
      hsn_code:        product.hsn_code        ?? '',
      gst_percent:     product.gst_percent,
      purchase_price:  product.purchase_price,
      sale_price:      product.sale_price,
      min_stock_level: product.min_stock_level,
    } : EMPTY
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof ProductFormData, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateProduct(product!.id, form)
      : await createProduct(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/masters/products')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${product!.name}` : 'Add a new product to the system'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          {/* Basic Info */}
          <Card title="Basic Information">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Product Code</label>
                <input
                  placeholder="e.g. PROD-001"
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Product Name <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="Full product name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Product description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Unit of Measure</label>
                <select
                  value={form.unit}
                  onChange={e => set('unit', e.target.value)}
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Tax & Pricing */}
          <Card title="Tax & Pricing">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>HSN Code</label>
                <input
                  placeholder="e.g. 7208"
                  value={form.hsn_code}
                  onChange={e => set('hsn_code', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>GST Rate</label>
                <select
                  value={form.gst_percent}
                  onChange={e => set('gst_percent', Number(e.target.value))}
                >
                  {GST_RATES.map(r => (
                    <option key={r} value={r}>{r}%</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Purchase Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.purchase_price}
                  onChange={e => set('purchase_price', Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label>Sale Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.sale_price}
                  onChange={e => set('sale_price', Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label>Min Stock Level</label>
                <input
                  type="number"
                  min={0}
                  value={form.min_stock_level}
                  onChange={e => set('min_stock_level', Number(e.target.value))}
                />
              </div>
              {isEdit && (
                <div className={styles.field}>
                  <label>Current Stock</label>
                  <input
                    value={product!.current_stock}
                    disabled
                    className={styles.disabled}
                  />
                </div>
              )}
            </div>
          </Card>

        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}