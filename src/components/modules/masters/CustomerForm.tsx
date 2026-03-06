'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomer, updateCustomer } from '@/app/actions/customers'
import type { Customer, CustomerFormData } from '@/types/customer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Masters.module.scss'

type Props = { customer?: Customer }

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

const EMPTY: CustomerFormData = {
  code: '', name: '', gstin: '', pan: '',
  contact_person: '', mobile: '', email: '',
  billing_address: '', shipping_address: '',
  city: '', state: '', pincode: '',
  place_of_supply: '', credit_period: 30, credit_limit: 0,
}

export default function CustomerForm({ customer }: Props) {
  const router  = useRouter()
  const isEdit  = !!customer

  const [form, setForm] = useState<CustomerFormData>(
    customer ? {
      code:             customer.code             ?? '',
      name:             customer.name,
      gstin:            customer.gstin            ?? '',
      pan:              customer.pan              ?? '',
      contact_person:   customer.contact_person   ?? '',
      mobile:           customer.mobile           ?? '',
      email:            customer.email            ?? '',
      billing_address:  customer.billing_address  ?? '',
      shipping_address: customer.shipping_address ?? '',
      city:             customer.city             ?? '',
      state:            customer.state            ?? '',
      pincode:          customer.pincode          ?? '',
      place_of_supply:  customer.place_of_supply  ?? '',
      credit_period:    customer.credit_period,
      credit_limit:     customer.credit_limit,
    } : EMPTY
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof CustomerFormData, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function copyBillingToShipping() {
    setForm(prev => ({ ...prev, shipping_address: prev.billing_address }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateCustomer(customer!.id, form)
      : await createCustomer(form)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/masters/customers')
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isEdit ? 'Edit Customer' : 'New Customer'}
          </h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${customer!.name}` : 'Add a new customer to the system'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          {/* Basic Info */}
          <Card title="Basic Information">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Customer Code</label>
                <input
                  placeholder="e.g. CUST-001"
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Customer Name <span className={styles.req}>*</span></label>
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
            </div>
          </Card>

          {/* Contact Info */}
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
            </div>
          </Card>

          {/* Address */}
          <Card title="Address">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="Full billing address"
                  value={form.billing_address}
                  onChange={e => set('billing_address', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <div className={styles.labelRow}>
                  <label>Shipping Address</label>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={copyBillingToShipping}
                  >
                    Copy from billing
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Full shipping address"
                  value={form.shipping_address}
                  onChange={e => set('shipping_address', e.target.value)}
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
              <div className={styles.field}>
                <label>Place of Supply</label>
                <select
                  value={form.place_of_supply}
                  onChange={e => set('place_of_supply', e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Financial */}
          <Card title="Financial Settings">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Credit Period (Days)</label>
                <input
                  type="number"
                  min={0}
                  value={form.credit_period}
                  onChange={e => set('credit_period', Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label>Credit Limit (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.credit_limit}
                  onChange={e => set('credit_limit', Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </div>
  )
}