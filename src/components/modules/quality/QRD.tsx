'use client'

import { useState } from 'react'
import styles from './Quality.module.scss'
import qrdStyles from './QRD.module.scss'

// ── Pre-defined choices ───────────────────────────────────

/** Sources of rejection — could come from IQC, PQC, or PDI */
const REJECTION_SOURCES = [
  { id: 1, ref: 'IQC-001', type: 'IQC', description: 'GRN-2024-001 · MS Flat Bar 50×6mm', vendor: 'Apex Metals Pvt Ltd',    product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm' },
  { id: 2, ref: 'IQC-002', type: 'IQC', description: 'GRN-2024-001 · MS Sheet 2mm (CRCA)', vendor: 'Apex Metals Pvt Ltd',   product_code: 'P-004', product_name: 'MS Sheet 2mm (CRCA)' },
  { id: 3, ref: 'IQC-003', type: 'IQC', description: 'GRN-2024-002 · HDPE Granules',       vendor: 'Shree Polymers & Co.', product_code: 'P-002', product_name: 'HDPE Granules (Natural)' },
  { id: 4, ref: 'PQC-002', type: 'PQC', description: 'RC-2024-001 · Welding Stage',        vendor: '— Internal —',          product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm' },
  { id: 5, ref: 'PQC-003', type: 'PQC', description: 'RC-2024-003 · Assembly Stage',       vendor: 'National Fasteners Ltd', product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)' },
  { id: 6, ref: 'PDI-002', type: 'PDI', description: 'SO-2024-001 · BOX-002 · MS Flat Bar',vendor: '— Dispatch Hold —',     product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm' },
]

const REJECTION_REASONS = [
  'Visual Defect / Surface Damage',
  'Dimensional Out of Tolerance',
  'Material Grade / Composition Issue',
  'Incorrect Labelling / Marking',
  'Quantity Short / Over',
  'Porosity / Weld Defect',
  'Thread / Fastener Non-conformance',
  'Packaging Damage',
  'Certificate / Documentation Missing',
  'Customer Complaint Return',
]

const DISPOSITIONS = [
  { value: 'Return to Vendor',  icon: '↩️', desc: 'Reject and return the batch to supplier' },
  { value: 'Scrap',             icon: '🗑️', desc: 'Dispose of material — unfit for any use'  },
  { value: 'Rework',            icon: '🔁', desc: 'Send for in-house correction / repair'     },
  { value: 'Use As Is',         icon: '✅', desc: 'Accept with concession — deviation noted'  },
  { value: 'Re-inspect',        icon: '🔍', desc: 'Repeat inspection with fresh sample'       },
]

const OFFICERS = [
  { id: 1, name: 'Raj Mehta'   },
  { id: 2, name: 'Priya Shah'  },
  { id: 3, name: 'Arjun Patel' },
  { id: 4, name: 'Ritu Nair'   },
]

const STATUSES = ['Open', 'In Progress', 'Closed'] as const
type QRDStatus = typeof STATUSES[number]

type Disposition = typeof DISPOSITIONS[number]['value']

interface QRDEntry {
  id: number
  ncr_no: string
  source_ref: string
  source_type: 'IQC' | 'PQC' | 'PDI'
  product_code: string
  product_name: string
  vendor: string
  rejected_qty: number
  rejection_reason: string
  disposition: string
  action_taken: string
  raised_by: number
  raised_by_name: string
  status: QRDStatus
  created_at: string
}

function genNCR(n: number) { return `NCR-2024-${String(n).padStart(3, '0')}` }

const SEED: QRDEntry[] = [
  {
    id: 1, ncr_no: 'NCR-2024-001',
    source_ref: 'IQC-003', source_type: 'IQC',
    product_code: 'P-002', product_name: 'HDPE Granules (Natural)',
    vendor: 'Shree Polymers & Co.',
    rejected_qty: 30,
    rejection_reason: 'Material Grade / Composition Issue',
    disposition: 'Return to Vendor',
    action_taken: 'Debit note raised. Vendor to re-supply within 7 days.',
    raised_by: 1, raised_by_name: 'Raj Mehta',
    status: 'In Progress', created_at: '2024-02-25T09:00:00Z',
  },
  {
    id: 2, ncr_no: 'NCR-2024-002',
    source_ref: 'PQC-002', source_type: 'PQC',
    product_code: 'P-001', product_name: 'MS Flat Bar 50×6mm',
    vendor: '— Internal —',
    rejected_qty: 4,
    rejection_reason: 'Porosity / Weld Defect',
    disposition: 'Rework',
    action_taken: 'Re-welded 4 joints. Grinding complete. Re-inspection passed.',
    raised_by: 2, raised_by_name: 'Priya Shah',
    status: 'Closed', created_at: '2024-03-04T14:30:00Z',
  },
  {
    id: 3, ncr_no: 'NCR-2024-003',
    source_ref: 'PQC-003', source_type: 'PQC',
    product_code: 'P-003', product_name: 'M8 Hex Bolt 40mm (SS)',
    vendor: 'National Fasteners Ltd',
    rejected_qty: 8,
    rejection_reason: 'Thread / Fastener Non-conformance',
    disposition: 'Return to Vendor',
    action_taken: 'Batch quarantined. NCR sent to vendor for corrective action.',
    raised_by: 3, raised_by_name: 'Arjun Patel',
    status: 'Open', created_at: '2024-03-09T12:00:00Z',
  },
]

const EMPTY_FORM = {
  source_id:        0,
  rejected_qty:     0,
  rejection_reason: '',
  disposition:      '',
  action_taken:     '',
  raised_by:        1,
  status:           'Open' as QRDStatus,
}

let nextId  = SEED.length + 1

const STATUS_STYLE: Record<QRDStatus, string> = {
  'Open':        qrdStyles.statusOpen,
  'In Progress': qrdStyles.statusInProgress,
  'Closed':      qrdStyles.statusClosed,
}

const DISP_STYLE: Record<string, string> = {
  'Return to Vendor': qrdStyles.dispReturn,
  'Scrap':            qrdStyles.dispScrap,
  'Rework':           qrdStyles.dispRework,
  'Use As Is':        qrdStyles.dispUseAsIs,
  'Re-inspect':       qrdStyles.dispReinspect,
}

const SOURCE_BADGE: Record<string, string> = {
  IQC: qrdStyles.srcIQC,
  PQC: qrdStyles.srcPQC,
  PDI: qrdStyles.srcPDI,
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function QRD() {
  const [entries, setEntries] = useState<QRDEntry[]>(SEED)
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('All')
  const [dispF, setDispF]     = useState('All')
  const [open, setOpen]       = useState(false)
  const [editId, setEditId]   = useState<number | null>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const selectedSource = REJECTION_SOURCES.find(s => s.id === form.source_id)
  const selectedDisp   = DISPOSITIONS.find(d => d.value === form.disposition)

  // Stats
  const total       = entries.length
  const open_count  = entries.filter(e => e.status === 'Open').length
  const inprog      = entries.filter(e => e.status === 'In Progress').length
  const closed      = entries.filter(e => e.status === 'Closed').length

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    return (!q || e.ncr_no.toLowerCase().includes(q) || e.product_name.toLowerCase().includes(q) ||
      e.vendor.toLowerCase().includes(q) || e.rejection_reason.toLowerCase().includes(q) ||
      e.source_ref.toLowerCase().includes(q)) &&
      (statusF === 'All' || e.status === statusF) &&
      (dispF   === 'All' || e.disposition === dispF)
  })

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(e: QRDEntry) {
    const src = REJECTION_SOURCES.find(s => s.ref === e.source_ref)
    setForm({
      source_id:        src?.id ?? 0,
      rejected_qty:     e.rejected_qty,
      rejection_reason: e.rejection_reason,
      disposition:      e.disposition,
      action_taken:     e.action_taken,
      raised_by:        e.raised_by,
      status:           e.status,
    })
    setEditId(e.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    const src     = REJECTION_SOURCES.find(s => s.id === form.source_id)!
    const officer = OFFICERS.find(o => o.id === form.raised_by)!

    if (editId !== null) {
      setEntries(es => es.map(e => e.id === editId ? {
        ...e,
        source_ref: src.ref, source_type: src.type as any,
        product_code: src.product_code, product_name: src.product_name,
        vendor: src.vendor, rejected_qty: form.rejected_qty,
        rejection_reason: form.rejection_reason, disposition: form.disposition,
        action_taken: form.action_taken,
        raised_by: officer.id, raised_by_name: officer.name,
        status: form.status,
      } : e))
    } else {
      const entry: QRDEntry = {
        id: nextId, ncr_no: genNCR(nextId++),
        source_ref: src.ref, source_type: src.type as any,
        product_code: src.product_code, product_name: src.product_name,
        vendor: src.vendor, rejected_qty: form.rejected_qty,
        rejection_reason: form.rejection_reason, disposition: form.disposition,
        action_taken: form.action_taken,
        raised_by: officer.id, raised_by_name: officer.name,
        status: form.status,
        created_at: new Date().toISOString(),
      }
      setEntries(es => [entry, ...es])
    }
    setSaving(false); setOpen(false)
  }

  const canSave = form.source_id > 0 && form.rejection_reason !== '' && form.disposition !== ''

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quality Rejection Disposition (QRD)</h1>
          <p className={styles.subtitle}>Non-conformance records — track rejection, root cause and corrective action</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ Raise NCR</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{total}</p>
          <p className={styles.statLabel}>Total NCRs</p>
        </div>
        <div className={`${styles.statCard} ${open_count > 0 ? styles.statRed : ''}`}>
          <p className={styles.statVal}>{open_count}</p>
          <p className={styles.statLabel}>Open</p>
        </div>
        <div className={`${styles.statCard} ${inprog > 0 ? styles.statAmber : ''}`}>
          <p className={styles.statVal}>{inprog}</p>
          <p className={styles.statLabel}>In Progress</p>
        </div>
        <div className={`${styles.statCard} ${closed > 0 ? styles.statGreen : ''}`}>
          <p className={styles.statVal}>{closed}</p>
          <p className={styles.statLabel}>Closed</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput}
            placeholder="Search NCR no., product, vendor, reason…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={dispF} onChange={e => setDispF(e.target.value)}>
          <option value="All">All Dispositions</option>
          {DISPOSITIONS.map(d => <option key={d.value}>{d.value}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table / Cards */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>{entries.length === 0 ? 'No NCRs raised yet.' : 'No records match your filter.'}</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NCR No.</th>
                  <th>Source</th>
                  <th>Product</th>
                  <th>Vendor / Dept</th>
                  <th className={styles.center}>Rej. Qty</th>
                  <th>Rejection Reason</th>
                  <th>Disposition</th>
                  <th>Status</th>
                  <th>Raised By</th>
                  <th>Date</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{e.ncr_no}</td>
                    <td>
                      <span className={`${qrdStyles.srcBadge} ${SOURCE_BADGE[e.source_type]}`}>
                        {e.source_type}
                      </span>
                      <span className={qrdStyles.srcRef}>{e.source_ref}</span>
                    </td>
                    <td>
                      <span className={styles.productCode}>{e.product_code}</span>
                      <span className={styles.productName}>{e.product_name}</span>
                    </td>
                    <td className={qrdStyles.vendorCell}>{e.vendor}</td>
                    <td className={`${styles.center} ${styles.mono} ${styles.bad}`}>{e.rejected_qty}</td>
                    <td className={qrdStyles.reasonCell}>{e.rejection_reason}</td>
                    <td>
                      <span className={`${qrdStyles.dispBadge} ${DISP_STYLE[e.disposition] ?? ''}`}>
                        {e.disposition}
                      </span>
                    </td>
                    <td>
                      <span className={`${qrdStyles.statusBadge} ${STATUS_STYLE[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className={styles.checkerName}>{e.raised_by_name}</td>
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
              <div>
                <h2>{editId !== null ? 'Edit NCR' : 'Raise New NCR'}</h2>
                {editId === null && <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'2px' }}>
                  Non-Conformance Report
                </p>}
              </div>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerBody}>

              {/* Source Reference */}
              <p className={styles.dSectionLabel}>Rejection Reference</p>

              <div className={styles.dField}>
                <label>Rejection Source *</label>
                <select value={form.source_id} onChange={e => set('source_id', Number(e.target.value) as any)}>
                  <option value={0} disabled>— select source (IQC / PQC / PDI ref) —</option>
                  {REJECTION_SOURCES.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.type}] {s.ref} — {s.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled info */}
              {selectedSource && (
                <div className={qrdStyles.sourceInfoCard}>
                  <div className={qrdStyles.sourceInfoRow}>
                    <span className={qrdStyles.sourceInfoLabel}>Product</span>
                    <span>{selectedSource.product_code} — {selectedSource.product_name}</span>
                  </div>
                  <div className={qrdStyles.sourceInfoRow}>
                    <span className={qrdStyles.sourceInfoLabel}>Vendor / Source</span>
                    <span>{selectedSource.vendor}</span>
                  </div>
                  <div className={qrdStyles.sourceInfoRow}>
                    <span className={qrdStyles.sourceInfoLabel}>Type</span>
                    <span className={`${qrdStyles.srcBadge} ${SOURCE_BADGE[selectedSource.type]}`}>{selectedSource.type}</span>
                  </div>
                </div>
              )}

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Rejected Qty</label>
                  <input type="number" min={0} value={form.rejected_qty || ''}
                    onChange={e => set('rejected_qty', Number(e.target.value) as any)}
                    placeholder="e.g. 10" />
                </div>
                <div className={styles.dField}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Rejection Reason */}
              <p className={styles.dSectionLabel}>Root Cause & Decision</p>

              <div className={styles.dField}>
                <label>Rejection Reason *</label>
                <select value={form.rejection_reason} onChange={e => set('rejection_reason', e.target.value as any)}>
                  <option value="" disabled>— select reason —</option>
                  {REJECTION_REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              {/* Disposition */}
              <div className={styles.dField}>
                <label>Disposition Decision *</label>
                <div className={qrdStyles.dispGrid}>
                  {DISPOSITIONS.map(d => (
                    <button key={d.value} type="button"
                      className={`${qrdStyles.dispCard} ${form.disposition === d.value ? qrdStyles.dispCardActive : ''}`}
                      onClick={() => set('disposition', d.value as any)}>
                      <span className={qrdStyles.dispCardIcon}>{d.icon}</span>
                      <span className={qrdStyles.dispCardLabel}>{d.value}</span>
                      <span className={qrdStyles.dispCardDesc}>{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Taken */}
              <div className={styles.dField}>
                <label>Action Taken / Corrective Action</label>
                <textarea rows={3}
                  placeholder="Describe steps taken, debit note number, vendor response, etc…"
                  value={form.action_taken}
                  onChange={e => set('action_taken', e.target.value as any)}
                  className={styles.textarea}
                />
              </div>

              {/* Raised By */}
              <div className={styles.dField}>
                <label>Raised By</label>
                <select value={form.raised_by} onChange={e => set('raised_by', Number(e.target.value) as any)}>
                  {OFFICERS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update NCR' : 'Raise NCR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete NCR?</h3>
            <p>This non-conformance record will be permanently removed.</p>
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
