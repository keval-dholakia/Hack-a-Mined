'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createIQC } from '@/app/actions/purchase'
import type { IQCFormData } from '@/types/purchase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { grns: any[]; products: any[]; currentUser: any }

export default function IQCForm({ grns, products, currentUser }: Props) {
  const router = useRouter()

  const [form, setForm] = useState<IQCFormData>({
    grn_id:          0,
    product_id:      0,
    check_date:      new Date().toISOString().split('T')[0],
    total_qty:       0,
    sample_size:     0,
    accepted_qty:    0,
    rejected_qty:    0,
    visual_check:    'Pass',
    dimension_check: 'Pass',
    result:          'Pass',
    remarks:         '',
    checked_by:      currentUser?.id ?? null,
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof IQCFormData, value: any) {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      // Auto-calc rejected qty
      if (key === 'total_qty' || key === 'accepted_qty') {
        updated.rejected_qty = Math.max(0, updated.total_qty - updated.accepted_qty)
      }
      // Auto-set result
      if (key === 'visual_check' || key === 'dimension_check' ||
          key === 'accepted_qty' || key === 'total_qty') {
        const allPass   = updated.visual_check === 'Pass' && updated.dimension_check === 'Pass'
        const fullQty   = updated.accepted_qty >= updated.total_qty && updated.total_qty > 0
        const partialQty= updated.accepted_qty > 0 && updated.accepted_qty < updated.total_qty
        updated.result  = !allPass ? 'Fail' : fullQty ? 'Pass' : partialQty ? 'Partial' : 'Fail'
      }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.grn_id === 0)     { setError('Select a GRN'); return }
    if (form.product_id === 0) { setError('Select a product'); return }
    setLoading(true)
    setError(null)
    const result = await createIQC(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/purchase/iqc')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>New IQC Entry</h1>
          <p className={styles.subtitle}>Incoming quality control check</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="IQC Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>GRN Reference <span className={styles.req}>*</span></label>
                <select required value={form.grn_id}
                  onChange={e => setField('grn_id', Number(e.target.value))}>
                  <option value={0}>Select GRN</option>
                  {grns.map(g => (
                    <option key={g.id} value={g.id}>{g.grn_no}</option>
                  ))}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Product <span className={styles.req}>*</span></label>
                <select required value={form.product_id}
                  onChange={e => setField('product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Check Date</label>
                <input type="date" value={form.check_date}
                  onChange={e => setField('check_date', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Total Qty</label>
                <input type="number" min={0} value={form.total_qty}
                  onChange={e => setField('total_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Sample Size</label>
                <input type="number" min={0} value={form.sample_size}
                  onChange={e => setField('sample_size', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Accepted Qty</label>
                <input type="number" min={0} value={form.accepted_qty}
                  onChange={e => setField('accepted_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Rejected Qty</label>
                <input readOnly value={form.rejected_qty} className={styles.readOnly} />
              </div>
            </div>
          </Card>

          <Card title="Quality Checks">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Visual Check</label>
                <select value={form.visual_check}
                  onChange={e => setField('visual_check', e.target.value)}>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Dimension Check</label>
                <select value={form.dimension_check}
                  onChange={e => setField('dimension_check', e.target.value)}>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Overall Result</label>
                <input readOnly value={form.result} className={`${styles.readOnly} ${
                  form.result === 'Pass'    ? styles.resultPass :
                  form.result === 'Fail'    ? styles.resultFail : styles.resultPartial
                }`} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea rows={3} value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)}
                  placeholder="Observations, defect details..." />
              </div>
            </div>
          </Card>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Submit IQC'}
          </Button>
        </div>
      </form>
    </div>
  )
}