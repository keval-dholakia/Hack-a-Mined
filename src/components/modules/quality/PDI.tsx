'use client'

import { useState, useMemo } from 'react'
import styles from './Quality.module.scss'

// ── Pre-defined choices ───────────────────────────────────
const SALE_ORDERS = [
  { id: 1, so_no: 'SO-2024-001', customer: 'Reliance Industries Ltd',    delivery_date: '20 Mar 2024', items: [{ product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',    qty: 200 }, { product_code: 'P-004', product_name: 'MS Sheet 2mm (CRCA)', qty: 50 }] },
  { id: 2, so_no: 'SO-2024-002', customer: 'Tata Motors Ltd',            delivery_date: '28 Mar 2024', items: [{ product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)', qty: 500 }] },
  { id: 3, so_no: 'SO-2024-003', customer: 'Mahindra & Mahindra Ltd',    delivery_date: '05 Apr 2024', items: [{ product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',    qty: 350 }, { product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)', qty: 200 }] },
  { id: 4, so_no: 'SO-2024-004', customer: 'L&T Construction Equipment', delivery_date: '12 Apr 2024', items: [{ product_code: 'P-004', product_name: 'MS Sheet 2mm (CRCA)',   qty: 100 }] },
]

const CHECKERS = [
  { id: 1, name: 'Raj Mehta'   },
  { id: 2, name: 'Priya Shah'  },
  { id: 3, name: 'Ritu Nair'   },
  { id: 4, name: 'Dev Sharma'  },
]

const RESULTS = ['Pass', 'Fail'] as const
type PDIResult = typeof RESULTS[number]

interface PDIEntry {
  id: number
  so_id: number
  so_no: string
  customer: string
  box_no: string
  product_code: string
  product_name: string
  qty_in_box: number
  packaging_ok: boolean
  label_ok: boolean
  qty_verified: boolean
  result: PDIResult
  checked_by: number
  checker_name: string
  created_at: string
}

const SEED: PDIEntry[] = [
  {
    id: 1, so_id: 1, so_no: 'SO-2024-001', customer: 'Reliance Industries Ltd',
    box_no: 'BOX-001', product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm', qty_in_box: 100,
    packaging_ok: true, label_ok: true, qty_verified: true,
    result: 'Pass', checked_by: 1, checker_name: 'Raj Mehta',
    created_at: '2024-03-19T10:00:00Z',
  },
  {
    id: 2, so_id: 1, so_no: 'SO-2024-001', customer: 'Reliance Industries Ltd',
    box_no: 'BOX-002', product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm', qty_in_box: 100,
    packaging_ok: true, label_ok: false, qty_verified: true,
    result: 'Fail', checked_by: 1, checker_name: 'Raj Mehta',
    created_at: '2024-03-19T10:30:00Z',
  },
  {
    id: 3, so_id: 2, so_no: 'SO-2024-002', customer: 'Tata Motors Ltd',
    box_no: 'BOX-001', product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)', qty_in_box: 500,
    packaging_ok: true, label_ok: true, qty_verified: true,
    result: 'Pass', checked_by: 2, checker_name: 'Priya Shah',
    created_at: '2024-03-27T14:00:00Z',
  },
]

const EMPTY_FORM = {
  so_id:        0,
  product_code: '',
  product_name: '',
  qty_in_box:   0,
  box_no:       '',
  packaging_ok: false,
  label_ok:     false,
  qty_verified: false,
  result:       'Pass' as PDIResult,
  checked_by:   1,
}

let nextId  = SEED.length + 1
let boxSeq  = 10   // for auto box no generation

function autoResult(pkg: boolean, lbl: boolean, qty: boolean): PDIResult {
  return (pkg && lbl && qty) ? 'Pass' : 'Fail'
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const RESULT_COLOR: Record<string, string> = {
  Pass: styles.resultPass,
  Fail: styles.resultFail,
}

export default function PDI() {
  const [entries, setEntries] = useState<PDIEntry[]>(SEED)
  const [search, setSearch]   = useState('')
  const [resultF, setResultF] = useState('All')
  const [soFilter, setSoFilter] = useState('All')
  const [open, setOpen]       = useState(false)
  const [editId, setEditId]   = useState<number | null>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const selectedSO  = SALE_ORDERS.find(s => s.id === form.so_id)
  const soProducts  = selectedSO?.items ?? []

  // Stats
  const total   = entries.length
  const pass    = entries.filter(e => e.result === 'Pass').length
  const fail    = entries.filter(e => e.result === 'Fail').length
  const passRate = total ? Math.round(pass / total * 100) : 0

  const uniqueSOs = ['All', ...Array.from(new Set(entries.map(e => e.so_no)))]

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.so_no.toLowerCase().includes(q) || e.customer.toLowerCase().includes(q) ||
      e.box_no.toLowerCase().includes(q) || e.product_name.toLowerCase().includes(q) ||
      e.checker_name.toLowerCase().includes(q)) &&
      (resultF === 'All' || e.result === resultF) &&
      (soFilter === 'All' || e.so_no === soFilter)
  })

  function field<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => {
      const next = { ...f, [k]: v }
      next.result = autoResult(next.packaging_ok, next.label_ok, next.qty_verified)
      return next
    })
  }

  function handleSOChange(soId: number) {
    const so = SALE_ORDERS.find(s => s.id === soId)
    const firstProduct = so?.items[0]
    setForm(f => ({
      ...f,
      so_id: soId,
      product_code: firstProduct?.product_code ?? '',
      product_name: firstProduct?.product_name ?? '',
      qty_in_box: firstProduct?.qty ?? 0,
      box_no: `BOX-${String(boxSeq++).padStart(3,'0')}`,
    }))
  }

  function handleProductChange(code: string) {
    const p = soProducts.find(x => x.product_code === code)
    setForm(f => ({ ...f, product_code: code, product_name: p?.product_name ?? '', qty_in_box: p?.qty ?? 0 }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(e: PDIEntry) {
    setForm({
      so_id: e.so_id, product_code: e.product_code, product_name: e.product_name,
      qty_in_box: e.qty_in_box, box_no: e.box_no,
      packaging_ok: e.packaging_ok, label_ok: e.label_ok, qty_verified: e.qty_verified,
      result: e.result, checked_by: e.checked_by,
    })
    setEditId(e.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    const so      = SALE_ORDERS.find(s => s.id === form.so_id)!
    const checker = CHECKERS.find(c => c.id === form.checked_by)!

    if (editId !== null) {
      setEntries(es => es.map(e => e.id === editId ? {
        ...e, so_id: so.id, so_no: so.so_no, customer: so.customer,
        product_code: form.product_code, product_name: form.product_name,
        qty_in_box: form.qty_in_box, box_no: form.box_no,
        packaging_ok: form.packaging_ok, label_ok: form.label_ok, qty_verified: form.qty_verified,
        result: form.result, checked_by: checker.id, checker_name: checker.name,
      } : e))
    } else {
      const entry: PDIEntry = {
        id: nextId++,
        so_id: so.id, so_no: so.so_no, customer: so.customer,
        product_code: form.product_code, product_name: form.product_name,
        qty_in_box: form.qty_in_box, box_no: form.box_no,
        packaging_ok: form.packaging_ok, label_ok: form.label_ok, qty_verified: form.qty_verified,
        result: form.result, checked_by: checker.id, checker_name: checker.name,
        created_at: new Date().toISOString(),
      }
      setEntries(es => [entry, ...es])
    }
    setSaving(false); setOpen(false)
  }

  const canSave = form.so_id > 0 && form.box_no.trim() !== '' && form.product_code !== ''

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pre-Dispatch Inspection (PDI)</h1>
          <p className={styles.subtitle}>{total} inspections · {passRate}% pass rate · dispatch clearance checks</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ New PDI Check</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{total}</p>
          <p className={styles.statLabel}>Total PDI Checks</p>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <p className={styles.statVal}>{pass}</p>
          <p className={styles.statLabel}>Cleared for Dispatch</p>
        </div>
        <div className={`${styles.statCard} ${fail > 0 ? styles.statRed : ''}`}>
          <p className={styles.statVal}>{fail}</p>
          <p className={styles.statLabel}>Held / Failed</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{passRate}%</p>
          <p className={styles.statLabel}>Clearance Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput}
            placeholder="Search SO no., customer, box, product…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={soFilter} onChange={e => setSoFilter(e.target.value)}>
          {uniqueSOs.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={resultF} onChange={e => setResultF(e.target.value)}>
          <option value="All">All Results</option>
          <option>Pass</option>
          <option>Fail</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📦</span>
            <p>{entries.length === 0 ? 'No PDI entries yet.' : 'No entries match your filter.'}</p>
            {entries.length === 0 && (
              <button className={styles.primaryBtn} onClick={openCreate}>Create First PDI Check</button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>SO No.</th>
                  <th>Customer</th>
                  <th>Box No.</th>
                  <th>Product</th>
                  <th className={styles.center}>Qty in Box</th>
                  <th className={styles.center}>Packaging</th>
                  <th className={styles.center}>Label</th>
                  <th className={styles.center}>Qty OK</th>
                  <th className={styles.center}>Result</th>
                  <th>Checked By</th>
                  <th>Date</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td className={styles.mono}>{e.so_no}</td>
                    <td>{e.customer}</td>
                    <td><span className={styles.stagePill}>📦 {e.box_no}</span></td>
                    <td>
                      <span className={styles.productCode}>{e.product_code}</span>
                      <span className={styles.productName}>{e.product_name}</span>
                    </td>
                    <td className={`${styles.center} ${styles.mono}`}>{e.qty_in_box}</td>
                    <td className={styles.center}>
                      <span className={e.packaging_ok ? styles.checkPass : styles.checkFail}>{e.packaging_ok ? '✓' : '✗'}</span>
                    </td>
                    <td className={styles.center}>
                      <span className={e.label_ok ? styles.checkPass : styles.checkFail}>{e.label_ok ? '✓' : '✗'}</span>
                    </td>
                    <td className={styles.center}>
                      <span className={e.qty_verified ? styles.checkPass : styles.checkFail}>{e.qty_verified ? '✓' : '✗'}</span>
                    </td>
                    <td className={styles.center}>
                      <span className={`${styles.resultBadge} ${RESULT_COLOR[e.result]}`}>{e.result}</span>
                    </td>
                    <td className={styles.checkerName}>{e.checker_name}</td>
                    <td className={styles.mono}>{fmt(e.created_at)}</td>
                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => openEdit(e)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteId(e.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Drawer ── */}
      {open && (
        <div className={styles.drawerOverlay} onClick={() => setOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2>{editId !== null ? 'Edit PDI Check' : 'New PDI Check'}</h2>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerBody}>

              {/* Section: Sale Order */}
              <p className={styles.dSectionLabel}>Sale Order Reference</p>

              <div className={styles.dField}>
                <label>Sale Order *</label>
                <select value={form.so_id} onChange={e => handleSOChange(Number(e.target.value))}>
                  <option value={0} disabled>— select sale order —</option>
                  {SALE_ORDERS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.so_no} — {s.customer} (deliver by {s.delivery_date})
                    </option>
                  ))}
                </select>
              </div>

              {form.so_id > 0 && (
                <div className={styles.dField}>
                  <label>Product *</label>
                  <select value={form.product_code} onChange={e => handleProductChange(e.target.value)}>
                    <option value="" disabled>— select product —</option>
                    {soProducts.map(p => (
                      <option key={p.product_code} value={p.product_code}>
                        {p.product_code} — {p.product_name} (qty: {p.qty})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Box No. *</label>
                  <input
                    value={form.box_no}
                    placeholder="e.g. BOX-001"
                    onChange={e => setForm(f => ({ ...f, box_no: e.target.value }))}
                  />
                </div>
                <div className={styles.dField}>
                  <label>Qty in Box</label>
                  <input type="number" min={0} value={form.qty_in_box || ''}
                    onChange={e => setForm(f => ({ ...f, qty_in_box: Number(e.target.value) }))} />
                </div>
              </div>

              {/* Section: Checks */}
              <p className={styles.dSectionLabel}>Inspection Checklist</p>

              <div className={styles.dCheckRow}>
                {[
                  { key: 'packaging_ok' as const, icon: '📦', label: 'Packaging OK', desc: 'Box sealed, no damage, proper cushioning' },
                  { key: 'label_ok'     as const, icon: '🏷️', label: 'Label / Marking OK', desc: 'Customer name, PO no., product code visible' },
                  { key: 'qty_verified' as const, icon: '🔢', label: 'Qty Verified', desc: 'Physical count matches dispatch quantity' },
                ].map(c => (
                  <label key={c.key} className={styles.dCheckCard}
                    style={form[c.key] ? { borderColor:'rgba(74,222,128,0.4)', background:'rgba(74,222,128,0.05)' } : undefined}>
                    <input type="checkbox" checked={form[c.key]}
                      onChange={e => field(c.key, e.target.checked)} />
                    <span style={{ fontSize:'1.2rem' }}>{c.icon}</span>
                    <div>
                      <p style={{ fontWeight:600, fontSize:'0.82rem' }}>{c.label}</p>
                      <p style={{ fontSize:'0.71rem', color:'var(--text-muted)' }}>{c.desc}</p>
                    </div>
                    <span style={{ marginLeft:'auto', fontWeight:700, fontSize:'0.78rem',
                      color: form[c.key] ? '#4ade80' : '#f87171' }}>
                      {form[c.key] ? '✓ OK' : '✗ Fail'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Auto result banner */}
              <div className={styles.pdiResultBanner} style={{
                borderColor: form.result === 'Pass' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)',
                background:  form.result === 'Pass' ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
              }}>
                <span style={{ fontSize:'1.3rem' }}>{form.result === 'Pass' ? '✅' : '❌'}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.88rem', color: form.result === 'Pass' ? '#4ade80' : '#f87171' }}>
                    {form.result === 'Pass' ? 'Cleared for Dispatch' : 'Hold — Dispatch Blocked'}
                  </p>
                  <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    {form.result === 'Pass'
                      ? 'All checks passed. Batch is ready to ship.'
                      : 'One or more checks failed. Resolve issues before dispatch.'}
                  </p>
                </div>
                <div className={styles.dResultRow} style={{ marginLeft:'auto' }}>
                  {RESULTS.map(r => (
                    <button key={r} type="button"
                      className={`${styles.dResultBtn} ${form.result === r ? styles[`dResult${r}`] : ''}`}
                      style={{ minWidth: '72px' }}
                      onClick={() => setForm(f => ({ ...f, result: r }))}>
                      {r === 'Pass' ? '✅' : '❌'} {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checker */}
              <div className={styles.dField}>
                <label>Checked By</label>
                <select value={form.checked_by} onChange={e => setForm(f => ({ ...f, checked_by: Number(e.target.value) }))}>
                  {CHECKERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update PDI Check' : 'Submit PDI Check'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete PDI Check?</h3>
            <p>This inspection record will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn}
                onClick={() => { setEntries(es => es.filter(e => e.id !== deleteId)); setDeleteId(null) }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
