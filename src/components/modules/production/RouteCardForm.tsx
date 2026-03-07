'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRouteCard, updateRouteCard } from '@/app/actions/production'
import type { RouteCardFormData } from '@/types/production'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { routeCard?: any; products: any[]; boms: any[] }

export default function RouteCardForm({ routeCard, products, boms }: Props) {
  const router = useRouter()
  const isEdit = !!routeCard

  const [form, setForm] = useState<RouteCardFormData>({
    route_card_no:  routeCard?.route_card_no  ?? '',
    product_id:     routeCard?.product_id     ?? 0,
    bom_id:         routeCard?.bom_id         ?? null,
    batch_no:       routeCard?.batch_no       ?? '',
    plan_qty:       routeCard?.plan_qty       ?? 0,
    produced_qty:   routeCard?.produced_qty   ?? 0,
    rejection_qty:  routeCard?.rejection_qty  ?? 0,
    scrap_generated:routeCard?.scrap_generated ?? 0,
    start_date:     routeCard?.start_date     ?? '',
    end_date:       routeCard?.end_date       ?? '',
    closed_date:    routeCard?.closed_date    ?? '',
    status:         routeCard?.status         ?? 'Open',
    remarks:        routeCard?.remarks        ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof RouteCardFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Filter BOMs by selected product
  const filteredBOMs = boms.filter(b =>
    form.product_id === 0 || b.product_id === form.product_id
  )

  // Progress percentage
  const progress = form.plan_qty > 0
    ? Math.min(100, Math.round((form.produced_qty / form.plan_qty) * 100))
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.product_id === 0) { setError('Select a product'); return }
    if (form.plan_qty <= 0)    { setError('Plan qty must be greater than 0'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updateRouteCard(routeCard.id, form)
      : await createRouteCard(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/production/route-card')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Route Card' : 'New Route Card'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${routeCard.route_card_no}` : 'Create a new production batch'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="Route Card Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Route Card No <span className={styles.req}>*</span></label>
                <input required placeholder="e.g. RC-2024-001" value={form.route_card_no}
                  onChange={e => setField('route_card_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Batch No</label>
                <input placeholder="e.g. BATCH-001" value={form.batch_no}
                  onChange={e => setField('batch_no', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Product <span className={styles.req}>*</span></label>
                <select required value={form.product_id}
                  onChange={e => setField('product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>BOM Reference</label>
                <select value={form.bom_id ?? ''}
                  onChange={e => setField('bom_id', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Select BOM</option>
                  {filteredBOMs.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.version}{b.process_name ? ` — ${b.process_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Plan Qty <span className={styles.req}>*</span></label>
                <input type="number" min={1} required value={form.plan_qty}
                  onChange={e => setField('plan_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Start Date</label>
                <input type="date" value={form.start_date}
                  onChange={e => setField('start_date', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <input type="date" value={form.end_date}
                  onChange={e => setField('end_date', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea rows={2} value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Production Progress">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Produced Qty</label>
                <input type="number" min={0} value={form.produced_qty}
                  onChange={e => setField('produced_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Rejection Qty</label>
                <input type="number" min={0} value={form.rejection_qty}
                  onChange={e => setField('rejection_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Scrap Generated</label>
                <input type="number" min={0} step={0.01} value={form.scrap_generated}
                  onChange={e => setField('scrap_generated', Number(e.target.value))} />
              </div>
              {form.status === 'Closed' && (
                <div className={styles.field}>
                  <label>Closure Date</label>
                  <input type="date" value={form.closed_date}
                    onChange={e => setField('closed_date', e.target.value)} />
                </div>
              )}
              {/* Progress Bar */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Completion — {progress}%</label>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${progress}%`,
                      background: progress === 100 ? 'var(--green)' : 'var(--accent)'
                    }}
                  />
                </div>
                <p className={styles.progressLabel}>
                  {form.produced_qty} / {form.plan_qty} units produced
                </p>
              </div>
            </div>
          </Card>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Route Card' : 'Create Route Card'}
          </Button>
        </div>
      </form>
    </div>
  )
}