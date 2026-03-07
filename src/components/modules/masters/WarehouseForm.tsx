'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWarehouse, updateWarehouse } from '@/app/actions/warehouses'
import type { Warehouse, WarehouseFormData } from '@/types/warehouse'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { warehouse?: Warehouse }

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

const EMPTY: WarehouseFormData = {
  code: '', name: '', address: '',
  city: '', state: '',
  manager_name: '', manager_mobile: '',
}

export default function WarehouseForm({ warehouse }: Props) {
  const router = useRouter()
  const isEdit = !!warehouse

  const [form, setForm] = useState<WarehouseFormData>(
    warehouse ? {
      code:           warehouse.code           ?? '',
      name:           warehouse.name,
      address:        warehouse.address        ?? '',
      city:           warehouse.city           ?? '',
      state:          warehouse.state          ?? '',
      manager_name:   warehouse.manager_name   ?? '',
      manager_mobile: warehouse.manager_mobile ?? '',
    } : EMPTY
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof WarehouseFormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateWarehouse(warehouse!.id, form)
      : await createWarehouse(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/masters/warehouses')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Warehouse' : 'New Warehouse'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${warehouse!.name}` : 'Add a new warehouse to the system'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          <Card title="Warehouse Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Warehouse Code</label>
                <input
                  placeholder="e.g. WH-001"
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Warehouse Name <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="e.g. Main Store, Finished Goods Store"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Address</label>
                <textarea
                  rows={2}
                  placeholder="Full address"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>City</label>
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>State</label>
                <select
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card title="Manager Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Manager Name</label>
                <input
                  placeholder="Warehouse manager name"
                  value={form.manager_name}
                  onChange={e => set('manager_name', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Manager Mobile</label>
                <input
                  placeholder="10-digit mobile"
                  value={form.manager_mobile}
                  onChange={e => set('manager_mobile', e.target.value)}
                  maxLength={15}
                />
              </div>
            </div>
          </Card>

        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </div>
  )
}