'use client'

import { useState, useMemo } from 'react'
import styles from './Quality.module.scss'

// ── Pre-defined choices (no Supabase needed) ─────────────
const GRNS = [
  { id: 1, grn_no: 'GRN-2024-001', vendor: 'Apex Metals Pvt Ltd',    date: '14 Feb 2024' },
  { id: 2, grn_no: 'GRN-2024-002', vendor: 'Shree Polymers & Co.',   date: '24 Feb 2024' },
  { id: 3, grn_no: 'GRN-2024-003', vendor: 'National Fasteners Ltd', date: '09 Mar 2024' },
  { id: 4, grn_no: 'GRN-2024-004', vendor: 'Apex Metals Pvt Ltd',    date: '22 Mar 2024' },
]

const GRN_PRODUCTS: Record<number, { id: number; code: string; name: string; recv_qty: number }[]> = {
  1: [
    { id: 1, code: 'P-001', name: 'MS Flat Bar 50×6mm',   recv_qty: 500 },
    { id: 4, code: 'P-004', name: 'MS Sheet 2mm (CRCA)',   recv_qty: 200 },
  ],
  2: [
    { id: 2, code: 'P-002', name: 'HDPE Granules (Natural)', recv_qty: 295 },
  ],
  3: [
    { id: 3, code: 'P-003', name: 'M8 Hex Bolt 40mm (SS)',  recv_qty: 1000 },
  ],
  4: [
    { id: 1, code: 'P-001', name: 'MS Flat Bar 50×6mm',   recv_qty: 300 },
    { id: 4, code: 'P-004', name: 'MS Sheet 2mm (CRCA)',   recv_qty: 150 },
  ],
}

const CHECKERS = [
  { id: 1, name: 'Raj Mehta'   },
  { id: 2, name: 'Priya Shah'  },
  { id: 3, name: 'Arjun Patel' },
  { id: 4, name: 'Ritu Nair'   },
]

const RESULTS = ['Pass', 'Fail', 'Rework'] as const
type Result = typeof RESULTS[number]

interface IQCEntry {
  id: number
  grn_id: number
  grn_no: string
  vendor_name: string
  product_id: number
  product_code: string
  product_name: string
  total_qty: number
  sample_size: number
  accepted_qty: number
  rejected_qty: number
  visual_check: boolean
  dimension_check: boolean
  result: Result
  checked_by: number
  checker_name: string
  created_at: string
}

const SEED: IQCEntry[] = [
  {
    id: 1, grn_id: 1, grn_no: 'GRN-2024-001', vendor_name: 'Apex Metals Pvt Ltd',
    product_id: 1, product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',
    total_qty: 500, sample_size: 50, accepted_qty: 50, rejected_qty: 0,
    visual_check: true, dimension_check: true, result: 'Pass',
    checked_by: 1, checker_name: 'Raj Mehta', created_at: '2024-02-14T10:00:00Z',
  },
  {
    id: 2, grn_id: 1, grn_no: 'GRN-2024-001', vendor_name: 'Apex Metals Pvt Ltd',
    product_id: 4, product_code: 'P-004', product_name: 'MS Sheet 2mm (CRCA)',
    total_qty: 200, sample_size: 20, accepted_qty: 18, rejected_qty: 2,
    visual_check: false, dimension_check: true, result: 'Rework',
    checked_by: 2, checker_name: 'Priya Shah', created_at: '2024-02-14T11:00:00Z',
  },
  {
    id: 3, grn_id: 2, grn_no: 'GRN-2024-002', vendor_name: 'Shree Polymers & Co.',
    product_id: 2, product_code: 'P-002', product_name: 'HDPE Granules (Natural)',
    total_qty: 295, sample_size: 30, accepted_qty: 15, rejected_qty: 15,
    visual_check: true, dimension_check: false, result: 'Fail',
    checked_by: 3, checker_name: 'Arjun Patel', created_at: '2024-02-24T09:30:00Z',
  },
]

const EMPTY_FORM = {
  grn_id: 0,
  product_id: 0,
  total_qty: 0, sample_size: 0, accepted_qty: 0, rejected_qty: 0,
  visual_check: false, dimension_check: false,
  result: 'Pass' as Result,
  checked_by: 1,
}

let nextId = SEED.length + 1

const RESULT_COLOR: Record<string, string> = {
  Pass:   styles.resultPass,
  Fail:   styles.resultFail,
  Rework: styles.resultRework,
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function autoResult(accepted: number, rejected: number, sample: number, visual: boolean, dim: boolean): Result {
  if (sample === 0) return 'Pass'
  const rate = rejected / sample
  if (rate === 0 && visual && dim) return 'Pass'
  if (rate > 0.1 || (!visual && !dim)) return 'Fail'
  if (rate > 0) return 'Rework'
  return 'Pass'
}

export default function IQC() {
  const [entries, setEntries] = useState<IQCEntry[]>(SEED)
  const [search, setSearch]   = useState('')
  const [resultF, setResultF] = useState('All')
  const [open, setOpen]       = useState(false)
  const [editId, setEditId]   = useState<number | null>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Products available for selected GRN
  const grnProducts = form.grn_id ? (GRN_PRODUCTS[form.grn_id] ?? []) : []
  const selectedGRN = GRNS.find(g => g.id === form.grn_id)
  const selectedProduct = grnProducts.find(p => p.id === form.product_id)

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => {
      const next = { ...f, [k]: v }
      // Auto-derive result whenever qty or checks change
      next.result = autoResult(next.accepted_qty, next.rejected_qty, next.sample_size, next.visual_check, next.dimension_check)
      return next
    })
  }

  function handleGRNChange(grnId: number) {
    setForm(f => ({ ...f, grn_id: grnId, product_id: 0, total_qty: 0, sample_size: 0, accepted_qty: 0, rejected_qty: 0 }))
  }

  function handleProductChange(prodId: number) {
    const p = grnProducts.find(x => x.id === prodId)
    const tq = p?.recv_qty ?? 0
    const ss = Math.max(1, Math.ceil(tq * 0.1))
    setForm(f => ({
      ...f, product_id: prodId,
      total_qty: tq, sample_size: ss,
      accepted_qty: ss, rejected_qty: 0,
      result: 'Pass',
    }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(e: IQCEntry) {
    setForm({
      grn_id: e.grn_id, product_id: e.product_id,
      total_qty: e.total_qty, sample_size: e.sample_size,
      accepted_qty: e.accepted_qty, rejected_qty: e.rejected_qty,
      visual_check: e.visual_check, dimension_check: e.dimension_check,
      result: e.result, checked_by: e.checked_by,
    })
    setEditId(e.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    const grn     = GRNS.find(g => g.id === form.grn_id)!
    const product = grnProducts.find(p => p.id === form.product_id)
        || GRN_PRODUCTS[form.grn_id]?.find(p => p.id === form.product_id)
        || { id: form.product_id, code: '—', name: '—', recv_qty: 0 }
    const checker = CHECKERS.find(c => c.id === form.checked_by)!

    if (editId !== null) {
      setEntries(es => es.map(e => e.id === editId ? {
        ...e, ...form,
        grn_no: grn.grn_no, vendor_name: grn.vendor,
        product_code: product.code, product_name: product.name,
        checker_name: checker.name,
      } : e))
    } else {
      const entry: IQCEntry = {
        id: nextId++,
        grn_id: form.grn_id, grn_no: grn.grn_no, vendor_name: grn.vendor,
        product_id: form.product_id, product_code: product.code, product_name: product.name,
        total_qty: form.total_qty, sample_size: form.sample_size,
        accepted_qty: form.accepted_qty, rejected_qty: form.rejected_qty,
        visual_check: form.visual_check, dimension_check: form.dimension_check,
        result: form.result, checked_by: form.checked_by, checker_name: checker.name,
        created_at: new Date().toISOString(),
      }
      setEntries(es => [entry, ...es])
    }
    setSaving(false); setOpen(false)
  }

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.grn_no.toLowerCase().includes(q) || e.vendor_name.toLowerCase().includes(q) ||
      e.product_name.toLowerCase().includes(q) || e.checker_name.toLowerCase().includes(q)) &&
      (resultF === 'All' || e.result === resultF)
  })

  const pass    = entries.filter(e => e.result === 'Pass').length
  const fail    = entries.filter(e => e.result === 'Fail').length
  const rework  = entries.filter(e => e.result === 'Rework').length
  const passRate = entries.length ? Math.round(pass / entries.length * 100) : 0
  const canSave = form.grn_id > 0 && form.product_id > 0 && form.sample_size > 0

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Incoming Quality Control (IQC)</h1>
          <p className={styles.subtitle}>{entries.length} inspections · {passRate}% pass rate</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ New IQC Entry</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}><p className={styles.statVal}>{entries.length}</p><p className={styles.statLabel}>Total Inspections</p></div>
        <div className={`${styles.statCard} ${styles.statGreen}`}><p className={styles.statVal}>{pass}</p><p className={styles.statLabel}>Passed</p></div>
        <div className={`${styles.statCard} ${fail > 0 ? styles.statRed : ''}`}><p className={styles.statVal}>{fail}</p><p className={styles.statLabel}>Failed</p></div>
        <div className={`${styles.statCard} ${rework > 0 ? styles.statAmber : ''}`}><p className={styles.statVal}>{rework}</p><p className={styles.statLabel}>Rework</p></div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput} placeholder="Search GRN, vendor, product…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={resultF} onChange={e => setResultF(e.target.value)}>
          <option value="All">All Results</option>
          {RESULTS.map(r => <option key={r}>{r}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}><span className={styles.emptyIcon}>🔬</span><p>No IQC entries match your filter.</p></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th>#</th><th>GRN No.</th><th>Vendor</th><th>Product</th>
                <th className={styles.center}>Total</th><th className={styles.center}>Sample</th>
                <th className={styles.center}>Accept</th><th className={styles.center}>Reject</th>
                <th className={styles.center}>Visual</th><th className={styles.center}>Dim.</th>
                <th className={styles.center}>Result</th><th>Checked By</th><th>Date</th>
                <th className={styles.center}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td className={styles.mono}>{e.grn_no}</td>
                    <td>{e.vendor_name}</td>
                    <td><span className={styles.productCode}>{e.product_code}</span><span className={styles.productName}>{e.product_name}</span></td>
                    <td className={`${styles.center} ${styles.mono}`}>{e.total_qty}</td>
                    <td className={`${styles.center} ${styles.mono}`}>{e.sample_size}</td>
                    <td className={`${styles.center} ${styles.mono} ${styles.good}`}>{e.accepted_qty}</td>
                    <td className={`${styles.center} ${styles.mono} ${e.rejected_qty > 0 ? styles.bad : ''}`}>{e.rejected_qty}</td>
                    <td className={styles.center}><span className={e.visual_check ? styles.checkPass : styles.checkFail}>{e.visual_check ? '✓' : '✗'}</span></td>
                    <td className={styles.center}><span className={e.dimension_check ? styles.checkPass : styles.checkFail}>{e.dimension_check ? '✓' : '✗'}</span></td>
                    <td className={styles.center}><span className={`${styles.resultBadge} ${RESULT_COLOR[e.result]}`}>{e.result}</span></td>
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
              <h2>{editId !== null ? 'Edit IQC Entry' : 'New IQC Entry'}</h2>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className={styles.drawerBody}>

              {/* GRN */}
              <div className={styles.dField}>
                <label>GRN Reference *</label>
                <select value={form.grn_id} onChange={e => handleGRNChange(Number(e.target.value))}>
                  <option value={0} disabled>— select GRN —</option>
                  {GRNS.map(g => (
                    <option key={g.id} value={g.id}>{g.grn_no} — {g.vendor} ({g.date})</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div className={styles.dField}>
                <label>Product *</label>
                <select
                  value={form.product_id}
                  onChange={e => handleProductChange(Number(e.target.value))}
                  disabled={!form.grn_id}
                >
                  <option value={0} disabled>{form.grn_id ? '— select product —' : '— select GRN first —'}</option>
                  {grnProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name} (received: {p.recv_qty})</option>
                  ))}
                </select>
              </div>

              {/* Vendor (read-only) */}
              {selectedGRN && (
                <div className={styles.dField}>
                  <label>Vendor</label>
                  <input value={selectedGRN.vendor} disabled />
                </div>
              )}

              {/* Qty row */}
              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Total Received Qty *</label>
                  <input type="number" min={0} value={form.total_qty || ''}
                    onChange={e => set('total_qty', Number(e.target.value))} />
                </div>
                <div className={styles.dField}>
                  <label>Sample Size *</label>
                  <input type="number" min={1} value={form.sample_size || ''}
                    onChange={e => set('sample_size', Number(e.target.value))} />
                  {form.total_qty > 0 && form.sample_size > 0 &&
                    <span className={styles.dHint}>{((form.sample_size / form.total_qty) * 100).toFixed(0)}% of batch</span>}
                </div>
              </div>

              {/* Accepted / Rejected */}
              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Accepted Qty *</label>
                  <input type="number" min={0} max={form.sample_size} value={form.accepted_qty || ''}
                    onChange={e => {
                      const acc = Number(e.target.value)
                      setForm(f => {
                        const rej = Math.max(0, f.sample_size - acc)
                        return { ...f, accepted_qty: acc, rejected_qty: rej,
                          result: autoResult(acc, rej, f.sample_size, f.visual_check, f.dimension_check) }
                      })
                    }}
                  />
                </div>
                <div className={styles.dField}>
                  <label>Rejected Qty</label>
                  <input type="number" min={0} value={form.rejected_qty}
                    onChange={e => set('rejected_qty', Number(e.target.value))}
                    style={form.rejected_qty > 0 ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined} />
                  {form.rejected_qty > 0 && form.sample_size > 0 &&
                    <span className={styles.dHintDanger}>{((form.rejected_qty / form.sample_size) * 100).toFixed(1)}% rejection</span>}
                </div>
              </div>

              {/* Quality Checks */}
              <div className={styles.dCheckRow}>
                <label className={styles.dCheckCard} style={form.visual_check ? { borderColor:'rgba(74,222,128,0.4)', background:'rgba(74,222,128,0.05)' } : undefined}>
                  <input type="checkbox" checked={form.visual_check} onChange={e => set('visual_check', e.target.checked)} />
                  <span style={{ fontSize:'1.2rem' }}>👁</span>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.82rem' }}>Visual Check</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Surface, finish, labelling</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontWeight:700, fontSize:'0.78rem', color: form.visual_check ? '#4ade80' : '#f87171' }}>
                    {form.visual_check ? '✓ OK' : '✗ Fail'}
                  </span>
                </label>

                <label className={styles.dCheckCard} style={form.dimension_check ? { borderColor:'rgba(74,222,128,0.4)', background:'rgba(74,222,128,0.05)' } : undefined}>
                  <input type="checkbox" checked={form.dimension_check} onChange={e => set('dimension_check', e.target.checked)} />
                  <span style={{ fontSize:'1.2rem' }}>📐</span>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.82rem' }}>Dimension Check</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Size, weight, tolerance</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontWeight:700, fontSize:'0.78rem', color: form.dimension_check ? '#4ade80' : '#f87171' }}>
                    {form.dimension_check ? '✓ OK' : '✗ Fail'}
                  </span>
                </label>
              </div>

              {/* Result */}
              <div className={styles.dField}>
                <label>Inspection Result</label>
                <div className={styles.dResultRow}>
                  {RESULTS.map(r => (
                    <button key={r} type="button"
                      className={`${styles.dResultBtn} ${form.result === r ? styles[`dResult${r}`] : ''}`}
                      onClick={() => setForm(f => ({ ...f, result: r }))}>
                      {r === 'Pass' ? '✅' : r === 'Fail' ? '❌' : '🔁'} {r}
                    </button>
                  ))}
                </div>
                <span className={styles.dHint}>Auto-suggested from rejection rate & checks. Override if needed.</span>
              </div>

              {/* Checked By */}
              <div className={styles.dField}>
                <label>Checked By</label>
                <select value={form.checked_by} onChange={e => set('checked_by', Number(e.target.value))}>
                  {CHECKERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update Entry' : 'Submit IQC Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete IQC Entry?</h3>
            <p>This inspection record will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => { setEntries(es => es.filter(e => e.id !== deleteId)); setDeleteId(null) }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
