'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPQCEntry, updatePQCEntry } from '@/app/actions/quality'
import type { PQCEntry, PQCFormData, RouteCardSelectOption, PQC_STAGES } from '@/types/quality'
import { PQC_STAGES as STAGES } from '@/types/quality'
import styles from './Quality.module.scss'

type Props = {
  entry?: PQCEntry
  routeCards: RouteCardSelectOption[]
  users: { id: number; name: string }[]
  currentUserId: number
}

const RESULTS = ['Pass', 'Fail', 'Rework'] as const

export default function PQCForm({ entry, routeCards, users, currentUserId }: Props) {
  const router = useRouter()
  const isEdit = Boolean(entry)

  const [form, setForm] = useState<PQCFormData>({
    route_card_id: entry?.route_card_id ?? 0,
    product_id:    entry?.product_id    ?? 0,
    stage_name:    entry?.stage_name    ?? '',
    operator_id:   entry?.operator_id   ?? currentUserId,
    result:        entry?.result        ?? 'Pass',
    remarks:       entry?.remarks       ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function set(key: keyof PQCFormData, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleRouteCardChange(rcId: number) {
    const rc = routeCards.find(r => r.id === rcId)
    setForm(f => ({
      ...f,
      route_card_id: rcId,
      product_id:    rc?.product_id ?? 0,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.route_card_id || !form.stage_name) {
      setError('Please select a Route Card and a Production Stage.')
      return
    }
    setSaving(true)
    setError(null)

    const result = isEdit
      ? await updatePQCEntry(entry!.id, form)
      : await createPQCEntry(form)

    setSaving(false)
    if ('error' in result) { setError(result.error ?? 'An error occurred'); return }
    router.push('/dashboard/quality/pqc')
    router.refresh()
  }

  const selectedRC = routeCards.find(r => r.id === form.route_card_id)

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit PQC Check' : 'New PQC Check'}</h1>
          <p className={styles.subtitle}>In-process inspection at a production stage</p>
        </div>
        <button className={styles.ghostBtn} onClick={() => router.push('/dashboard/quality/pqc')}>
          ← Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>

        {/* ── Section 1: Route Card Reference ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Production Reference</h2>
          <div className={styles.formGrid}>

            <div className={styles.field}>
              <label>Route Card <span className={styles.req}>*</span></label>
              <select
                value={form.route_card_id}
                onChange={e => handleRouteCardChange(Number(e.target.value))}
                required
              >
                <option value={0} disabled>— select route card —</option>
                {routeCards.map(rc => (
                  <option key={rc.id} value={rc.id}>
                    {rc.route_card_no}{rc.batch_no ? ` · Batch: ${rc.batch_no}` : ''} — {rc.product_name} [{rc.status}]
                  </option>
                ))}
              </select>
              {routeCards.length === 0 && (
                <span className={styles.fieldHint}>No open route cards found. Create a route card first.</span>
              )}
            </div>

            <div className={styles.field}>
              <label>Product</label>
              <input
                value={selectedRC ? `${selectedRC.product_code} — ${selectedRC.product_name}` : '—'}
                disabled
                className={styles.readOnly}
              />
            </div>

            <div className={styles.field}>
              <label>Batch No.</label>
              <input value={selectedRC?.batch_no ?? '—'} disabled className={styles.readOnly} />
            </div>

            <div className={styles.field}>
              <label>Operator / Inspector</label>
              <select value={form.operator_id ?? ''} onChange={e => set('operator_id', Number(e.target.value))}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

          </div>
        </div>

        {/* ── Section 2: Stage Selection ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Production Stage <span className={styles.req}>*</span></h2>
          <div className={styles.stageGrid}>
            {STAGES.map(stage => (
              <button
                key={stage}
                type="button"
                className={`${styles.stageCard} ${form.stage_name === stage ? styles.stageCardActive : ''}`}
                onClick={() => set('stage_name', stage)}
              >
                <span className={styles.stageIcon}>
                  {
                    stage === 'Raw Material Check'   ? '📦' :
                    stage === 'Cutting'              ? '✂️' :
                    stage === 'Bending / Forming'    ? '🔩' :
                    stage === 'Welding'              ? '⚡' :
                    stage === 'Surface Treatment'    ? '🖌️' :
                    stage === 'Machining'            ? '⚙️' :
                    stage === 'Assembly'             ? '🔧' :
                    stage === 'Testing'              ? '🧪' :
                    '✅'
                  }
                </span>
                <span className={styles.stageLabel}>{stage}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 3: Result ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Inspection Result</h2>
          <div className={styles.resultGrid}>
            {RESULTS.map(r => (
              <label key={r} className={`${styles.resultCard} ${form.result === r ? styles[`resultCard${r}`] : ''}`}>
                <input
                  type="radio"
                  name="result"
                  value={r}
                  checked={form.result === r}
                  onChange={() => set('result', r)}
                />
                <span className={styles.resultCardIcon}>
                  {r === 'Pass' ? '✅' : r === 'Fail' ? '❌' : '🔁'}
                </span>
                <span className={styles.resultCardLabel}>{r}</span>
                <span className={styles.resultCardDesc}>
                  {r === 'Pass'   ? 'Stage passed — continue to next stage' :
                   r === 'Fail'   ? 'Major defect — hold production, raise NCR' :
                   'Minor defect — send back for rework at this stage'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Section 4: Remarks ── */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Observations & Remarks</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Remarks / Defect Description</label>
              <textarea
                rows={3}
                placeholder={
                  form.result === 'Fail'   ? 'Describe the defect, non-conformance details, and recommended action…' :
                  form.result === 'Rework' ? 'Describe what needs to be corrected and re-inspected…' :
                  'Optional: note any observations or parameters checked…'
                }
                value={form.remarks}
                onChange={e => set('remarks', e.target.value)}
                className={`${styles.textarea} ${form.result !== 'Pass' ? styles.textareaWarn : ''}`}
              />
              {form.result === 'Fail' && (
                <span className={styles.fieldHintDanger}>⚠ Failed stage — detailed description is recommended for NCR tracking.</span>
              )}
            </div>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>⚠ {error}</div>}

        {/* Footer */}
        <div className={styles.formFooter}>
          <button type="button" className={styles.cancelBtn} onClick={() => router.push('/dashboard/quality/pqc')}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update PQC Check' : 'Submit PQC Check'}
          </button>
        </div>

      </form>
    </div>
  )
}
