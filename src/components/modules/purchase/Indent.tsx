'use client'

import { useState, useMemo } from 'react'
import iStyles from './Indent.module.scss'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

/* ── Palette ─────────────────────────────────────────────── */
const COLORS  = ['#6366f1','#22d3ee','#a78bfa','#34d399','#fb923c','#f472b6','#facc15','#60a5fa','#4ade80','#f87171']
const ACCENT  = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

const STATUS_COLOR: Record<string,string> = { Draft:'#6b7280', Submitted: CYAN, Approved: GREEN, Rejected: ROSE, 'PO Raised': PURPLE }
const STATUS_BG:    Record<string,string> = { Draft:'rgba(107,114,128,0.12)', Submitted:`${CYAN}18`, Approved:`${GREEN}18`, Rejected:`${ROSE}18`, 'PO Raised':`${PURPLE}18` }
const PRIORITY_COLOR: Record<string,string> = { Low:'#34d399', Medium:'#facc15', High:'#fb923c', Urgent:'#f43f5e' }

/* ── Helpers ─────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={iStyles.tooltip}>
      {label && <p className={iStyles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon:string; label:string; value:string; color:string }) {
  return (
    <div className={iStyles.kpiCard}>
      <div className={iStyles.kpiIcon} style={{ color, background:`${color}18` }}>{icon}</div>
      <div><p className={iStyles.kpiLabel}>{label}</p><p className={iStyles.kpiValue} style={{ color }}>{value}</p></div>
    </div>
  )
}

/* ── Types ───────────────────────────────────────────────── */
type IndentStatus   = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'PO Raised'
type IndentPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

interface IndentItem { material: string; qty: number; unit: string; remarks: string }
interface IndentRecord {
  id: number; indent_no: string; indent_date: string; required_date: string
  department: string; requested_by: string; priority: IndentPriority
  status: IndentStatus; items: IndentItem[]; notes: string
}

/* ── Seed data ───────────────────────────────────────────── */
const SEED: IndentRecord[] = [
  { id:1,  indent_no:'IND-2601', indent_date:'2026-01-05', required_date:'2026-01-20', department:'Production',       requested_by:'Karan Verma',   priority:'High',   status:'Approved',   items:[{material:'MS Sheet 3mm',qty:50,unit:'Sheets',remarks:'For batch JO-001'},{material:'Hex Bolt M10',qty:500,unit:'Nos',remarks:''}], notes:'Urgent — production scheduled.' },
  { id:2,  indent_no:'IND-2602', indent_date:'2026-01-08', required_date:'2026-01-25', department:'Maintenance',      requested_by:'Deepak Rao',    priority:'Medium', status:'PO Raised',  items:[{material:'Bearing 6205',qty:20,unit:'Nos',remarks:'Replace worn spindle bearings'}], notes:'' },
  { id:3,  indent_no:'IND-2603', indent_date:'2026-01-12', required_date:'2026-02-01', department:'Quality',          requested_by:'Anita Sharma',  priority:'Low',    status:'Approved',   items:[{material:'Calibration Gauge Set',qty:2,unit:'Set',remarks:'Annual calibration kit'}], notes:'From quality budget.' },
  { id:4,  indent_no:'IND-2604', indent_date:'2026-01-18', required_date:'2026-02-05', department:'Production',       requested_by:'Karan Verma',   priority:'Urgent', status:'Approved',   items:[{material:'Aluminium Rod 25mm',qty:100,unit:'Kg',remarks:'Run out of stock'},{material:'Cutting Oil',qty:10,unit:'Litre',remarks:''}], notes:'Critical for current order.' },
  { id:5,  indent_no:'IND-2605', indent_date:'2026-01-22', required_date:'2026-02-10', department:'Stores',           requested_by:'Rekha Patil',   priority:'Low',    status:'Rejected',   items:[{material:'Packaging Tape',qty:50,unit:'Rolls',remarks:''}], notes:'Rejected — sufficient stock available.' },
  { id:6,  indent_no:'IND-2606', indent_date:'2026-01-28', required_date:'2026-02-15', department:'Maintenance',      requested_by:'Deepak Rao',    priority:'High',   status:'Submitted',  items:[{material:'Grease 3HP',qty:5,unit:'Kg',remarks:'CNC machines'},{material:'Hydraulic Oil ISO 46',qty:20,unit:'Litre',remarks:''}], notes:'' },
  { id:7,  indent_no:'IND-2607', indent_date:'2026-02-03', required_date:'2026-02-20', department:'Production',       requested_by:'Suresh Nair',   priority:'Medium', status:'Approved',   items:[{material:'Copper Wire 1.5 SQ',qty:200,unit:'Metres',remarks:'Panel wiring'},{material:'Cable Tie 300mm',qty:100,unit:'Pkt',remarks:''}], notes:'' },
  { id:8,  indent_no:'IND-2608', indent_date:'2026-02-08', required_date:'2026-02-25', department:'R&D',              requested_by:'Meera Joshi',   priority:'Low',    status:'Draft',      items:[{material:'Arduino Mega Board',qty:5,unit:'Nos',remarks:'Prototype testing'}], notes:'Need HOD approval first.' },
  { id:9,  indent_no:'IND-2609', indent_date:'2026-02-14', required_date:'2026-03-01', department:'Production',       requested_by:'Karan Verma',   priority:'High',   status:'PO Raised',  items:[{material:'SS Pipe 2 Inch',qty:30,unit:'Metres',remarks:''},{material:'GI Elbow 2 Inch',qty:40,unit:'Nos',remarks:''}], notes:'' },
  { id:10, indent_no:'IND-2610', indent_date:'2026-02-20', required_date:'2026-03-10', department:'Quality',          requested_by:'Anita Sharma',  priority:'Medium', status:'Submitted',  items:[{material:'Micrometer 25-50mm',qty:3,unit:'Nos',remarks:'Replace damaged instruments'}], notes:'Budget code: Q-2026.' },
]

const DEPARTMENTS  = ['Production','Maintenance','Quality','Stores','R&D','Admin']
const REQUESTERS   = ['Karan Verma','Deepak Rao','Anita Sharma','Rekha Patil','Suresh Nair','Meera Joshi']
const PRIORITIES: IndentPriority[] = ['Low','Medium','High','Urgent']
const STATUSES: IndentStatus[]     = ['Draft','Submitted','Approved','Rejected','PO Raised']
const UNITS        = ['Nos','Kg','Metres','Litre','Sheets','Rolls','Set','Pkt']
const MATERIALS    = ['MS Sheet 3mm','Hex Bolt M10','Bearing 6205','Calibration Gauge Set','Aluminium Rod 25mm','Cutting Oil','Packaging Tape','Grease 3HP','Hydraulic Oil ISO 46','Copper Wire 1.5 SQ','Cable Tie 300mm','Arduino Mega Board','SS Pipe 2 Inch','GI Elbow 2 Inch','Micrometer 25-50mm','Drill Bit Set','Safety Gloves','V-Belt B52']

let nextId = 11

const BLANK_FORM = (): any => ({
  department: DEPARTMENTS[0], requested_by: REQUESTERS[0],
  indent_date: new Date().toISOString().slice(0,10),
  required_date: new Date(Date.now()+14*86400000).toISOString().slice(0,10),
  priority: 'Medium' as IndentPriority,
  status: 'Draft' as IndentStatus,
  notes: '',
  items: [{ material: MATERIALS[0], qty: 1, unit: 'Nos', remarks: '' }],
})

/* ═══════════════════════════════════════════════════════════ */
export default function Indent() {
  const [records, setRecords] = useState<IndentRecord[]>(SEED)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [deptF,   setDeptF]   = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [editId,  setEditId]  = useState<number|null>(null)
  const [deleteId,setDeleteId]= useState<number|null>(null)
  const [viewId,  setViewId]  = useState<number|null>(null)
  const [form,    setForm]    = useState<any>(BLANK_FORM())

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.indent_no.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) || r.requested_by.toLowerCase().includes(q)) &&
      (!statusF || r.status === statusF) &&
      (!deptF   || r.department === deptF)
  })

  function openCreate() {
    const f = BLANK_FORM()
    f.indent_no = `IND-26${String(nextId).padStart(2,'0')}`
    setForm(f); setEditId(null); setOpen(true)
  }
  function openEdit(r: IndentRecord) {
    setForm({ department:r.department, requested_by:r.requested_by, indent_date:r.indent_date, required_date:r.required_date, priority:r.priority, status:r.status, notes:r.notes, items:r.items.map(i=>({...i})) })
    setEditId(r.id); setOpen(true)
  }
  function setItem(idx: number, key: keyof IndentItem, val: any) {
    setForm((f: any) => ({ ...f, items: f.items.map((it: IndentItem, i: number) => i===idx ? {...it,[key]:val} : it) }))
  }
  function addItem()        { setForm((f: any) => ({ ...f, items: [...f.items, { material:MATERIALS[0], qty:1, unit:'Nos', remarks:'' }] })) }
  function removeItem(idx: number) { setForm((f: any) => ({ ...f, items: f.items.filter((_:any,i:number) => i!==idx) })) }

  function handleSave() {
    const rec: IndentRecord = {
      id: editId ?? nextId++,
      indent_no: editId ? records.find(r=>r.id===editId)!.indent_no : `IND-26${String(nextId-1).padStart(2,'0')}`,
      indent_date: form.indent_date, required_date: form.required_date,
      department: form.department, requested_by: form.requested_by,
      priority: form.priority, status: form.status,
      items: form.items, notes: form.notes,
    }
    setRecords(rs => editId ? rs.map(r=>r.id===editId?rec:r) : [rec,...rs])
    setOpen(false)
  }

  const viewRec = records.find(r=>r.id===viewId)
  const canSave = form.department && form.requested_by && form.indent_date && form.required_date && form.items.length > 0

  if (showAnalytics) {
    return <IndentAnalytics records={records} onClose={() => setShowAnalytics(false)} />
  }

  return (
    <div className={iStyles.page}>

      {/* ── Header ── */}
      <div className={iStyles.header}>
        <div>
          <h1 className={iStyles.title}>Purchase Indent</h1>
          <p className={iStyles.subtitle}>{records.length} total indents</p>
        </div>
        <div className={iStyles.headerBtns}>
          <button className={iStyles.analyticsBtn} onClick={() => setShowAnalytics(true)}>Analytics</button>
          <button className={iStyles.primaryBtn}   onClick={openCreate}>+ New Indent</button>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className={iStyles.statRow}>
        {STATUSES.map(s => {
          const count = records.filter(r=>r.status===s).length
          return (
            <div key={s} className={iStyles.statCard} style={{ borderColor: count>0?`${STATUS_COLOR[s]}40`:undefined }}>
              <p className={iStyles.statVal}  style={{ color:STATUS_COLOR[s] }}>{count}</p>
              <p className={iStyles.statLabel}>{s}</p>
            </div>
          )
        })}
        <div className={iStyles.statCard} style={{ borderColor:`${AMBER}40` }}>
          <p className={iStyles.statVal} style={{ color:AMBER }}>{records.reduce((s,r)=>s+r.items.reduce((a,i)=>a+i.qty,0),0)}</p>
          <p className={iStyles.statLabel}>Total Items Qty</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={iStyles.toolbar}>
        <input className={iStyles.searchInput} placeholder="Search indent no, department, requester…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={iStyles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={iStyles.filterSelect} value={deptF} onChange={e => setDeptF(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <span className={iStyles.resultCount}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* ── Table ── */}
      <div className={iStyles.tableCard}>
        {filtered.length===0 ? (
          <div className={iStyles.empty}><p>{records.length===0?'No indents yet. Create your first one.':'No indents match your filter.'}</p></div>
        ) : (
          <div className={iStyles.tableWrap}>
            <table className={iStyles.table}>
              <thead><tr>
                <th>Indent No.</th><th>Department</th><th>Requested By</th>
                <th>Indent Date</th><th>Required By</th>
                <th className={iStyles.center}>Priority</th>
                <th className={iStyles.center}>Items</th>
                <th className={iStyles.center}>Status</th>
                <th className={iStyles.center}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className={iStyles.mono}>{r.indent_no}</td>
                    <td className={iStyles.bold}>{r.department}</td>
                    <td>{r.requested_by}</td>
                    <td className={iStyles.mono}>{r.indent_date}</td>
                    <td className={iStyles.mono} style={new Date(r.required_date)<new Date()&&(r.status==='Draft'||r.status==='Submitted')?{color:AMBER}:undefined}>{r.required_date}</td>
                    <td className={iStyles.center}>
                      <span className={iStyles.priorityPill} style={{ background:`${PRIORITY_COLOR[r.priority]}18`, color:PRIORITY_COLOR[r.priority] }}>{r.priority}</span>
                    </td>
                    <td className={iStyles.center}><span className={iStyles.itemCount}>{r.items.length}</span></td>
                    <td className={iStyles.center}>
                      <span className={iStyles.statusPill} style={{ background:STATUS_BG[r.status], color:STATUS_COLOR[r.status] }}>{r.status}</span>
                    </td>
                    <td className={iStyles.center}>
                      <div className={iStyles.rowActions}>
                        <button className={iStyles.viewBtn} onClick={()=>setViewId(r.id)}>View</button>
                        <button className={iStyles.editBtn} onClick={()=>openEdit(r)}>Edit</button>
                        <button className={iStyles.delBtn}  onClick={()=>setDeleteId(r.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ Drawer ══ */}
      {open && (
        <div className={iStyles.overlay} onClick={()=>setOpen(false)}>
          <div className={iStyles.drawer} onClick={e=>e.stopPropagation()}>
            <div className={iStyles.drawerHead}>
              <h2>{editId?'Edit Indent':'New Indent'}</h2>
              <button className={iStyles.closeBtn} onClick={()=>setOpen(false)}>✕</button>
            </div>
            <div className={iStyles.drawerBody}>

              <div className={iStyles.dRow}>
                <div className={iStyles.dField}>
                  <label>Department *</label>
                  <select value={form.department} onChange={e=>setForm((f:any)=>({...f,department:e.target.value}))}>
                    {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className={iStyles.dField}>
                  <label>Requested By *</label>
                  <select value={form.requested_by} onChange={e=>setForm((f:any)=>({...f,requested_by:e.target.value}))}>
                    {REQUESTERS.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className={iStyles.dRow}>
                <div className={iStyles.dField}>
                  <label>Indent Date *</label>
                  <input type="date" value={form.indent_date} onChange={e=>setForm((f:any)=>({...f,indent_date:e.target.value}))}/>
                </div>
                <div className={iStyles.dField}>
                  <label>Required By *</label>
                  <input type="date" value={form.required_date} onChange={e=>setForm((f:any)=>({...f,required_date:e.target.value}))}/>
                </div>
              </div>

              <div className={iStyles.dRow}>
                <div className={iStyles.dField}>
                  <label>Priority</label>
                  <select value={form.priority} onChange={e=>setForm((f:any)=>({...f,priority:e.target.value as IndentPriority}))}>
                    {PRIORITIES.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className={iStyles.dField}>
                  <label>Status</label>
                  <select value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value as IndentStatus}))}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className={iStyles.sectionLabel}>Material Line Items</div>
              <div className={iStyles.itemsHeader}>
                <span>Material</span><span>Qty</span><span>Unit</span><span>Remarks</span><span/>
              </div>
              {form.items.map((item: IndentItem, idx: number) => (
                <div key={idx} className={iStyles.itemRow}>
                  <select value={item.material} onChange={e=>setItem(idx,'material',e.target.value)}>
                    {MATERIALS.map(m=><option key={m}>{m}</option>)}
                  </select>
                  <input type="number" min={1} value={item.qty} onChange={e=>setItem(idx,'qty',Number(e.target.value))}/>
                  <select value={item.unit} onChange={e=>setItem(idx,'unit',e.target.value)}>
                    {UNITS.map(u=><option key={u}>{u}</option>)}
                  </select>
                  <input placeholder="Remarks" value={item.remarks} onChange={e=>setItem(idx,'remarks',e.target.value)}/>
                  <button className={iStyles.removeBtn} onClick={()=>removeItem(idx)} disabled={form.items.length===1}>✕</button>
                </div>
              ))}
              <button className={iStyles.addRowBtn} onClick={addItem}>+ Add Material</button>

              <div className={iStyles.dField}>
                <label>Notes</label>
                <textarea rows={2} placeholder="Optional notes…" value={form.notes}
                  onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))}/>
              </div>

            </div>
            <div className={iStyles.drawerFoot}>
              <button className={iStyles.cancelBtn} onClick={()=>setOpen(false)}>Cancel</button>
              <button className={iStyles.saveBtn} disabled={!canSave} onClick={handleSave}>
                {editId?'Update Indent':'Create Indent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ View Modal ══ */}
      {viewRec && (
        <div className={iStyles.overlay} onClick={()=>setViewId(null)}>
          <div className={iStyles.modal} onClick={e=>e.stopPropagation()}>
            <div className={iStyles.drawerHead}>
              <div>
                <h2>{viewRec.indent_no}</h2>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.25rem',flexWrap:'wrap'}}>
                  <span className={iStyles.statusPill} style={{ background:STATUS_BG[viewRec.status], color:STATUS_COLOR[viewRec.status] }}>{viewRec.status}</span>
                  <span className={iStyles.priorityPill} style={{ background:`${PRIORITY_COLOR[viewRec.priority]}18`, color:PRIORITY_COLOR[viewRec.priority] }}>{viewRec.priority}</span>
                </div>
              </div>
              <button className={iStyles.closeBtn} onClick={()=>setViewId(null)}>✕</button>
            </div>
            <div className={iStyles.modalBody}>
              <div className={iStyles.metaGrid}>
                <div><p className={iStyles.metaLabel}>Department</p>    <p className={iStyles.metaVal}>{viewRec.department}</p></div>
                <div><p className={iStyles.metaLabel}>Requested By</p>  <p className={iStyles.metaVal}>{viewRec.requested_by}</p></div>
                <div><p className={iStyles.metaLabel}>Indent Date</p>   <p className={iStyles.metaVal}>{viewRec.indent_date}</p></div>
                <div><p className={iStyles.metaLabel}>Required By</p>   <p className={iStyles.metaVal}>{viewRec.required_date}</p></div>
              </div>
              <div className={iStyles.sectionLabel} style={{marginTop:'1rem'}}>Material Items</div>
              <table className={iStyles.viewItemTable}>
                <thead><tr><th>#</th><th>Material</th><th>Qty</th><th>Unit</th><th>Remarks</th></tr></thead>
                <tbody>
                  {viewRec.items.map((item,i)=>(
                    <tr key={i}>
                      <td className={iStyles.muted}>{i+1}</td>
                      <td className={iStyles.bold}>{item.material}</td>
                      <td className={iStyles.mono}>{item.qty}</td>
                      <td className={iStyles.muted}>{item.unit}</td>
                      <td className={iStyles.muted}>{item.remarks||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewRec.notes && <p className={iStyles.viewRemarks}><span>Notes:</span> {viewRec.notes}</p>}
              <div className={iStyles.modalActions}>
                <button className={iStyles.cancelBtn} onClick={()=>setViewId(null)}>Close</button>
                <button className={iStyles.editBtn} onClick={()=>{setViewId(null);openEdit(viewRec)}}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId!==null && (
        <div className={iStyles.overlay} onClick={()=>setDeleteId(null)}>
          <div className={iStyles.confirmModal} onClick={e=>e.stopPropagation()}>
            <h3>Delete Indent?</h3>
            <p>This indent record will be permanently removed.</p>
            <div className={iStyles.confirmActions}>
              <button className={iStyles.cancelBtn} onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className={iStyles.confirmDelBtn} onClick={()=>{setRecords(rs=>rs.filter(r=>r.id!==deleteId));setDeleteId(null)}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   IndentAnalytics
══════════════════════════════════════════════════════════════════════ */
function IndentAnalytics({ records, onClose }: { records: IndentRecord[]; onClose:()=>void }) {
  const [tab, setTab] = useState<'overview'|'departments'|'performance'|'trend'>('overview')

  const stats = useMemo(() => {
    const total      = records.length
    const draft      = records.filter(r=>r.status==='Draft').length
    const submitted  = records.filter(r=>r.status==='Submitted').length
    const approved   = records.filter(r=>r.status==='Approved').length
    const rejected   = records.filter(r=>r.status==='Rejected').length
    const poRaised   = records.filter(r=>r.status==='PO Raised').length
    const approvalRate = total?Math.round((approved+poRaised)/total*100):0
    const rejRate      = total?Math.round(rejected/total*100):0
    const totalItems   = records.reduce((s,r)=>s+r.items.reduce((a,i)=>a+i.qty,0),0)

    const statusPie = [
      {name:'Draft',value:draft},{name:'Submitted',value:submitted},
      {name:'Approved',value:approved},{name:'Rejected',value:rejected},{name:'PO Raised',value:poRaised},
    ].filter(s=>s.value>0)

    // Monthly – last 12m
    const now = new Date()
    const monthData = Array.from({length:12},(_,m)=>{
      const d   = new Date(now.getFullYear(),now.getMonth()-11+m,1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const lbl = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
      const mos = records.filter(r=>r.indent_date.startsWith(key))
      return { label:lbl, total:mos.length, approved:mos.filter(r=>r.status==='Approved'||r.status==='PO Raised').length, rejected:mos.filter(r=>r.status==='Rejected').length }
    })

    // Department breakdown
    const deptMap: Record<string,{total:number;approved:number;rejected:number;items:number}> = {}
    records.forEach(r=>{
      if(!deptMap[r.department]) deptMap[r.department]={total:0,approved:0,rejected:0,items:0}
      deptMap[r.department].total++
      if(r.status==='Approved'||r.status==='PO Raised') deptMap[r.department].approved++
      if(r.status==='Rejected') deptMap[r.department].rejected++
      deptMap[r.department].items += r.items.reduce((a,i)=>a+i.qty,0)
    })
    const deptData = Object.entries(deptMap).sort((a,b)=>b[1].total-a[1].total).map(([name,d])=>({name,...d}))

    // Priority distribution
    const prioMap: Record<string,number> = {Low:0,Medium:0,High:0,Urgent:0}
    records.forEach(r=>{ prioMap[r.priority]++ })
    const prioData = Object.entries(prioMap).map(([name,value])=>({name,value}))

    // Requester breakdown
    const requMap: Record<string,{total:number;approved:number}> = {}
    records.forEach(r=>{
      if(!requMap[r.requested_by]) requMap[r.requested_by]={total:0,approved:0}
      requMap[r.requested_by].total++
      if(r.status==='Approved'||r.status==='PO Raised') requMap[r.requested_by].approved++
    })
    const requData = Object.entries(requMap).sort((a,b)=>b[1].total-a[1].total).map(([name,d])=>({name,fullName:name,...d,rate:d.total?Math.round(d.approved/d.total*100):0}))

    // Material frequency
    const matMap: Record<string,number> = {}
    records.forEach(r=>r.items.forEach(i=>{ matMap[i.material]=(matMap[i.material]??0)+i.qty }))
    const topMaterials = Object.entries(matMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name:name.length>20?name.slice(0,20)+'…':name,value}))

    const radarData = deptData.slice(0,6).map(d=>({ dept:d.name.length>8?d.name.slice(0,8)+'…':d.name, total:d.total, approved:d.approved }))

    return { total,draft,submitted,approved,rejected,poRaised,approvalRate,rejRate,totalItems,statusPie,monthData,deptData,prioData,requData,topMaterials,radarData }
  },[records])

  const tabs = [
    {id:'overview',label:'⊞ Overview'},{id:'departments',label:'◈ Departments'},
    {id:'performance',label:'◉ Requesters'},{id:'trend',label:'◎ Trend & Health'},
  ] as const

  return (
    <div className={iStyles.analyticsPage}>
      <div className={iStyles.analyticsHeader}>
        <div>
          <h1 className={iStyles.analyticsTitle}>Indent Analytics</h1>
          <p className={iStyles.analyticsSub}>360° indent data visualization · {stats.total} records</p>
        </div>
        <button className={iStyles.backBtn} onClick={onClose}>← Back to List</button>
      </div>

      {/* KPI Strip */}
      <div className={iStyles.kpiStrip}>
        {[
          {icon:'◈',label:'Total Indents',  val:String(stats.total),        color:ACCENT},
          {icon:'◉',label:'Approved',       val:String(stats.approved),     color:GREEN},
          {icon:'▣',label:'PO Raised',      val:String(stats.poRaised),     color:PURPLE},
          {icon:'⬡',label:'Pending Review', val:String(stats.submitted),    color:CYAN},
          {icon:'◎',label:'Approval Rate',  val:`${stats.approvalRate}%`,  color:AMBER},
          {icon:'◇',label:'Total Qty',      val:String(stats.totalItems),   color:ROSE},
        ].map(k=>(
          <KPI key={k.label} icon={k.icon} label={k.label} value={k.val} color={k.color}/>
        ))}
      </div>

      {/* Tab Bar */}
      <div className={iStyles.tabBar}>
        {tabs.map(t=>(
          <button key={t.id} className={`${iStyles.aTab} ${tab===t.id?iStyles.aTabActive:''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div className={iStyles.aGrid}>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Status Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4}
                label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.statusPie.map((e,i)=><Cell key={i} fill={STATUS_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Priority Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.prioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4}
                label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.prioData.map((e,_i)=><Cell key={_i} fill={PRIORITY_COLOR[e.name]??COLORS[_i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Top 8 Materials by Quantity Requested</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topMaterials} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false}/>
                <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis type="category" dataKey="name" width={140} tick={{fill:'#9ca3af',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="value" name="Qty" radius={[0,6,6,0]}>
                  {stats.topMaterials.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Status Summary</p>
            <table className={iStyles.sTable}>
              <thead><tr><th>Status</th><th>Count</th><th>%</th><th>Share</th></tr></thead>
              <tbody>{[{n:'Draft',v:stats.draft,c:STATUS_COLOR['Draft']},{n:'Submitted',v:stats.submitted,c:STATUS_COLOR['Submitted']},{n:'Approved',v:stats.approved,c:STATUS_COLOR['Approved']},{n:'Rejected',v:stats.rejected,c:STATUS_COLOR['Rejected']},{n:'PO Raised',v:stats.poRaised,c:STATUS_COLOR['PO Raised']}].map(row=>(
                <tr key={row.n}><td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:row.c,marginRight:8}}/>{row.n}</td>
                <td className={iStyles.mono}>{row.v}</td><td className={iStyles.mono}>{stats.total?(row.v/stats.total*100).toFixed(1):0}%</td>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{height:6,width:`${stats.total?row.v/stats.total*100:0}%`,maxWidth:80,background:row.c,borderRadius:4,minWidth:2}}/><span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{row.v}</span></div></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEPARTMENTS */}
      {tab==='departments' && (
        <div className={iStyles.aGrid}>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Indents by Department</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.deptData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="approved" name="Approved" fill={GREEN} radius={[4,4,0,0]}/>
                <Bar dataKey="rejected" name="Rejected" fill={ROSE} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Department Activity Radar</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                <PolarGrid stroke="#1f2235"/><PolarAngleAxis dataKey="dept" tick={{fill:'#9ca3af',fontSize:11}}/><PolarRadiusAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Radar name="Total" dataKey="total" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15}/>
                <Radar name="Approved" dataKey="approved" stroke={GREEN} fill={GREEN} fillOpacity={0.15}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/><Tooltip content={<DarkTooltip/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={iStyles.aCardTitle}>Department Detail</p>
            <table className={iStyles.sTable}>
              <thead><tr><th>Department</th><th>Indents</th><th>Approved</th><th>Rejected</th><th>Total Qty</th><th>Approval %</th></tr></thead>
              <tbody>{stats.deptData.map((d,i)=>(
                <tr key={d.name}>
                  <td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length],marginRight:8}}/><strong>{d.name}</strong></td>
                  <td className={iStyles.mono}>{d.total}</td>
                  <td className={iStyles.mono} style={{color:GREEN}}>{d.approved}</td>
                  <td className={iStyles.mono} style={{color:ROSE}}>{d.rejected}</td>
                  <td className={iStyles.mono}>{d.items}</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:d.total&&d.approved/d.total>=0.5?`${GREEN}22`:`${AMBER}22`,color:d.total&&d.approved/d.total>=0.5?GREEN:AMBER}}>{d.total?Math.round(d.approved/d.total*100):0}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUESTERS */}
      {tab==='performance' && (
        <div className={iStyles.aGrid}>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Requester — Total vs Approved</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.requData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="approved" name="Approved" fill={GREEN} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Requester Leaderboard</p>
            <table className={iStyles.sTable}>
              <thead><tr><th>#</th><th>Requester</th><th>Total</th><th>Approved</th><th>Approval %</th></tr></thead>
              <tbody>{[...stats.requData].sort((a,b)=>b.rate-a.rate).map((r,i)=>(
                <tr key={r.fullName}>
                  <td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td>
                  <td><strong>{r.fullName}</strong></td>
                  <td className={iStyles.mono}>{r.total}</td>
                  <td className={iStyles.mono} style={{color:GREEN}}>{r.approved}</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:r.rate>=50?`${GREEN}22`:`${AMBER}22`,color:r.rate>=50?GREEN:AMBER}}>{r.rate}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREND & HEALTH */}
      {tab==='trend' && (
        <div className={iStyles.aGrid}>
          <div className={iStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={iStyles.aCardTitle}>12-Month Indent Trend <span className={iStyles.aBadge}>total · approved · rejected</span></p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235"/>
                <XAxis dataKey="label" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line type="monotone" dataKey="total" name="Total" stroke={ACCENT} strokeWidth={2.5} dot={{fill:ACCENT,r:4}} activeDot={{r:6}}/>
                <Line type="monotone" dataKey="approved" name="Approved" stroke={GREEN} strokeWidth={2} dot={{fill:GREEN,r:3}}/>
                <Line type="monotone" dataKey="rejected" name="Rejected" stroke={ROSE} strokeWidth={2} dot={{fill:ROSE,r:3}}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Outcome Mix</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={[{name:'Approved',value:stats.approved},{name:'PO Raised',value:stats.poRaised},{name:'Pending',value:stats.submitted+stats.draft},{name:'Rejected',value:stats.rejected}].filter(d=>d.value>0)}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} paddingAngle={3}
                label={({name,percent})=>`${((percent??0)*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={GREEN}/><Cell fill={PURPLE}/><Cell fill={CYAN}/><Cell fill={ROSE}/>
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={iStyles.aCard}>
            <p className={iStyles.aCardTitle}>Approval Health</p>
            <div className={iStyles.healthPanel}>
              {[{label:'Approval Rate',val:stats.approvalRate,color:GREEN},{label:'Rejection Rate',val:stats.rejRate,color:ROSE},{label:'Pending / Open',val:stats.total?Math.round((stats.submitted+stats.draft)/stats.total*100):0,color:CYAN}].map(row=>(
                <div key={row.label} className={iStyles.hRow}>
                  <span className={iStyles.hLabel}>{row.label}</span>
                  <div className={iStyles.hTrack}><div className={iStyles.hFill} style={{width:`${row.val}%`,background:row.color}}/></div>
                  <span className={iStyles.hPct} style={{color:row.color}}>{row.val}%</span>
                </div>
              ))}
              <div className={iStyles.insight}>
                <span>
                  {stats.approvalRate>=70?'Excellent approval process — over 70% indents approved or PO raised.':stats.approvalRate>=50?'Good flow. Review pending submissions to reduce backlog.':'High rejection or stagnation. Audit indent quality and approver SLAs.'}
                  {' '}<strong>{stats.total}</strong> total indents covering <strong>{stats.totalItems}</strong> units of material.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
