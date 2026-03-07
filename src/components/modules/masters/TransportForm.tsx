'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransportMaster, updateTransportMaster } from '@/app/actions/transport'
import type { TransportMaster, TransportFormData } from '@/types/transport'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { transporter?: TransportMaster }

const EMPTY: TransportFormData = {
  name: '', owner_name: '', mobile: '', gstin: '', address: '',
}

export default function TransportForm({ transporter }: Props) {
  const router = useRouter()
  const isEdit = !!transporter

  const [form, setForm] = useState<TransportFormData>(
    transporter ? {
      name:       transporter.name,
      owner_name: transporter.owner_name ?? '',
      mobile:     transporter.mobile     ?? '',
      gstin:      transporter.gstin      ?? '',
      address:    transporter.address    ?? '',
    } : EMPTY
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof TransportFormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateTransportMaster(transporter!.id, form)
      : await createTransportMaster(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/masters/transport')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Transporter' : 'New Transporter'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${transporter!.name}` : 'Add a new transporter to the system'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          <Card title="Transporter Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Transporter Name <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="e.g. Shree Transport Co."
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Owner Name</label>
                <input
                  placeholder="Owner / proprietor name"
                  value={form.owner_name}
                  onChange={e => set('owner_name', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Mobile</label>
                <input
                  placeholder="10-digit mobile"
                  value={form.mobile}
                  onChange={e => set('mobile', e.target.value)}
                  maxLength={15}
                />
              </div>
              <div className={styles.field}>
                <label>GSTIN</label>
                <input
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={e => set('gstin', e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Address</label>
                <textarea
                  rows={3}
                  placeholder="Full address"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
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
            {loading ? 'Saving...' : isEdit ? 'Update Transporter' : 'Create Transporter'}
          </Button>
        </div>
      </form>
    </div>
  )
}