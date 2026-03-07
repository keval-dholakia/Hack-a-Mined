'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVendor, updateVendor } from '@/app/actions/vendors'
import type { Vendor, VendorFormData } from '@/types/vendor'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { vendor?: Vendor }

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

const EMPTY: VendorFormData = {
  code: '', name: '', gstin: '', pan: '',
  contact_person: '', mobile: '', email: '',
  address: '', city: '', state: '', pincode: '',
  bank_name: '', bank_account: '', bank_ifsc: '',
  payment_terms: 30,
}

export default function VendorForm({ vendor }: Props) {
  const router = useRouter()
  const isEdit = !!vendor

  const [form, setForm] = useState<VendorFormData>(
    vendor ? {
      code:           vendor.code           ?? '',
      name:           vendor.name,
      gstin:          vendor.gstin          ?? '',
      pan:            vendor.pan            ?? '',
      contact_person: vendor.contact_person ?? '',
      mobile:         vendor.mobile         ?? '',
      email:          vendor.email          ?? '',
      address:        vendor.address        ?? '',
      city:           vendor.city           ?? '',
      state:          vendor.state          ?? '',
      pincode:        vendor.pincode        ?? '',
      bank_name:      vendor.bank_name      ?? '',
      bank_account:   vendor.bank_account   ?? '',
      bank_ifsc:      vendor.bank_ifsc      ?? '',
      payment_terms:  vendor.payment_terms,
    } : EMPTY
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof VendorFormData, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateVendor(vendor!.id, form)
      : await createVendor(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/masters/vendors')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Vendor' : 'New Vendor'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${vendor!.name}` : 'Add a new vendor to the system'}
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
                <label>Vendor Code</label>
                <input
                  placeholder="e.g. VEND-001"
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Vendor Name <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="Full company or person name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
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
              <div className={styles.field}>
                <label>PAN</label>
                <input
                  placeholder="AAAAA0000A"
                  value={form.pan}
                  onChange={e => set('pan', e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
              <div className={styles.field}>
                <label>Payment Terms (Days)</label>
                <input
                  type="number"
                  min={0}
                  value={form.payment_terms}
                  onChange={e => set('payment_terms', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card title="Contact Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Contact Person</label>
                <input
                  placeholder="Primary contact name"
                  value={form.contact_person}
                  onChange={e => set('contact_person', e.target.value)}
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
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
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
              <div className={styles.field}>
                <label>Pincode</label>
                <input
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={e => set('pincode', e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </Card>

          {/* Bank Details */}
          <Card title="Bank Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Bank Name</label>
                <input
                  placeholder="e.g. HDFC Bank"
                  value={form.bank_name}
                  onChange={e => set('bank_name', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Account Number</label>
                <input
                  placeholder="Bank account number"
                  value={form.bank_account}
                  onChange={e => set('bank_account', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>IFSC Code</label>
                <input
                  placeholder="e.g. HDFC0001234"
                  value={form.bank_ifsc}
                  onChange={e => set('bank_ifsc', e.target.value.toUpperCase())}
                  maxLength={11}
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
            {loading ? 'Saving...' : isEdit ? 'Update Vendor' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </div>
  )
}