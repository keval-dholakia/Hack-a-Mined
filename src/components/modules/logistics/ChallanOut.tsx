'use client'

import { useState } from 'react'
import cStyles from './ChallanOut.module.scss'
import ChallanOutAnalytics from './ChallanOutAnalytics'

/* ── Palette & constants ──────────────────────────────────── */
const GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

export const STATUS_COLOR: Record<string, string> = { Draft: '#6b7280', Issued: CYAN, Dispatched: '#6366f1', Delivered: GREEN, Returned: AMBER, Cancelled: ROSE }
export const STATUS_BG: Record<string, string> = { Draft: 'rgba(107,114,128,0.12)', Issued: `${CYAN}18`, Dispatched: 'rgba(99,102,241,0.12)', Delivered: `${GREEN}18`, Returned: `${AMBER}18`, Cancelled: `${ROSE}18` }
export const TYPE_COLOR: Record<string, string> = { 'Sale': GREEN, 'Loan/Returnable': CYAN, 'Job Work': PURPLE, 'Free Sample': AMBER }

export type ChallanStatus = 'Draft' | 'Issued' | 'Dispatched' | 'Delivered' | 'Returned' | 'Cancelled'
export type ChallanType = 'Sale' | 'Loan/Returnable' | 'Job Work' | 'Free Sample'

export interface ChallanItem { description: string; qty: number; unit: string; rate: number }
export interface ChallanOutRecord {
  id: number; challan_no: string; challan_date: string; challan_type: ChallanType
  customer: string; so_ref: string; to_ref: string
  delivery_address: string; transporter: string; vehicle_no: string
  status: ChallanStatus; items: ChallanItem[]; notes: string
}

/* ── Seed data ────────────────────────────────────────────── */
export const SEED: ChallanOutRecord[] = [
  { id: 1, challan_no: 'CHO-2601', challan_date: '2026-01-08', challan_type: 'Sale', customer: 'Tata Motors Ltd', so_ref: 'SO-001', to_ref: 'TO-2601', delivery_address: 'Plot 12, Pimpri Industrial Area, Pune 411018', transporter: 'Mahavir Logistics', vehicle_no: 'GJ-05-AB-1234', status: 'Delivered', items: [{ description: 'Steel Shaft 30mm', qty: 200, unit: 'Nos', rate: 850 }, { description: 'Hex Bolt M10', qty: 500, unit: 'Nos', rate: 12 }], notes: 'Customer copy signed.' },
  { id: 2, challan_no: 'CHO-2602', challan_date: '2026-01-15', challan_type: 'Sale', customer: 'Mahindra Electric', so_ref: 'SO-002', to_ref: 'TO-2602', delivery_address: 'A-7 Chakan Industrial Zone, Nashik 422010', transporter: 'Blue Dart Logistics', vehicle_no: 'MH-12-GH-5678', status: 'Delivered', items: [{ description: 'Motor Housing', qty: 50, unit: 'Nos', rate: 3200 }], notes: '' },
  { id: 3, challan_no: 'CHO-2603', challan_date: '2026-01-22', challan_type: 'Sale', customer: 'Bosch India', so_ref: 'SO-003', to_ref: 'TO-2603', delivery_address: 'Bommasandra Ind Area, Hosur Road, Bangalore 560099', transporter: 'DTDC Freight', vehicle_no: 'KA-01-CD-9012', status: 'Delivered', items: [{ description: 'Precision Gear Set', qty: 300, unit: 'Nos', rate: 425 }], notes: '' },
  { id: 4, challan_no: 'CHO-2604', challan_date: '2026-01-28', challan_type: 'Sale', customer: 'L&T Electrical', so_ref: 'SO-004', to_ref: 'TO-2604', delivery_address: 'Sector 58, Gurugram, Delhi NCR 122001', transporter: 'TCI Express', vehicle_no: 'RJ-14-EF-3456', status: 'Delivered', items: [{ description: 'Control Panel Unit', qty: 10, unit: 'Nos', rate: 48000 }], notes: '' },
  { id: 5, challan_no: 'CHO-2605', challan_date: '2026-02-04', challan_type: 'Sale', customer: 'Bajaj Auto', so_ref: 'SO-005', to_ref: 'TO-2605', delivery_address: 'Waluj MIDC, Aurangabad 431136', transporter: 'Mahavir Logistics', vehicle_no: 'GJ-01-KL-7890', status: 'Dispatched', items: [{ description: 'Crankshaft Assembly', qty: 80, unit: 'Nos', rate: 2800 }], notes: 'In transit.' },
  { id: 6, challan_no: 'CHO-2606', challan_date: '2026-02-10', challan_type: 'Job Work', customer: 'TVS Motor', so_ref: '', to_ref: 'TO-2606', delivery_address: 'SIPCOT Industrial Park, Hosur 635126', transporter: 'VRL Logistics', vehicle_no: 'TN-07-MN-2345', status: 'Dispatched', items: [{ description: 'Engine Mount (Job Work)', qty: 120, unit: 'Nos', rate: 0 }], notes: 'Job work challan — no invoice.' },
  { id: 7, challan_no: 'CHO-2607', challan_date: '2026-02-15', challan_type: 'Loan/Returnable', customer: 'Ashok Leyland', so_ref: '', to_ref: 'TO-2607', delivery_address: 'Ennore High Road, Chennai 600057', transporter: 'DTDC Freight', vehicle_no: 'AP-28-PQ-6789', status: 'Issued', items: [{ description: 'Assembly Fixture Set', qty: 2, unit: 'Set', rate: 0 }, { description: 'GO/NOGO Gauge', qty: 5, unit: 'Nos', rate: 0 }], notes: 'Returnable challan — expected return by 2026-03-15.' },
  { id: 8, challan_no: 'CHO-2608', challan_date: '2026-02-22', challan_type: 'Sale', customer: 'Eicher Motors', so_ref: 'SO-008', to_ref: 'TO-2608', delivery_address: 'Pithampur Industrial Area, MP 454775', transporter: 'Mahavir Logistics', vehicle_no: 'GJ-05-RS-1122', status: 'Issued', items: [{ description: 'Gear Box Cover', qty: 40, unit: 'Nos', rate: 1850 }], notes: '' },
  { id: 9, challan_no: 'CHO-2609', challan_date: '2026-02-28', challan_type: 'Free Sample', customer: 'Mahindra Electric', so_ref: '', to_ref: '', delivery_address: 'Tech Mahindra, Electronic City, Bangalore', transporter: 'Blue Dart Logistics', vehicle_no: '', status: 'Issued', items: [{ description: 'Battery Bracket (Sample)', qty: 5, unit: 'Nos', rate: 0 }], notes: 'Product approval sample.' },
  { id: 10, challan_no: 'CHO-2610', challan_date: '2026-03-05', challan_type: 'Sale', customer: 'Tata Motors Ltd', so_ref: 'SO-010', to_ref: '', delivery_address: 'Sanand Plant, Ahmedabad 382110', transporter: 'TCI Express', vehicle_no: '', status: 'Draft', items: [{ description: 'Hydraulic Cylinder Body', qty: 25, unit: 'Nos', rate: 5200 }], notes: 'Awaiting dispatch clearance.' },
]

export const CUSTOMERS = ['Tata Motors Ltd', 'Mahindra Electric', 'Bosch India', 'L&T Electrical', 'Bajaj Auto', 'TVS Motor', 'Ashok Leyland', 'Eicher Motors']
export const TRANSPORTERS = ['Mahavir Logistics', 'Blue Dart Logistics', 'DTDC Freight', 'TCI Express', 'VRL Logistics', 'Safexpress']
export const STATUSES: ChallanStatus[] = ['Draft', 'Issued', 'Dispatched', 'Delivered', 'Returned', 'Cancelled']
export const TYPES: ChallanType[] = ['Sale', 'Loan/Returnable', 'Job Work', 'Free Sample']
const UNITS = ['Nos', 'Kg', 'Metres', 'Set', 'Rolls', 'Litre']

const grandTotal = (items: ChallanItem[]) => items.reduce((s, i) => s + i.qty * i.rate, 0)
const fmtCur = (n: number) => n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(2)}L` : `₹${n.toLocaleString('en-IN')}`

let nextId = 11
const BLANK = (): any => ({
  customer: CUSTOMERS[0], so_ref: '', to_ref: '', challan_type: 'Sale' as ChallanType,
  challan_date: new Date().toISOString().slice(0, 10),
  delivery_address: '', transporter: TRANSPORTERS[0], vehicle_no: '',
  status: 'Draft' as ChallanStatus, notes: '',
  items: [{ description: '', qty: 1, unit: 'Nos', rate: 0 }],
})

/* ═══════════════════════════════════════════════════════════ */
export default function ChallanOut() {
  const [records, setRecords] = useState<ChallanOutRecord[]>(SEED)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('')
  const [typeF, setTypeF] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [viewId, setViewId] = useState<number | null>(null)
  const [form, setForm] = useState<any>(BLANK())

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.challan_no.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.so_ref.toLowerCase().includes(q) || r.to_ref.toLowerCase().includes(q) || r.vehicle_no.toLowerCase().includes(q)) &&
      (!statusF || r.status === statusF) && (!typeF || r.challan_type === typeF)
  })

  function openCreate() { setForm({ ...BLANK(), challan_no: `CHO-26${String(nextId).padStart(2, '0')}` }); setEditId(null); setOpen(true) }
  function openEdit(r: ChallanOutRecord) {
    setForm({ customer: r.customer, so_ref: r.so_ref, to_ref: r.to_ref, challan_type: r.challan_type, challan_date: r.challan_date, delivery_address: r.delivery_address, transporter: r.transporter, vehicle_no: r.vehicle_no, status: r.status, notes: r.notes, items: r.items.map(i => ({ ...i })) })
    setEditId(r.id); setOpen(true)
  }
  function setItem(idx: number, key: keyof ChallanItem, val: any) { setForm((f: any) => ({ ...f, items: f.items.map((it: ChallanItem, i: number) => i === idx ? { ...it, [key]: val } : it) })) }
  function addItem() { setForm((f: any) => ({ ...f, items: [...f.items, { description: '', qty: 1, unit: 'Nos', rate: 0 }] })) }
  function removeItem(idx: number) { setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) })) }

  function handleSave() {
    const rec: ChallanOutRecord = {
      id: editId ?? nextId++,
      challan_no: editId ? records.find(r => r.id === editId)!.challan_no : `CHO-26${String(nextId - 1).padStart(2, '0')}`,
      challan_date: form.challan_date, challan_type: form.challan_type,
      customer: form.customer, so_ref: form.so_ref, to_ref: form.to_ref,
      delivery_address: form.delivery_address, transporter: form.transporter,
      vehicle_no: form.vehicle_no, status: form.status, items: form.items, notes: form.notes,
    }
    setRecords(rs => editId ? rs.map(r => r.id === editId ? rec : r) : [rec, ...rs]); setOpen(false)
  }

  const viewRec = records.find(r => r.id === viewId)
  const canSave = form.customer && form.challan_date && form.items.length > 0
  const formTotal = grandTotal(form.items)

  if (showAnalytics) return <ChallanOutAnalytics records={records} onClose={() => setShowAnalytics(false)} />

  return (
    <div className={cStyles.page}>

      {/* Header */}
      <div className={cStyles.header}>
        <div><h1 className={cStyles.title}>Challans Out</h1><p className={cStyles.subtitle}>{records.length} total challans</p></div>
        <div className={cStyles.headerBtns}>
          <button className={cStyles.analyticsBtn} onClick={() => setShowAnalytics(true)}>Analytics</button>
          <button className={cStyles.primaryBtn} onClick={openCreate}>+ New Challan</button>
        </div>
      </div>

      {/* Stat Row */}
      <div className={cStyles.statRow}>
        {STATUSES.map(s => {
          const c = records.filter(r => r.status === s).length; return (
            <div key={s} className={cStyles.statCard} style={{ borderColor: c > 0 ? `${STATUS_COLOR[s]}40` : undefined }}>
              <p className={cStyles.statVal} style={{ color: STATUS_COLOR[s] }}>{c}</p><p className={cStyles.statLabel}>{s}</p>
            </div>
          )
        })}
        <div className={cStyles.statCard} style={{ borderColor: `${GREEN}40` }}>
          <p className={cStyles.statVal} style={{ color: GREEN, fontSize: '1.15rem' }}>{fmtCur(records.reduce((s, r) => s + grandTotal(r.items), 0))}</p>
          <p className={cStyles.statLabel}>Total Value</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={cStyles.toolbar}>
        <input className={cStyles.searchInput} placeholder="Search challan no, customer, SO ref, vehicle…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className={cStyles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={cStyles.filterSelect} value={typeF} onChange={e => setTypeF(e.target.value)}>
          <option value="">All Types</option>{TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className={cStyles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className={cStyles.tableCard}>
        {filtered.length === 0 ? <div className={cStyles.empty}><p>No challans match your filter.</p></div> : (
          <div className={cStyles.tableWrap}>
            <table className={cStyles.table}>
              <thead><tr>
                <th>Challan No.</th><th>Date</th><th>Type</th><th>Customer</th><th>SO / TO Ref</th>
                <th>Transporter</th><th>Vehicle</th>
                <th className={cStyles.right}>Value</th>
                <th className={cStyles.center}>Status</th>
                <th className={cStyles.center}>Actions</th>
              </tr></thead>
              <tbody>{filtered.map(r => (
                <tr key={r.id}>
                  <td className={cStyles.mono}>{r.challan_no}</td>
                  <td className={cStyles.mono}>{r.challan_date}</td>
                  <td><span className={cStyles.typePill} style={{ background: `${TYPE_COLOR[r.challan_type]}18`, color: TYPE_COLOR[r.challan_type] }}>{r.challan_type}</span></td>
                  <td className={cStyles.bold}>{r.customer}</td>
                  <td className={cStyles.muted} style={{ fontSize: '0.78rem' }}>{r.so_ref || '—'} {r.to_ref ? `/ ${r.to_ref}` : ''}</td>
                  <td>{r.transporter}</td>
                  <td className={cStyles.mono}>{r.vehicle_no || '—'}</td>
                  <td className={`${cStyles.mono} ${cStyles.right}`} style={{ color: grandTotal(r.items) > 0 ? GREEN : 'var(--text-muted)' }}>{grandTotal(r.items) > 0 ? fmtCur(grandTotal(r.items)) : '—'}</td>
                  <td className={cStyles.center}><span className={cStyles.statusPill} style={{ background: STATUS_BG[r.status], color: STATUS_COLOR[r.status] }}>{r.status}</span></td>
                  <td className={cStyles.center}>
                    <div className={cStyles.rowActions}>
                      <button className={cStyles.viewBtn} onClick={() => setViewId(r.id)}>View</button>
                      <button className={cStyles.editBtn} onClick={() => openEdit(r)}>Edit</button>
                      <button className={cStyles.delBtn} onClick={() => setDeleteId(r.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {open && (
        <div className={cStyles.overlay} onClick={() => setOpen(false)}>
          <div className={cStyles.drawer} onClick={e => e.stopPropagation()}>
            <div className={cStyles.drawerHead}><h2>{editId ? 'Edit Challan' : 'New Challan Out'}</h2><button className={cStyles.closeBtn} onClick={() => setOpen(false)}>✕</button></div>
            <div className={cStyles.drawerBody}>
              <div className={cStyles.dRow}>
                <div className={cStyles.dField}><label>Customer *</label><select value={form.customer} onChange={e => setForm((f: any) => ({ ...f, customer: e.target.value }))}>{CUSTOMERS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className={cStyles.dField}><label>Challan Type</label><select value={form.challan_type} onChange={e => setForm((f: any) => ({ ...f, challan_type: e.target.value }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              </div>
              <div className={cStyles.dRow}>
                <div className={cStyles.dField}><label>Challan Date *</label><input type="date" value={form.challan_date} onChange={e => setForm((f: any) => ({ ...f, challan_date: e.target.value }))} /></div>
                <div className={cStyles.dField}><label>Status</label><select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className={cStyles.dRow}>
                <div className={cStyles.dField}><label>SO Reference</label><input placeholder="e.g. SO-001" value={form.so_ref} onChange={e => setForm((f: any) => ({ ...f, so_ref: e.target.value }))} /></div>
                <div className={cStyles.dField}><label>TO Reference</label><input placeholder="e.g. TO-2601" value={form.to_ref} onChange={e => setForm((f: any) => ({ ...f, to_ref: e.target.value }))} /></div>
              </div>
              <div className={cStyles.dField}><label>Delivery Address</label><textarea rows={2} placeholder="Full delivery address…" value={form.delivery_address} onChange={e => setForm((f: any) => ({ ...f, delivery_address: e.target.value }))} /></div>
              <div className={cStyles.dRow}>
                <div className={cStyles.dField}><label>Transporter</label><select value={form.transporter} onChange={e => setForm((f: any) => ({ ...f, transporter: e.target.value }))}>{TRANSPORTERS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className={cStyles.dField}><label>Vehicle No.</label><input placeholder="e.g. GJ-05-AB-1234" value={form.vehicle_no} onChange={e => setForm((f: any) => ({ ...f, vehicle_no: e.target.value }))} /></div>
              </div>

              {/* Line Items */}
              <div className={cStyles.sectionLabel}>Items</div>
              <div className={cStyles.itemsHeader}><span>Description</span><span>Qty</span><span>Unit</span><span>Rate (₹)</span><span>Amount</span><span /></div>
              {form.items.map((item: ChallanItem, idx: number) => (
                <div key={idx} className={cStyles.itemRow}>
                  <input placeholder="Item description" value={item.description} onChange={e => setItem(idx, 'description', e.target.value)} />
                  <input type="number" min={1} value={item.qty} onChange={e => setItem(idx, 'qty', Number(e.target.value))} />
                  <select value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select>
                  <input type="number" min={0} value={item.rate} onChange={e => setItem(idx, 'rate', Number(e.target.value))} />
                  <span className={cStyles.itemAmt}>{item.qty * item.rate > 0 ? fmtCur(item.qty * item.rate) : '—'}</span>
                  <button className={cStyles.removeBtn} onClick={() => removeItem(idx)} disabled={form.items.length === 1}>✕</button>
                </div>
              ))}
              <button className={cStyles.addRowBtn} onClick={addItem}>+ Add Item</button>
              <div className={cStyles.totalRow}><span>Grand Total</span><strong>{formTotal > 0 ? fmtCur(formTotal) : '—'}</strong></div>
              <div className={cStyles.dField}><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <div className={cStyles.drawerFoot}>
              <button className={cStyles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={cStyles.saveBtn} disabled={!canSave} onClick={handleSave}>{editId ? 'Update' : 'Create'} Challan</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRec && (
        <div className={cStyles.overlay} onClick={() => setViewId(null)}>
          <div className={cStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={cStyles.drawerHead}>
              <div>
                <h2>{viewRec.challan_no}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span className={cStyles.statusPill} style={{ background: STATUS_BG[viewRec.status], color: STATUS_COLOR[viewRec.status] }}>{viewRec.status}</span>
                  <span className={cStyles.typePill} style={{ background: `${TYPE_COLOR[viewRec.challan_type]}18`, color: TYPE_COLOR[viewRec.challan_type] }}>{viewRec.challan_type}</span>
                </div>
              </div>
              <button className={cStyles.closeBtn} onClick={() => setViewId(null)}>✕</button>
            </div>
            <div className={cStyles.modalBody}>
              <div className={cStyles.metaGrid}>
                <div><p className={cStyles.metaLabel}>Customer</p>         <p className={cStyles.metaVal}>{viewRec.customer}</p></div>
                <div><p className={cStyles.metaLabel}>Date</p>             <p className={cStyles.metaVal}>{viewRec.challan_date}</p></div>
                <div><p className={cStyles.metaLabel}>SO Ref.</p>          <p className={cStyles.metaVal}>{viewRec.so_ref || '—'}</p></div>
                <div><p className={cStyles.metaLabel}>TO Ref.</p>          <p className={cStyles.metaVal}>{viewRec.to_ref || '—'}</p></div>
                <div><p className={cStyles.metaLabel}>Transporter</p>      <p className={cStyles.metaVal}>{viewRec.transporter}</p></div>
                <div><p className={cStyles.metaLabel}>Vehicle</p>          <p className={cStyles.metaVal}>{viewRec.vehicle_no || '—'}</p></div>
              </div>
              {viewRec.delivery_address && <p className={cStyles.addressBox}><span>Delivery Address:</span> {viewRec.delivery_address}</p>}
              <div className={cStyles.sectionLabel} style={{ marginTop: '1rem' }}>Items</div>
              <table className={cStyles.viewItemTable}>
                <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  {viewRec.items.map((item, i) => (
                    <tr key={i}><td className={cStyles.muted}>{i + 1}</td><td className={cStyles.bold}>{item.description || '—'}</td><td className={cStyles.mono}>{item.qty}</td><td className={cStyles.muted}>{item.unit}</td><td className={cStyles.mono}>{item.rate > 0 ? fmtCur(item.rate) : '—'}</td><td className={cStyles.mono} style={{ color: GREEN }}>{item.qty * item.rate > 0 ? fmtCur(item.qty * item.rate) : '—'}</td></tr>
                  ))}
                  <tr className={cStyles.totalRowTbl}><td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>Grand Total</td><td className={cStyles.mono} style={{ color: GREEN, fontWeight: 700 }}>{grandTotal(viewRec.items) > 0 ? fmtCur(grandTotal(viewRec.items)) : '—'}</td></tr>
                </tbody>
              </table>
              {viewRec.notes && <p className={cStyles.viewRemarks}><span>Notes:</span> {viewRec.notes}</p>}
              <div className={cStyles.modalActions}>
                <button className={cStyles.cancelBtn} onClick={() => setViewId(null)}>Close</button>
                <button className={cStyles.editBtn} onClick={() => { setViewId(null); openEdit(viewRec) }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={cStyles.overlay} onClick={() => setDeleteId(null)}>
          <div className={cStyles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Challan?</h3><p>This challan will be permanently removed.</p>
            <div className={cStyles.confirmActions}>
              <button className={cStyles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={cStyles.confirmDelBtn} onClick={() => { setRecords(rs => rs.filter(r => r.id !== deleteId)); setDeleteId(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
