'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBOM, updateBOM } from '@/app/actions/production'
import type { BOMFormData, BOMItemFormData } from '@/types/production'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { bom?: any; products: any[] }

const UNITS = ['PCS','KG','MTR','LTR','BOX','SET','NOS','TON','SQM','RMT']

const EMPTY_ITEM: BOMItemFormData = {
  raw_material_id: 0, quantity_per_unit: 1, unit: 'PCS', remarks: ''
}

export default function BOMForm({ bom, products }: Props) {
  const router = useRouter()
  const isEdit = !!bom

  const [form, setForm] = useState<BOMFormData>({
    product_id:             bom?.product_id             ?? 0,
    version:                bom?.version                ?? 'v1',
    process_name:           bom?.process_name           ?? '',
    machine:                bom?.machine                ?? '',
    output_qty:             bom?.output_qty             ?? 1,
    man_hours_per_unit:     bom?.man_hours_per_unit     ?? 0,
    machine_hours_per_unit: bom?.machine_hours_per_unit ?? 0,
    items: bom?.items?.map((i: any) => ({
      raw_material_id:  i.raw_material_id,
      quantity_per_unit:i.quantity_per_unit,
      unit:             i.unit,
      remarks:          i.remarks ?? '',
    })) ?? [{ ...EMPTY_ITEM }],
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof BOMFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(idx: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  function updateItem(idx: number, key: keyof BOMItemFormData, value: any) {
    setForm(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [key]: value }
      // Auto-fill unit from product
      if (key === 'raw_material_id') {
        const p = products.find(p => p.id === Number(value))
        if (p) items[idx].unit = p.unit ?? 'PCS'
      }
      return { ...prev, items }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.product_id === 0)                        { setError('Select a finished good'); return }
    if (form.items.length === 0)                      { setError('Add at least one raw material'); return }
    if (form.items.some(i => i.raw_material_id === 0)) { setError('Select material for all items'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updateBOM(bom.id, form)
      : await createBOM(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/production/bom')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit BOM' : 'New BOM'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing BOM for ${bom.product?.name}` : 'Define bill of materials'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="BOM Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Finished Good <span className={styles.req}>*</span></label>
                <select required value={form.product_id}
                  onChange={e => setField('product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Version</label>
                <input placeholder="e.g. v1" value={form.version}
                  onChange={e => setField('version', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Output Qty per Run</label>
                <input type="number" min={1} value={form.output_qty}
                  onChange={e => setField('output_qty', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Process Name</label>
                <input placeholder="e.g. Cutting, Assembly" value={form.process_name}
                  onChange={e => setField('process_name', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Machine</label>
                <input placeholder="e.g. CNC-01" value={form.machine}
                  onChange={e => setField('machine', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Man Hours / Unit</label>
                <input type="number" min={0} step={0.01} value={form.man_hours_per_unit}
                  onChange={e => setField('man_hours_per_unit', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Machine Hours / Unit</label>
                <input type="number" min={0} step={0.01} value={form.machine_hours_per_unit}
                  onChange={e => setField('machine_hours_per_unit', Number(e.target.value))} />
              </div>
            </div>
          </Card>
        </div>

        {/* Raw Materials */}
        <Card title="Raw Materials">
          <div className={styles.itemsTable}>
            <div className={styles.itemsHeader}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr 40px' }}>
              <span>Raw Material</span>
              <span>Qty / Unit</span>
              <span>Unit</span>
              <span>Remarks</span>
              <span></span>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}
                style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr 40px' }}>
                <select value={item.raw_material_id}
                  onChange={e => updateItem(idx, 'raw_material_id', Number(e.target.value))}>
                  <option value={0}>Select material</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" min={0} step={0.0001} value={item.quantity_per_unit}
                  onChange={e => updateItem(idx, 'quantity_per_unit', Number(e.target.value))} />
                <select value={item.unit}
                  onChange={e => updateItem(idx, 'unit', e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <input placeholder="Remarks" value={item.remarks}
                  onChange={e => updateItem(idx, 'remarks', e.target.value)} />
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addItem}>
              + Add Material
            </button>
          </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update BOM' : 'Create BOM'}
          </Button>
        </div>
      </form>
    </div>
  )
}