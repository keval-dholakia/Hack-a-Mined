'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductionReport, updateProductionReport } from '@/app/actions/production'
import type { ProductionReportFormData } from '@/types/production'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { report?: any; routeCards: any[]; products: any[]; currentUser: any }

export default function ProductionReportForm({ report, routeCards, products, currentUser }: Props) {
  const router = useRouter()
  const isEdit = !!report

  const [form, setForm] = useState<ProductionReportFormData>({
    report_date:    report?.report_date    ?? new Date().toISOString().split('T')[0],
    route_card_id:  report?.route_card_id  ?? null,
    product_id:     report?.product_id     ?? 0,
    shift:          report?.shift          ?? 'Day',
    machine_no:     report?.machine_no     ?? '',
    operator_id:    report?.operator_id    ?? currentUser?.id ?? null,
    production_qty: report?.production_qty ?? 0,
    rejection_qty:  report?.rejection_qty  ?? 0,
    remarks:        report?.remarks        ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof ProductionReportFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-fill product from route card
  function handleRouteCardChange(rcId: number | null) {
    if (!rcId) { setField('route_card_id', null); return }
    const rc = routeCards.find(r => r.id === rcId)
    setForm(prev => ({
      ...prev,
      route_card_id: rcId,
      product_id:    rc?.product_id ?? prev.product_id,
    }))
  }

  const rejectionRate = form.production_qty > 0
    ? ((form.rejection_qty / form.production_qty) * 100).toFixed(1)
    : '0.0'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.product_id === 0)   { setError('Select a product'); return }
    if (form.production_qty <= 0){ setError('Production qty must be greater than 0'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updateProductionReport(report.id, form)
      : await createProductionReport(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/production/report')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Report' : 'New Production Report'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing report for ${report.report_date}` : 'Log daily production output'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="Report Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Report Date <span className={styles.req}>*</span></label>
                <input type="date" required value={form.report_date}
                  onChange={e => setField('report_date', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Shift</label>
                <select value={form.shift} onChange={e => setField('shift', e.target.value)}>
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Route Card</label>
                <select value={form.route_card_id ?? ''}
                  onChange={e => handleRouteCardChange(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">None</option>
                  {routeCards.map(rc => (
                    <option key={rc.id} value={rc.id}>
                      {rc.route_card_no} — {(rc.product as any)?.name}
                    </option>
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
                <label>Machine No</label>
                <input placeholder="e.g. CNC-01" value={form.machine_no}
                  onChange={e => setField('machine_no', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea rows={2} value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Output">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Production Qty <span className={styles.req}>*</span></label>
                <input type="number" min={1} required value={form.production_qty}
                  onChange={e => setField('production_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Rejection Qty</label>
                <input type="number" min={0} value={form.rejection_qty}
                  onChange={e => setField('rejection_qty', Number(e.target.value))} />
              </div>

              {/* Rejection Rate */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Rejection Rate</label>
                <div className={styles.rejectionRate}>
                  <div className={styles.rejectionBar}>
                    <div className={styles.rejectionFill}
                      style={{ width: `${Math.min(100, Number(rejectionRate))}%` }} />
                  </div>
                  <span style={{
                    color: Number(rejectionRate) > 5 ? 'var(--red)' : 'var(--green)'
                  }}>
                    {rejectionRate}%
                  </span>
                </div>
              </div>

              {/* Net Good Output */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Net Good Output</label>
                <input readOnly
                  value={`${Math.max(0, form.production_qty - form.rejection_qty)} units`}
                  className={styles.readOnly} />
              </div>
            </div>
          </Card>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Report' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </div>
  )
}