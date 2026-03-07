'use client'

import { useState } from 'react'
import styles from './Quality.module.scss'

// ── Pre-defined choices ───────────────────────────────────
const ROUTE_CARDS = [
  { id: 1, rc_no: 'RC-2024-001', batch: 'BATCH-APX-24001', product_id: 1, product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',    status: 'In Progress' },
  { id: 2, rc_no: 'RC-2024-002', batch: 'BATCH-APX-24002', product_id: 4, product_code: 'P-004', product_name: 'MS Sheet 2mm (CRCA)',    status: 'Open'        },
  { id: 3, rc_no: 'RC-2024-003', batch: 'BATCH-NF-24007',  product_id: 3, product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)', status: 'In Progress' },
  { id: 4, rc_no: 'RC-2024-004', batch: 'BATCH-SP-24010',  product_id: 2, product_code: 'P-002', product_name: 'HDPE Granules (Natural)',status: 'Open'        },
]

const OPERATORS = [
  { id: 1, name: 'Raj Mehta'   },
  { id: 2, name: 'Arjun Patel' },
  { id: 3, name: 'Ritu Nair'   },
  { id: 4, name: 'Dev Sharma'  },
]

const STAGES = [
  { label: 'Raw Material Check',  icon: '📦' },
  { label: 'Cutting',             icon: '✂️'  },
  { label: 'Bending / Forming',   icon: '🔩' },
  { label: 'Welding',             icon: '⚡' },
  { label: 'Surface Treatment',   icon: '🖌️' },
  { label: 'Machining',           icon: '⚙️'  },
  { label: 'Assembly',            icon: '🔧' },
  { label: 'Testing',             icon: '🧪' },
  { label: 'Final Inspection',    icon: '✅' },
]

const RESULTS = ['Pass', 'Fail', 'Rework'] as const
type Result = typeof RESULTS[number]

interface PQCEntry {
  id: number
  route_card_id: number
  route_card_no: string
  batch_no: string
  product_code: string
  product_name: string
  stage_name: string
  stage_icon: string
  operator_id: number
  operator_name: string
  result: Result
  remarks: string
  created_at: string
}

const SEED: PQCEntry[] = [
  {
    id: 1, route_card_id: 1, route_card_no: 'RC-2024-001', batch_no: 'BATCH-APX-24001',
    product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',
    stage_name: 'Cutting', stage_icon: '✂️',
    operator_id: 2, operator_name: 'Arjun Patel',
    result: 'Pass', remarks: 'All cuts within ±0.5mm tolerance. No burrs observed.',
    created_at: '2024-03-02T09:00:00Z',
  },
  {
    id: 2, route_card_id: 1, route_card_no: 'RC-2024-001', batch_no: 'BATCH-APX-24001',
    product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',
    stage_name: 'Welding', stage_icon: '⚡',
    operator_id: 2, operator_name: 'Arjun Patel',
    result: 'Rework', remarks: 'Porosity on 4 joints. Re-weld and grind before next stage.',
    created_at: '2024-03-04T14:00:00Z',
  },
  {
    id: 3, route_card_id: 3, route_card_no: 'RC-2024-003', batch_no: 'BATCH-NF-24007',
    product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)',
    stage_name: 'Assembly', stage_icon: '🔧',
    operator_id: 1, operator_name: 'Raj Mehta',
    result: 'Fail', remarks: 'Thread depth out of spec on 8 bolts. Batch quarantined for vendor NCR.',
    created_at: '2024-03-09T11:30:00Z',
  },
]

const EMPTY_FORM = {
  route_card_id: 0,
  stage_name: '',
  operator_id: 1,
  result: 'Pass' as Result,
  remarks: '',
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

export default function PQC() {
  const [entries, setEntries] = useState<PQCEntry[]>(SEED)
  const [search, setSearch]   = useState('')
  const [resultF, setResultF] = useState('All')
  const [stageF, setStageF]   = useState('All')
  const [open, setOpen]       = useState(false)
  const [editId, setEditId]   = useState<number | null>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const selectedRC = ROUTE_CARDS.find(r => r.id === form.route_card_id)

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(e: PQCEntry) {
    setForm({ route_card_id: e.route_card_id, stage_name: e.stage_name, operator_id: e.operator_id, result: e.result, remarks: e.remarks })
    setEditId(e.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    const rc       = ROUTE_CARDS.find(r => r.id === form.route_card_id)!
    const operator = OPERATORS.find(o => o.id === form.operator_id)!
    const stage    = STAGES.find(s => s.label === form.stage_name)

    if (editId !== null) {
      setEntries(es => es.map(e => e.id === editId ? {
        ...e, route_card_id: rc.id, route_card_no: rc.rc_no, batch_no: rc.batch,
        product_code: rc.product_code, product_name: rc.product_name,
        stage_name: form.stage_name, stage_icon: stage?.icon ?? '🔍',
        operator_id: operator.id, operator_name: operator.name,
        result: form.result, remarks: form.remarks,
      } : e))
    } else {
      const entry: PQCEntry = {
        id: nextId++,
        route_card_id: rc.id, route_card_no: rc.rc_no, batch_no: rc.batch,
        product_code: rc.product_code, product_name: rc.product_name,
        stage_name: form.stage_name, stage_icon: stage?.icon ?? '🔍',
        operator_id: operator.id, operator_name: operator.name,
        result: form.result, remarks: form.remarks,
        created_at: new Date().toISOString(),
      }
      setEntries(es => [entry, ...es])
    }
    setSaving(false); setOpen(false)
  }

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.route_card_no.toLowerCase().includes(q) || e.product_name.toLowerCase().includes(q) ||
      e.operator_name.toLowerCase().includes(q) || e.stage_name.toLowerCase().includes(q)) &&
      (resultF === 'All' || e.result === resultF) &&
      (stageF  === 'All' || e.stage_name === stageF)
  })

  const pass   = entries.filter(e => e.result === 'Pass').length
  const fail   = entries.filter(e => e.result === 'Fail').length
  const rework = entries.filter(e => e.result === 'Rework').length
  const passRate = entries.length ? Math.round(pass / entries.length * 100) : 0
  const uniqueStages = ['All', ...Array.from(new Set(entries.map(e => e.stage_name)))]
  const canSave = form.route_card_id > 0 && form.stage_name !== ''

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Process Quality Control (PQC)</h1>
          <p className={styles.subtitle}>{entries.length} inspections · {passRate}% pass rate across all stages</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ New PQC Check</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}><p className={styles.statVal}>{entries.length}</p><p className={styles.statLabel}>Total Checks</p></div>
        <div className={`${styles.statCard} ${styles.statGreen}`}><p className={styles.statVal}>{pass}</p><p className={styles.statLabel}>Passed</p></div>
        <div className={`${styles.statCard} ${fail > 0 ? styles.statRed : ''}`}><p className={styles.statVal}>{fail}</p><p className={styles.statLabel}>Failed</p></div>
        <div className={`${styles.statCard} ${rework > 0 ? styles.statAmber : ''}`}><p className={styles.statVal}>{rework}</p><p className={styles.statLabel}>Rework</p></div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput} placeholder="Search route card, product, operator…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={stageF} onChange={e => setStageF(e.target.value)}>
          {uniqueStages.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={resultF} onChange={e => setResultF(e.target.value)}>
          <option value="All">All Results</option>
          {RESULTS.map(r => <option key={r}>{r}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}><span className={styles.emptyIcon}>🔧</span><p>No PQC entries match your filter.</p></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr>
                <th>#</th><th>Route Card</th><th>Batch</th><th>Product</th>
                <th>Stage</th><th>Operator</th>
                <th className={styles.center}>Result</th><th>Remarks</th><th>Date</th>
                <th className={styles.center}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{i + 1}</td>
                    <td className={styles.mono}>{e.route_card_no}</td>
                    <td className={styles.mono}>{e.batch_no}</td>
                    <td><span className={styles.productCode}>{e.product_code}</span><span className={styles.productName}>{e.product_name}</span></td>
                    <td><span className={styles.stagePill}><span>{e.stage_icon}</span>{e.stage_name}</span></td>
                    <td className={styles.checkerName}>{e.operator_name}</td>
                    <td className={styles.center}><span className={`${styles.resultBadge} ${RESULT_COLOR[e.result]}`}>{e.result}</span></td>
                    <td className={styles.remarksCell}>{e.remarks || '—'}</td>
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
              <h2>{editId !== null ? 'Edit PQC Check' : 'New PQC Check'}</h2>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className={styles.drawerBody}>

              {/* Route Card */}
              <div className={styles.dField}>
                <label>Route Card *</label>
                <select value={form.route_card_id} onChange={e => set('route_card_id', Number(e.target.value) as any)}>
                  <option value={0} disabled>— select route card —</option>
                  {ROUTE_CARDS.map(rc => (
                    <option key={rc.id} value={rc.id}>
                      {rc.rc_no} · {rc.batch} — {rc.product_name} [{rc.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Product / Batch (auto-filled) */}
              {selectedRC && (
                <div className={styles.dRow}>
                  <div className={styles.dField}>
                    <label>Product</label>
                    <input value={`${selectedRC.product_code} — ${selectedRC.product_name}`} disabled />
                  </div>
                  <div className={styles.dField}>
                    <label>Batch No.</label>
                    <input value={selectedRC.batch} disabled />
                  </div>
                </div>
              )}

              {/* Stage */}
              <div className={styles.dField}>
                <label>Production Stage *</label>
                <div className={styles.stageGrid}>
                  {STAGES.map(s => (
                    <button key={s.label} type="button"
                      className={`${styles.stageCard} ${form.stage_name === s.label ? styles.stageCardActive : ''}`}
                      onClick={() => set('stage_name', s.label as any)}>
                      <span className={styles.stageIcon}>{s.icon}</span>
                      <span className={styles.stageLabel}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className={styles.dField}>
                <label>Inspection Result</label>
                <div className={styles.dResultRow}>
                  {RESULTS.map(r => (
                    <button key={r} type="button"
                      className={`${styles.dResultBtn} ${form.result === r ? styles[`dResult${r}`] : ''}`}
                      onClick={() => set('result', r)}>
                      {r === 'Pass' ? '✅' : r === 'Fail' ? '❌' : '🔁'} {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator */}
              <div className={styles.dField}>
                <label>Operator / Inspector</label>
                <select value={form.operator_id} onChange={e => set('operator_id', Number(e.target.value) as any)}>
                  {OPERATORS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              {/* Remarks */}
              <div className={styles.dField}>
                <label>Remarks / Observations</label>
                <textarea rows={3}
                  placeholder={form.result === 'Fail' ? 'Describe defect and recommended action…' : form.result === 'Rework' ? 'Describe what needs correction…' : 'Optional observations…'}
                  value={form.remarks}
                  onChange={e => set('remarks', e.target.value as any)}
                  className={`${styles.textarea} ${form.result !== 'Pass' ? styles.textareaWarn : ''}`}
                />
                {form.result === 'Fail' && <span className={styles.dHintDanger}>⚠ Detailed description recommended for NCR tracking.</span>}
              </div>

            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update Check' : 'Submit PQC Check'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete PQC Check?</h3>
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
