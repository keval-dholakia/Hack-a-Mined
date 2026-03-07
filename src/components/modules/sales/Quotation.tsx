'use client'

import { useState, useMemo } from 'react'
import styles from './Sales.module.scss'
import qStyles from './Quotation.module.scss'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

/* ── Palette ─────────────────────────────────────────────── */
const COLORS = ['#6366f1','#22d3ee','#a78bfa','#34d399','#fb923c','#f472b6','#facc15','#60a5fa','#4ade80','#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

const STATUS_COLOR: Record<string,string> = { Draft: '#6b7280', Sent: CYAN, Accepted: GREEN, Rejected: ROSE, Expired: AMBER }
const STATUS_BG:    Record<string,string> = { Draft:'rgba(107,114,128,0.12)', Sent:`${CYAN}18`, Accepted:`${GREEN}18`, Rejected:`${ROSE}18`, Expired:`${AMBER}18` }

/* ── Helpers ─────────────────────────────────────────────── */
const fmtCur = (n: number) =>
  n >= 1_00_00_000 ? `₹${(n/1_00_00_000).toFixed(1)}Cr`
  : n >= 1_00_000  ? `₹${(n/1_00_000).toFixed(1)}L`
  : `₹${n.toLocaleString('en-IN')}`

function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={qStyles.tooltip}>
      {label && <p className={qStyles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>{p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong></p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon:string; label:string; value:string; color:string }) {
  return (
    <div className={qStyles.kpi}>
      <div className={qStyles.kpiIcon} style={{ color, background:`${color}18` }}>{icon}</div>
      <div><p className={qStyles.kpiLabel}>{label}</p><p className={qStyles.kpiValue} style={{ color }}>{value}</p></div>
    </div>
  )
}

/* ── Types ───────────────────────────────────────────────── */
type QuotStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired'
interface QuotItem { product: string; qty: number; rate: number; gst: number; total: number }
interface Quotation {
  id: number; quot_no: string; reference_inq: string | null
  customer: string; sales_person: string
  quot_date: string; valid_until: string
  status: QuotStatus; items: QuotItem[]
  remarks: string
}

/* ── Seed data ───────────────────────────────────────────── */
const SEED: Quotation[] = [
  { id:1,  quot_no:'QT-2601', reference_inq:'INQ-001', customer:'Tata Motors Ltd',      sales_person:'Raj Mehta',    quot_date:'2026-01-08', valid_until:'2026-02-08', status:'Accepted', items:[{product:'Steel Shaft 30mm',qty:200,rate:450,gst:18,total:106200},{product:'Bearing 6205',qty:100,rate:180,gst:18,total:21240}], remarks:'Standard terms apply.' },
  { id:2,  quot_no:'QT-2602', reference_inq:'INQ-003', customer:'Mahindra Electric',    sales_person:'Priya Shah',   quot_date:'2026-01-15', valid_until:'2026-02-15', status:'Sent',     items:[{product:'Motor Housing',qty:50,rate:2200,gst:18,total:129800}], remarks:'Include installation kit.' },
  { id:3,  quot_no:'QT-2603', reference_inq:null,       customer:'Bosch India Pvt Ltd', sales_person:'Arjun Patel',  quot_date:'2026-01-20', valid_until:'2026-02-20', status:'Rejected', items:[{product:'Precision Gear',qty:300,rate:320,gst:18,total:113280}], remarks:'Customer requested revision.' },
  { id:4,  quot_no:'QT-2604', reference_inq:'INQ-007', customer:'L&T Electrical',       sales_person:'Raj Mehta',    quot_date:'2026-01-28', valid_until:'2026-02-28', status:'Accepted', items:[{product:'Control Panel Unit',qty:10,rate:15000,gst:18,total:177000}], remarks:'Fast track order.' },
  { id:5,  quot_no:'QT-2605', reference_inq:'INQ-010', customer:'Bajaj Auto Ltd',       sales_person:'Priya Shah',   quot_date:'2026-02-03', valid_until:'2026-03-03', status:'Sent',     items:[{product:'Crankshaft Assy',qty:80,rate:1800,gst:18,total:169920}], remarks:'Sample requested first.' },
  { id:6,  quot_no:'QT-2606', reference_inq:null,       customer:'TVS Motor Company',   sales_person:'Arjun Patel',  quot_date:'2026-02-10', valid_until:'2026-03-10', status:'Draft',    items:[{product:'Engine Mount',qty:120,rate:650,gst:18,total:91260}], remarks:'Pending internal review.' },
  { id:7,  quot_no:'QT-2607', reference_inq:'INQ-012', customer:'Tata Motors Ltd',      sales_person:'Raj Mehta',    quot_date:'2026-02-15', valid_until:'2026-03-15', status:'Accepted', items:[{product:'Steel Shaft 30mm',qty:350,rate:445,gst:18,total:184908}], remarks:'Repeat order pricing.' },
  { id:8,  quot_no:'QT-2608', reference_inq:'INQ-015', customer:'Ashok Leyland',        sales_person:'Priya Shah',   quot_date:'2026-02-20', valid_until:'2026-03-20', status:'Sent',     items:[{product:'Axle Shaft',qty:60,rate:3200,gst:18,total:226944}], remarks:'Delivery in 4 weeks.' },
  { id:9,  quot_no:'QT-2609', reference_inq:null,       customer:'Eicher Motors',       sales_person:'Arjun Patel',  quot_date:'2026-02-25', valid_until:'2026-03-25', status:'Expired',  items:[{product:'Gear Box Cover',qty:40,rate:2800,gst:18,total:132160}], remarks:'Validity lapsed — reissue needed.' },
  { id:10, quot_no:'QT-2610', reference_inq:'INQ-018', customer:'Mahindra Electric',    sales_person:'Raj Mehta',    quot_date:'2026-03-01', valid_until:'2026-04-01', status:'Draft',    items:[{product:'Battery Bracket',qty:200,rate:900,gst:18,total:212400}], remarks:'Awaiting spec confirmation.' },
]

const CUSTOMERS    = ['Tata Motors Ltd','Mahindra Electric','Bosch India Pvt Ltd','L&T Electrical','Bajaj Auto Ltd','TVS Motor Company','Ashok Leyland','Eicher Motors']
const SALESPERSONS = ['Raj Mehta','Priya Shah','Arjun Patel']
const PRODUCTS     = ['Steel Shaft 30mm','Bearing 6205','Motor Housing','Precision Gear','Control Panel Unit','Crankshaft Assy','Engine Mount','Axle Shaft','Gear Box Cover','Battery Bracket']
const STATUSES: QuotStatus[] = ['Draft','Sent','Accepted','Rejected','Expired']

let nextId = 11

const EMPTY_FORM = {
  customer: '', sales_person: SALESPERSONS[0], reference_inq: '',
  quot_date: new Date().toISOString().slice(0,10),
  valid_until: new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
  status: 'Draft' as QuotStatus, remarks: '',
  items: [{ product: PRODUCTS[0], qty: 1, rate: 0, gst: 18, total: 0 }],
}

function calcTotal(items: typeof EMPTY_FORM.items) {
  return items.reduce((s, i) => s + i.qty * i.rate * (1 + i.gst/100), 0)
}

/* ═══════════════════════════════════════════════════════════ */
export default function Quotation() {
  const [records, setRecords] = useState<Quotation[]>(SEED)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [editId,  setEditId]  = useState<number|null>(null)
  const [deleteId,setDeleteId]= useState<number|null>(null)
  const [viewId,  setViewId]  = useState<number|null>(null)
  const [form,    setForm]    = useState(EMPTY_FORM)

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.quot_no.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.sales_person.toLowerCase().includes(q)) &&
      (!statusF || r.status === statusF)
  })

  function openCreate() {
    setForm({ ...EMPTY_FORM, quot_no: `QT-26${String(nextId).padStart(2,'0')}` } as any)
    setEditId(null)
    setOpen(true)
  }
  function openEdit(r: Quotation) {
    setForm({ customer: r.customer, sales_person: r.sales_person, reference_inq: r.reference_inq??'',
      quot_date: r.quot_date, valid_until: r.valid_until, status: r.status,
      remarks: r.remarks, items: r.items.map(i=>({...i})) } as any)
    setEditId(r.id)
    setOpen(true)
  }
  function setItem(idx: number, key: keyof QuotItem, val: any) {
    setForm(f => {
      const items = f.items.map((it,i) => {
        if (i !== idx) return it
        const next = { ...it, [key]: val }
        next.total = next.qty * next.rate * (1 + next.gst/100)
        return next
      })
      return { ...f, items }
    })
  }
  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { product: PRODUCTS[0], qty:1, rate:0, gst:18, total:0 }] }))
  }
  function removeItem(idx: number) {
    setForm(f => ({ ...f, items: f.items.filter((_,i) => i !== idx) }))
  }

  function handleSave() {
    const newQ: Quotation = {
      id: editId ?? nextId++,
      quot_no: editId ? records.find(r=>r.id===editId)!.quot_no : `QT-26${String(nextId-1).padStart(2,'0')}`,
      reference_inq: form.reference_inq || null,
      customer: form.customer, sales_person: form.sales_person,
      quot_date: form.quot_date, valid_until: form.valid_until,
      status: form.status, items: form.items, remarks: form.remarks,
    }
    setRecords(rs => editId ? rs.map(r=>r.id===editId?newQ:r) : [newQ, ...rs])
    setOpen(false)
  }

  const viewRec = records.find(r=>r.id===viewId)

  /* ── Analytics ────────────────────────────────────────── */
  if (showAnalytics) {
    return <QuotationAnalytics records={records} onClose={() => setShowAnalytics(false)} />
  }

  const grandTotal = (r: Quotation) => r.items.reduce((s,i) => s+i.total, 0)
  const canSave = form.customer && form.quot_date && form.valid_until && form.items.length > 0

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quotations</h1>
          <p className={styles.subtitle}>{records.length} total quotations</p>
        </div>
        <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
          <button className={styles.analyticsBtn} onClick={() => setShowAnalytics(true)}>Analytics</button>
          <button className={qStyles.primaryBtn} onClick={openCreate}>+ New Quotation</button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={qStyles.statRow}>
        {STATUSES.map(s => {
          const count = records.filter(r => r.status === s).length
          return (
            <div key={s} className={qStyles.statCard} style={{ borderColor: count > 0 ? `${STATUS_COLOR[s]}40` : undefined }}>
              <p className={qStyles.statVal} style={{ color: STATUS_COLOR[s] }}>{count}</p>
              <p className={qStyles.statLabel}>{s}</p>
            </div>
          )
        })}
        <div className={qStyles.statCard} style={{ borderColor:`${GREEN}40` }}>
          <p className={qStyles.statVal} style={{ color: GREEN }}>{fmtCur(records.reduce((s,r)=>s+grandTotal(r),0))}</p>
          <p className={qStyles.statLabel}>Total Value</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search quotation no, customer or salesperson…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className={qStyles.resultCount}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* ── Table ── */}
      <div className={qStyles.tableCard}>
        {filtered.length === 0 ? (
          <div className={qStyles.empty}>
            <p>{records.length === 0 ? 'No quotations yet. Create your first one.' : 'No quotations match your filter.'}</p>
          </div>
        ) : (
          <div className={qStyles.tableWrap}>
            <table className={qStyles.table}>
              <thead><tr>
                <th>Quot No.</th><th>Customer</th><th>Ref. Inquiry</th>
                <th>Quot Date</th><th>Valid Until</th><th>Sales Person</th>
                <th className={qStyles.right}>Total Value</th>
                <th className={qStyles.center}>Status</th>
                <th className={qStyles.center}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className={qStyles.mono}>{r.quot_no}</td>
                    <td className={qStyles.bold}>{r.customer}</td>
                    <td className={qStyles.muted}>{r.reference_inq ?? '—'}</td>
                    <td className={qStyles.mono}>{r.quot_date}</td>
                    <td className={qStyles.mono} style={new Date(r.valid_until)<new Date() && r.status==='Sent' ? {color:AMBER} : undefined}>{r.valid_until}</td>
                    <td>{r.sales_person}</td>
                    <td className={`${qStyles.mono} ${qStyles.right}`}>{fmtCur(grandTotal(r))}</td>
                    <td className={qStyles.center}>
                      <span className={qStyles.statusPill} style={{ background: STATUS_BG[r.status], color: STATUS_COLOR[r.status] }}>{r.status}</span>
                    </td>
                    <td className={qStyles.center}>
                      <div className={qStyles.rowActions}>
                        <button className={qStyles.viewBtn}  onClick={() => setViewId(r.id)}>View</button>
                        <button className={qStyles.editBtn}  onClick={() => openEdit(r)}>Edit</button>
                        <button className={qStyles.delBtn}   onClick={() => setDeleteId(r.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ Drawer (Add / Edit) ══ */}
      {open && (
        <div className={qStyles.overlay} onClick={() => setOpen(false)}>
          <div className={qStyles.drawer} onClick={e => e.stopPropagation()}>
            <div className={qStyles.drawerHead}>
              <h2>{editId ? 'Edit Quotation' : 'New Quotation'}</h2>
              <button className={qStyles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className={qStyles.drawerBody}>

              {/* Row 1: Customer + Sales Person */}
              <div className={qStyles.dRow}>
                <div className={qStyles.dField}>
                  <label>Customer *</label>
                  <select value={form.customer} onChange={e => setForm(f=>({...f,customer:e.target.value}))}>
                    <option value="" disabled>— select customer —</option>
                    {CUSTOMERS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={qStyles.dField}>
                  <label>Sales Person</label>
                  <select value={form.sales_person} onChange={e => setForm(f=>({...f,sales_person:e.target.value}))}>
                    {SALESPERSONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Dates + Reference */}
              <div className={qStyles.dRow}>
                <div className={qStyles.dField}>
                  <label>Quotation Date *</label>
                  <input type="date" value={form.quot_date} onChange={e => setForm(f=>({...f,quot_date:e.target.value}))} />
                </div>
                <div className={qStyles.dField}>
                  <label>Valid Until *</label>
                  <input type="date" value={form.valid_until} onChange={e => setForm(f=>({...f,valid_until:e.target.value}))} />
                </div>
              </div>

              <div className={qStyles.dRow}>
                <div className={qStyles.dField}>
                  <label>Reference Inquiry</label>
                  <input placeholder="e.g. INQ-001 (optional)" value={form.reference_inq}
                    onChange={e => setForm(f=>({...f,reference_inq:e.target.value}))} />
                </div>
                <div className={qStyles.dField}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value as QuotStatus}))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className={qStyles.sectionLabel}>Line Items</div>
              <div className={qStyles.itemsHeader}>
                <span>Product</span><span>Qty</span><span>Rate (₹)</span><span>GST %</span><span>Total</span><span></span>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className={qStyles.itemRow}>
                  <select value={item.product} onChange={e => setItem(idx,'product',e.target.value)}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <input type="number" min={1} value={item.qty} onChange={e => setItem(idx,'qty',Number(e.target.value))} />
                  <input type="number" min={0} value={item.rate} onChange={e => setItem(idx,'rate',Number(e.target.value))} />
                  <select value={item.gst} onChange={e => setItem(idx,'gst',Number(e.target.value))}>
                    {[0,5,12,18,28].map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                  <span className={qStyles.itemTotal}>{fmtCur(item.qty*item.rate*(1+item.gst/100))}</span>
                  <button className={qStyles.removeBtn} onClick={() => removeItem(idx)} disabled={form.items.length===1}>✕</button>
                </div>
              ))}
              <button className={qStyles.addRowBtn} onClick={addItem}>+ Add Item</button>

              <div className={qStyles.totalRow}>
                <span>Grand Total</span>
                <strong>{fmtCur(form.items.reduce((s,i)=>s+i.qty*i.rate*(1+i.gst/100),0))}</strong>
              </div>

              {/* Remarks */}
              <div className={qStyles.dField}>
                <label>Remarks</label>
                <textarea rows={2} placeholder="Optional notes…" value={form.remarks}
                  onChange={e => setForm(f=>({...f,remarks:e.target.value}))} />
              </div>

            </div>
            <div className={qStyles.drawerFoot}>
              <button className={qStyles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={qStyles.saveBtn} disabled={!canSave} onClick={handleSave}>
                {editId ? 'Update Quotation' : 'Create Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ View Modal ══ */}
      {viewRec && (
        <div className={qStyles.overlay} onClick={() => setViewId(null)}>
          <div className={qStyles.modal} onClick={e=>e.stopPropagation()}>
            <div className={qStyles.drawerHead}>
              <div>
                <h2>{viewRec.quot_no}</h2>
                <span className={qStyles.statusPill} style={{ background:STATUS_BG[viewRec.status], color:STATUS_COLOR[viewRec.status], marginTop:'0.25rem', display:'inline-block' }}>{viewRec.status}</span>
              </div>
              <button className={qStyles.closeBtn} onClick={() => setViewId(null)}>✕</button>
            </div>
            <div className={qStyles.modalBody}>
              <div className={qStyles.metaGrid}>
                <div><p className={qStyles.metaLabel}>Customer</p><p className={qStyles.metaVal}>{viewRec.customer}</p></div>
                <div><p className={qStyles.metaLabel}>Sales Person</p><p className={qStyles.metaVal}>{viewRec.sales_person}</p></div>
                <div><p className={qStyles.metaLabel}>Quotation Date</p><p className={qStyles.metaVal}>{viewRec.quot_date}</p></div>
                <div><p className={qStyles.metaLabel}>Valid Until</p><p className={qStyles.metaVal}>{viewRec.valid_until}</p></div>
                {viewRec.reference_inq && <div><p className={qStyles.metaLabel}>Ref. Inquiry</p><p className={qStyles.metaVal}>{viewRec.reference_inq}</p></div>}
              </div>
              <div className={qStyles.sectionLabel} style={{ marginTop:'1rem' }}>Line Items</div>
              <table className={qStyles.viewItemTable}>
                <thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>GST</th><th>Total</th></tr></thead>
                <tbody>
                  {viewRec.items.map((item,i) => (
                    <tr key={i}>
                      <td>{item.product}</td>
                      <td className={qStyles.mono}>{item.qty}</td>
                      <td className={qStyles.mono}>{fmtCur(item.rate)}</td>
                      <td className={qStyles.mono}>{item.gst}%</td>
                      <td className={`${qStyles.mono} ${qStyles.bold}`} style={{ color:GREEN }}>{fmtCur(item.total)}</td>
                    </tr>
                  ))}
                  <tr className={qStyles.totalRowTbl}>
                    <td colSpan={4} className={qStyles.right}><strong>Grand Total</strong></td>
                    <td className={`${qStyles.mono} ${qStyles.bold}`} style={{ color:GREEN }}>{fmtCur(grandTotal(viewRec))}</td>
                  </tr>
                </tbody>
              </table>
              {viewRec.remarks && <p className={qStyles.viewRemarks}><span>Remarks:</span> {viewRec.remarks}</p>}
              <div className={qStyles.modalActions}>
                <button className={qStyles.cancelBtn} onClick={() => setViewId(null)}>Close</button>
                <button className={qStyles.editBtn} onClick={() => { setViewId(null); openEdit(viewRec) }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={qStyles.overlay} onClick={() => setDeleteId(null)}>
          <div className={qStyles.confirmModal} onClick={e=>e.stopPropagation()}>
            <h3>Delete Quotation?</h3>
            <p>This quotation record will be permanently removed.</p>
            <div className={qStyles.confirmActions}>
              <button className={qStyles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={qStyles.confirmDelBtn} onClick={() => { setRecords(rs=>rs.filter(r=>r.id!==deleteId)); setDeleteId(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   QuotationAnalytics — inline, mirrors CustomerAnalytics UI
══════════════════════════════════════════════════════════════════════ */
function QuotationAnalytics({ records, onClose }: { records: Quotation[]; onClose: () => void }) {
  const [tab, setTab] = useState<'overview'|'pipeline'|'performance'|'trend'>('overview')

  const stats = useMemo(() => {
    const total     = records.length
    const draft     = records.filter(r=>r.status==='Draft').length
    const sent      = records.filter(r=>r.status==='Sent').length
    const accepted  = records.filter(r=>r.status==='Accepted').length
    const rejected  = records.filter(r=>r.status==='Rejected').length
    const expired   = records.filter(r=>r.status==='Expired').length
    const convRate  = total ? Math.round(accepted/total*100) : 0
    const lossRate  = total ? Math.round(rejected/total*100) : 0

    const grandTotal = (r: Quotation) => r.items.reduce((s,i)=>s+i.total,0)
    const totalValue   = records.reduce((s,r)=>s+grandTotal(r),0)
    const acceptedVal  = records.filter(r=>r.status==='Accepted').reduce((s,r)=>s+grandTotal(r),0)
    const avgVal       = total ? totalValue/total : 0

    const statusPie = [
      { name:'Draft',    value:draft    },
      { name:'Sent',     value:sent     },
      { name:'Accepted', value:accepted },
      { name:'Rejected', value:rejected },
      { name:'Expired',  value:expired  },
    ].filter(s=>s.value>0)

    // Monthly trend last 12m
    const now = new Date()
    const monthData = Array.from({length:12},(_,m) => {
      const d   = new Date(now.getFullYear(), now.getMonth()-11+m, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
      const mos = records.filter(r=>r.quot_date.startsWith(key))
      return { label, total:mos.length, accepted:mos.filter(r=>r.status==='Accepted').length, value:mos.reduce((s,r)=>s+grandTotal(r),0) }
    })

    // Customer breakdown
    const custMap: Record<string,{total:number;accepted:number;value:number}> = {}
    records.forEach(r => {
      if(!custMap[r.customer]) custMap[r.customer]={total:0,accepted:0,value:0}
      custMap[r.customer].total++
      if(r.status==='Accepted') custMap[r.customer].accepted++
      custMap[r.customer].value += grandTotal(r)
    })
    const topCustomers = Object.entries(custMap).sort((a,b)=>b[1].value-a[1].value).slice(0,8).map(([name,d])=>({name,...d}))

    // Salesperson
    const spMap: Record<string,{total:number;accepted:number;rejected:number}> = {}
    records.forEach(r => {
      if(!spMap[r.sales_person]) spMap[r.sales_person]={total:0,accepted:0,rejected:0}
      spMap[r.sales_person].total++
      if(r.status==='Accepted') spMap[r.sales_person].accepted++
      if(r.status==='Rejected') spMap[r.sales_person].rejected++
    })
    const salesData = Object.entries(spMap).map(([name,d])=>({
      name:name.split(' ')[0], fullName:name, ...d,
      rate: d.total ? Math.round(d.accepted/d.total*100) : 0,
    })).sort((a,b)=>b.total-a.total)

    const radarData = salesData.slice(0,6).map(s=>({ person:s.name, total:s.total, accepted:s.accepted, rejected:s.rejected }))

    return { total,draft,sent,accepted,rejected,expired,convRate,lossRate,totalValue,acceptedVal,avgVal,statusPie,monthData,topCustomers,salesData,radarData }
  }, [records])

  const tabs = [
    { id:'overview', label:'⊞ Overview' }, { id:'pipeline', label:'◈ Pipeline' },
    { id:'performance', label:'◉ Performance' }, { id:'trend', label:'◎ Trend & Health' },
  ] as const

  return (
    <div className={qStyles.analyticsPage}>
      <div className={qStyles.analyticsHeader}>
        <div>
          <h1 className={qStyles.analyticsTitle}>Quotation Analytics</h1>
          <p className={qStyles.analyticsSub}>360° quotation data visualization · {stats.total} records</p>
        </div>
        <button className={qStyles.backBtn} onClick={onClose}>← Back to List</button>
      </div>

      {/* KPI Strip */}
      <div className={qStyles.kpiStrip}>
        {[
          { icon:'◈', label:'Total',      val:String(stats.total),            color:ACCENT  },
          { icon:'◉', label:'Accepted',   val:String(stats.accepted),         color:GREEN   },
          { icon:'▣', label:'Pending/Sent',val:String(stats.sent+stats.draft),color:CYAN    },
          { icon:'⬡', label:'Rejected',   val:String(stats.rejected),         color:ROSE    },
          { icon:'◎', label:'Conv. Rate', val:`${stats.convRate}%`,           color:AMBER   },
          { icon:'◇', label:'Total Value',val:fmtCur(stats.totalValue),       color:PURPLE  },
        ].map(k => (
          <div key={k.label} className={qStyles.kpiCard}>
            <div className={qStyles.kpiIcon} style={{ color:k.color, background:`${k.color}18` }}>{k.icon}</div>
            <div><p className={qStyles.kpiLabel}>{k.label}</p><p className={qStyles.kpiValue} style={{ color:k.color }}>{k.val}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={qStyles.tabBar}>
        {tabs.map(t => (
          <button key={t.id} className={`${qStyles.aTab} ${tab===t.id?qStyles.aTabActive:''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div className={qStyles.aGrid}>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Status Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4} label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.statusPie.map((e,i)=><Cell key={i} fill={STATUS_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Monthly Volume <span className={qStyles.aBadge}>last 12 months</span></p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.monthData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="label" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" radius={[4,4,0,0]} fill={ACCENT}/>
                <Bar dataKey="accepted" name="Accepted" radius={[4,4,0,0]} fill={GREEN}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={qStyles.aCardTitle}>Status Summary Table</p>
            <table className={qStyles.sTable}>
              <thead><tr><th>Status</th><th>Count</th><th>% of Total</th><th>Share</th></tr></thead>
              <tbody>{[{n:'Draft',v:stats.draft,c:STATUS_COLOR['Draft']},{n:'Sent',v:stats.sent,c:STATUS_COLOR['Sent']},{n:'Accepted',v:stats.accepted,c:STATUS_COLOR['Accepted']},{n:'Rejected',v:stats.rejected,c:STATUS_COLOR['Rejected']},{n:'Expired',v:stats.expired,c:STATUS_COLOR['Expired']}].map(row=>(
                <tr key={row.n}><td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:row.c,marginRight:8}}/>  {row.n}</td><td className={qStyles.mono}>{row.v}</td><td className={qStyles.mono}>{stats.total?(row.v/stats.total*100).toFixed(1):0}%</td>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{height:6,width:`${stats.total?row.v/stats.total*100:0}%`,maxWidth:80,background:row.c,borderRadius:4}}/><span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{row.v}</span></div></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* PIPELINE */}
      {tab==='pipeline' && (
        <div className={qStyles.aGrid}>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Conversion Funnel <span className={qStyles.aBadge}>quot → accept</span></p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{name:'Issued',value:stats.total,fill:ACCENT},{name:'Sent',value:stats.sent+stats.accepted+stats.rejected,fill:CYAN},{name:'Responded',value:stats.accepted+stats.rejected,fill:AMBER},{name:'Accepted',value:stats.accepted,fill:GREEN}]} layout="vertical" barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false}/>
                <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis type="category" dataKey="name" width={90} tick={{fill:'#9ca3af',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>{[ACCENT,CYAN,AMBER,GREEN].map((c,i)=><Cell key={i} fill={c}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Top Customers by Quotation Value</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topCustomers} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false}/>
                <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>fmtCur(v)}/>
                <YAxis type="category" dataKey="name" width={130} tick={{fill:'#9ca3af',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip formatter={fmtCur}/>}/>
                <Bar dataKey="value" name="Value" radius={[0,6,6,0]}>{stats.topCustomers.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={qStyles.aCardTitle}>Customer Detail</p>
            <table className={qStyles.sTable}>
              <thead><tr><th>#</th><th>Customer</th><th>Quotations</th><th>Accepted</th><th>Total Value</th><th>Conv. Rate</th></tr></thead>
              <tbody>{stats.topCustomers.map((c,i)=>(
                <tr key={c.name}><td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td><td><strong>{c.name}</strong></td>
                <td className={qStyles.mono}>{c.total}</td><td className={qStyles.mono} style={{color:GREEN}}>{c.accepted}</td>
                <td className={qStyles.mono} style={{color:GREEN}}>{fmtCur(c.value)}</td>
                <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:c.total&&c.accepted/c.total>=0.5?`${GREEN}22`:`${ROSE}22`,color:c.total&&c.accepted/c.total>=0.5?GREEN:ROSE}}>{c.total?Math.round(c.accepted/c.total*100):0}%</span></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERFORMANCE */}
      {tab==='performance' && (
        <div className={qStyles.aGrid}>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Sales Person — Grouped Bar</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.salesData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="accepted" name="Accepted" fill={GREEN} radius={[4,4,0,0]}/>
                <Bar dataKey="rejected" name="Rejected" fill={ROSE} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Team Radar <span className={qStyles.aBadge}>top 6 reps</span></p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                <PolarGrid stroke="#1f2235"/><PolarAngleAxis dataKey="person" tick={{fill:'#9ca3af',fontSize:11}}/><PolarRadiusAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Radar name="Total" dataKey="total" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15}/>
                <Radar name="Accepted" dataKey="accepted" stroke={GREEN} fill={GREEN} fillOpacity={0.15}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/><Tooltip content={<DarkTooltip/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={qStyles.aCardTitle}>Leaderboard <span className={qStyles.aBadge}>by conversion rate</span></p>
            <table className={qStyles.sTable}>
              <thead><tr><th>#</th><th>Sales Person</th><th>Total</th><th>Accepted</th><th>Rejected</th><th>Conv. %</th></tr></thead>
              <tbody>{[...stats.salesData].sort((a,b)=>b.rate-a.rate).map((sp,i)=>(
                <tr key={sp.fullName}><td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td><td><strong>{sp.fullName}</strong></td>
                <td className={qStyles.mono}>{sp.total}</td><td className={qStyles.mono} style={{color:GREEN}}>{sp.accepted}</td>
                <td className={qStyles.mono} style={{color:ROSE}}>{sp.rejected}</td>
                <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:sp.rate>=50?`${GREEN}22`:`${ROSE}22`,color:sp.rate>=50?GREEN:ROSE}}>{sp.rate}%</span></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREND & HEALTH */}
      {tab==='trend' && (
        <div className={qStyles.aGrid}>
          <div className={qStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={qStyles.aCardTitle}>12-Month Quotation Trend <span className={qStyles.aBadge}>volume + value</span></p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235"/>
                <XAxis dataKey="label" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1}/>
                <YAxis yAxisId="vol" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis yAxisId="val" orientation="right" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtCur(v)}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line yAxisId="vol" type="monotone" dataKey="total" name="Quotations" stroke={ACCENT} strokeWidth={2.5} dot={{fill:ACCENT,r:4}} activeDot={{r:6}}/>
                <Line yAxisId="vol" type="monotone" dataKey="accepted" name="Accepted" stroke={GREEN} strokeWidth={2} dot={{fill:GREEN,r:3}}/>
                <Line yAxisId="val" type="monotone" dataKey="value" name="Value" stroke={AMBER} strokeWidth={2} dot={{fill:AMBER,r:3}} strokeDasharray="4 2"/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Win / Loss Mix</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={[{name:'Accepted',value:stats.accepted},{name:'Rejected',value:stats.rejected},{name:'Pending/Sent',value:stats.sent+stats.draft}].filter(d=>d.value>0)}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} paddingAngle={3} label={({name,percent})=>`${((percent??0)*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={GREEN}/><Cell fill={ROSE}/><Cell fill={CYAN}/>
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={qStyles.aCard}>
            <p className={qStyles.aCardTitle}>Pipeline Health</p>
            <div className={qStyles.healthPanel}>
              {[{label:'Acceptance Rate',val:stats.convRate,color:GREEN},{label:'Rejection Rate',val:stats.lossRate,color:ROSE},{label:'Open / Sent',val:stats.total?Math.round((stats.sent+stats.draft)/stats.total*100):0,color:CYAN}].map(row=>(
                <div key={row.label} className={qStyles.hRow}>
                  <span className={qStyles.hLabel}>{row.label}</span>
                  <div className={qStyles.hTrack}><div className={qStyles.hFill} style={{width:`${row.val}%`,background:row.color}}/></div>
                  <span className={qStyles.hPct} style={{color:row.color}}>{row.val}%</span>
                </div>
              ))}
              <div className={qStyles.insight}>
                <span>
                  {stats.convRate>=50?'Strong acceptance — over 50% of quotations accepted.':stats.convRate>=30?'Moderate conversion. Focus on follow-ups with customers.':'Low acceptance rate. Review pricing and competitor analysis.'}
                  {' '}Total quotation value of <strong>{fmtCur(stats.totalValue)}</strong>, with <strong>{fmtCur(stats.acceptedVal)}</strong> accepted.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
