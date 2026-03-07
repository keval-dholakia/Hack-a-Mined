'use client'

import { useState } from 'react'
import joStyles from './JobOrder.module.scss'
import JobOrderAnalytics from './JobOrderAnalytics'

/* ── Constants ───────────────────────────────────────────── */
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

export const STATUS_COLOR: Record<string,string> = { Draft:'#6b7280', Planned:CYAN, 'In Progress':ACCENT, 'On Hold':AMBER, Completed:GREEN, Cancelled:ROSE }
export const STATUS_BG:    Record<string,string> = { Draft:'rgba(107,114,128,0.12)', Planned:`${CYAN}18`, 'In Progress':`${ACCENT}18`, 'On Hold':`${AMBER}18`, Completed:`${GREEN}18`, Cancelled:`${ROSE}18` }
export const PRIORITY_COLOR: Record<string,string> = { Low:GREEN, Medium:AMBER, High:'#fb923c', Urgent:ROSE }

export type JOStatus   = 'Draft' | 'Planned' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
export type JOPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface JOOperation { operation: string; machine: string; est_hrs: number; actual_hrs: number; op_status: 'Pending'|'Running'|'Done' }
export interface JobOrderRecord {
  id: number; jo_no: string; so_ref: string; product: string; qty: number; unit: string
  work_center: string; operator: string; priority: JOPriority; status: JOStatus
  planned_start: string; planned_end: string; actual_start: string; actual_end: string
  operations: JOOperation[]; notes: string
}

/* ── Seed ────────────────────────────────────────────────── */
export const SEED: JobOrderRecord[] = [
  { id:1,  jo_no:'JO-2601', so_ref:'SO-001', product:'Steel Shaft 30mm',      qty:200, unit:'Nos', work_center:'Turning',      operator:'Ramesh Kumar',  priority:'High',   status:'Completed',   planned_start:'2026-01-06', planned_end:'2026-01-14', actual_start:'2026-01-06', actual_end:'2026-01-13', operations:[{operation:'Turning',machine:'CNC Lathe 1',est_hrs:16,actual_hrs:14,op_status:'Done'},{operation:'Grinding',machine:'Surface Grinder',est_hrs:8,actual_hrs:8,op_status:'Done'}], notes:'Delivered ahead of schedule.' },
  { id:2,  jo_no:'JO-2602', so_ref:'SO-002', product:'Motor Housing',          qty:50,  unit:'Nos', work_center:'Milling',      operator:'Suresh Nair',   priority:'Medium', status:'Completed',   planned_start:'2026-01-10', planned_end:'2026-01-20', actual_start:'2026-01-10', actual_end:'2026-01-22', operations:[{operation:'Milling',machine:'VMC Machine',est_hrs:20,actual_hrs:22,op_status:'Done'},{operation:'Drilling',machine:'Radial Drill',est_hrs:6,actual_hrs:7,op_status:'Done'}], notes:'' },
  { id:3,  jo_no:'JO-2603', so_ref:'SO-003', product:'Precision Gear',         qty:300, unit:'Nos', work_center:'Gear Cutting', operator:'Anand Singh',   priority:'High',   status:'Completed',   planned_start:'2026-01-15', planned_end:'2026-01-28', actual_start:'2026-01-15', actual_end:'2026-01-28', operations:[{operation:'Hobbing',machine:'Gear Hobber 1',est_hrs:30,actual_hrs:30,op_status:'Done'}], notes:'' },
  { id:4,  jo_no:'JO-2604', so_ref:'SO-004', product:'Control Panel Unit',     qty:10,  unit:'Nos', work_center:'Assembly',     operator:'Priya Sharma',  priority:'Urgent', status:'Completed',   planned_start:'2026-01-20', planned_end:'2026-02-01', actual_start:'2026-01-21', actual_end:'2026-02-03', operations:[{operation:'Assembly',machine:'Bench',est_hrs:40,actual_hrs:44,op_status:'Done'},{operation:'Testing',machine:'Test Rig',est_hrs:10,actual_hrs:12,op_status:'Done'}], notes:'Minor delay in component supply.' },
  { id:5,  jo_no:'JO-2605', so_ref:'SO-005', product:'Crankshaft Assembly',    qty:80,  unit:'Nos', work_center:'Turning',      operator:'Ramesh Kumar',  priority:'High',   status:'In Progress', planned_start:'2026-02-01', planned_end:'2026-02-18', actual_start:'2026-02-01', actual_end:'',           operations:[{operation:'Rough Turning',machine:'CNC Lathe 1',est_hrs:24,actual_hrs:18,op_status:'Done'},{operation:'Finish Turning',machine:'CNC Lathe 2',est_hrs:24,actual_hrs:0,op_status:'Running'}], notes:'On track.' },
  { id:6,  jo_no:'JO-2606', so_ref:'',       product:'Engine Mount',           qty:120, unit:'Nos', work_center:'Welding',      operator:'Deepak Rao',    priority:'Medium', status:'In Progress', planned_start:'2026-02-05', planned_end:'2026-02-20', actual_start:'2026-02-06', actual_end:'',           operations:[{operation:'Cutting',machine:'Laser Cutter',est_hrs:8,actual_hrs:8,op_status:'Done'},{operation:'Welding',machine:'MIG Welder',est_hrs:20,actual_hrs:10,op_status:'Running'}], notes:'' },
  { id:7,  jo_no:'JO-2607', so_ref:'SO-007', product:'Axle Shaft',             qty:60,  unit:'Nos', work_center:'Turning',      operator:'Suresh Nair',   priority:'High',   status:'Planned',     planned_start:'2026-02-20', planned_end:'2026-03-05', actual_start:'',           actual_end:'',           operations:[{operation:'Forging',machine:'Hydraulic Press',est_hrs:12,actual_hrs:0,op_status:'Pending'},{operation:'Turning',machine:'CNC Lathe 3',est_hrs:18,actual_hrs:0,op_status:'Pending'}], notes:'Raw material received.' },
  { id:8,  jo_no:'JO-2608', so_ref:'SO-008', product:'Gear Box Cover',         qty:40,  unit:'Nos', work_center:'Milling',      operator:'Anand Singh',   priority:'Medium', status:'On Hold',     planned_start:'2026-02-10', planned_end:'2026-02-25', actual_start:'2026-02-10', actual_end:'',           operations:[{operation:'Milling',machine:'VMC Machine',est_hrs:16,actual_hrs:8,op_status:'Pending'},{operation:'Painting',machine:'Paint Booth',est_hrs:6,actual_hrs:0,op_status:'Pending'}], notes:'On hold — awaiting special paint material.' },
  { id:9,  jo_no:'JO-2609', so_ref:'SO-009', product:'Battery Bracket',        qty:200, unit:'Nos', work_center:'Sheet Metal',  operator:'Priya Sharma',  priority:'Low',    status:'Planned',     planned_start:'2026-03-03', planned_end:'2026-03-15', actual_start:'',           actual_end:'',           operations:[{operation:'Blanking',machine:'Power Press',est_hrs:10,actual_hrs:0,op_status:'Pending'},{operation:'Bending',machine:'CNC Bender',est_hrs:10,actual_hrs:0,op_status:'Pending'}], notes:'' },
  { id:10, jo_no:'JO-2610', so_ref:'',       product:'Hydraulic Cylinder Body',qty:25,  unit:'Nos', work_center:'Turning',      operator:'Ramesh Kumar',  priority:'Urgent', status:'Draft',       planned_start:'2026-03-08', planned_end:'2026-03-22', actual_start:'',           actual_end:'',           operations:[{operation:'Boring',machine:'Boring Machine',est_hrs:20,actual_hrs:0,op_status:'Pending'},{operation:'Honing',machine:'Honing Machine',est_hrs:10,actual_hrs:0,op_status:'Pending'}], notes:'Awaiting SO confirmation.' },
]

const PRODUCTS     = ['Steel Shaft 30mm','Motor Housing','Precision Gear','Control Panel Unit','Crankshaft Assembly','Engine Mount','Axle Shaft','Gear Box Cover','Battery Bracket','Hydraulic Cylinder Body','Pump Housing','Valve Body']
const WORK_CENTERS = ['Turning','Milling','Grinding','Gear Cutting','Assembly','Welding','Sheet Metal','Boring','Painting','Quality']
const OPERATORS    = ['Ramesh Kumar','Suresh Nair','Anand Singh','Priya Sharma','Deepak Rao','Meera Joshi']
const PRIORITIES: JOPriority[] = ['Low','Medium','High','Urgent']
const STATUSES: JOStatus[]     = ['Draft','Planned','In Progress','On Hold','Completed','Cancelled']
const OPERATIONS_LIST = ['Turning','Milling','Grinding','Drilling','Boring','Honing','Hobbing','Assembly','Welding','Cutting','Painting','Testing','Inspection']
const MACHINES_LIST   = ['CNC Lathe 1','CNC Lathe 2','CNC Lathe 3','VMC Machine','Surface Grinder','Radial Drill','Gear Hobber 1','Hydraulic Press','MIG Welder','Laser Cutter','Power Press','CNC Bender','Boring Machine','Honing Machine','Paint Booth','Test Rig','Bench']
const UNITS = ['Nos','Kg','Sets','Metres']

let nextId = 11

const BLANK_FORM = () => ({
  product: PRODUCTS[0], qty: 1, unit: 'Nos', so_ref: '',
  work_center: WORK_CENTERS[0], operator: OPERATORS[0],
  priority: 'Medium' as JOPriority, status: 'Draft' as JOStatus,
  planned_start: new Date().toISOString().slice(0,10),
  planned_end:   new Date(Date.now()+14*86400000).toISOString().slice(0,10),
  actual_start: '', actual_end: '', notes: '',
  operations: [{ operation: OPERATIONS_LIST[0], machine: MACHINES_LIST[0], est_hrs: 8, actual_hrs: 0, op_status: 'Pending' as const }],
})

function progressPct(jo: JobOrderRecord) {
  const ops = jo.operations
  if (!ops.length) return 0
  const done = ops.filter(o=>o.op_status==='Done').length
  return Math.round(done/ops.length*100)
}

/* ═══════════════════════════════════════════════════════════════ */
export default function JobOrder() {
  const [records, setRecords] = useState<JobOrderRecord[]>(SEED)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [wcF,     setWcF]     = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [editId,  setEditId]  = useState<number|null>(null)
  const [deleteId,setDeleteId]= useState<number|null>(null)
  const [viewId,  setViewId]  = useState<number|null>(null)
  const [form,    setForm]    = useState<any>(BLANK_FORM())

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.jo_no.toLowerCase().includes(q) || r.product.toLowerCase().includes(q) || r.operator.toLowerCase().includes(q) || r.so_ref.toLowerCase().includes(q)) &&
      (!statusF || r.status === statusF) && (!wcF || r.work_center === wcF)
  })

  function openCreate() { setForm({ ...BLANK_FORM(), jo_no:`JO-26${String(nextId).padStart(2,'0')}` }); setEditId(null); setOpen(true) }
  function openEdit(r: JobOrderRecord) {
    setForm({ product:r.product, qty:r.qty, unit:r.unit, so_ref:r.so_ref, work_center:r.work_center, operator:r.operator, priority:r.priority, status:r.status, planned_start:r.planned_start, planned_end:r.planned_end, actual_start:r.actual_start, actual_end:r.actual_end, notes:r.notes, operations:r.operations.map(o=>({...o})) })
    setEditId(r.id); setOpen(true)
  }
  function setOp(idx:number, key:string, val:any) { setForm((f:any)=>({...f, operations:f.operations.map((o:any,i:number)=>i===idx?{...o,[key]:val}:o)}))}
  function addOp()        { setForm((f:any)=>({...f, operations:[...f.operations,{operation:OPERATIONS_LIST[0],machine:MACHINES_LIST[0],est_hrs:8,actual_hrs:0,op_status:'Pending'}]}))}
  function removeOp(idx:number) { setForm((f:any)=>({...f, operations:f.operations.filter((_:any,i:number)=>i!==idx)}))}

  function handleSave() {
    const rec:JobOrderRecord = {
      id: editId??nextId++,
      jo_no: editId?records.find(r=>r.id===editId)!.jo_no:`JO-26${String(nextId-1).padStart(2,'0')}`,
      so_ref:form.so_ref, product:form.product, qty:form.qty, unit:form.unit,
      work_center:form.work_center, operator:form.operator, priority:form.priority, status:form.status,
      planned_start:form.planned_start, planned_end:form.planned_end,
      actual_start:form.actual_start, actual_end:form.actual_end,
      operations:form.operations, notes:form.notes,
    }
    setRecords(rs => editId?rs.map(r=>r.id===editId?rec:r):[rec,...rs])
    setOpen(false)
  }

  const viewRec = records.find(r=>r.id===viewId)
  const canSave = form.product && form.qty > 0 && form.planned_start && form.planned_end

  if (showAnalytics) return <JobOrderAnalytics records={records} onClose={()=>setShowAnalytics(false)} />

  return (
    <div className={joStyles.page}>
      {/* Header */}
      <div className={joStyles.header}>
        <div><h1 className={joStyles.title}>Job Orders</h1><p className={joStyles.subtitle}>{records.length} total job orders</p></div>
        <div className={joStyles.headerBtns}>
          <button className={joStyles.analyticsBtn} onClick={()=>setShowAnalytics(true)}>Analytics</button>
          <button className={joStyles.primaryBtn} onClick={openCreate}>+ New Job Order</button>
        </div>
      </div>

      {/* Stat Row */}
      <div className={joStyles.statRow}>
        {STATUSES.map(s=>{ const c=records.filter(r=>r.status===s).length; return (
          <div key={s} className={joStyles.statCard} style={{borderColor:c>0?`${STATUS_COLOR[s]}40`:undefined}}>
            <p className={joStyles.statVal} style={{color:STATUS_COLOR[s]}}>{c}</p><p className={joStyles.statLabel}>{s}</p>
          </div>
        )})}
        <div className={joStyles.statCard} style={{borderColor:`${ACCENT}40`}}>
          <p className={joStyles.statVal} style={{color:ACCENT}}>{records.reduce((s,r)=>s+r.qty,0)}</p><p className={joStyles.statLabel}>Total Qty</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={joStyles.toolbar}>
        <input className={joStyles.searchInput} placeholder="Search JO no, product, operator, SO ref…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className={joStyles.filterSelect} value={statusF} onChange={e=>setStatusF(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className={joStyles.filterSelect} value={wcF} onChange={e=>setWcF(e.target.value)}>
          <option value="">All Work Centers</option>{WORK_CENTERS.map(w=><option key={w}>{w}</option>)}
        </select>
        <span className={joStyles.resultCount}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* Table */}
      <div className={joStyles.tableCard}>
        {filtered.length===0 ? <div className={joStyles.empty}><p>No job orders match your filter.</p></div> : (
          <div className={joStyles.tableWrap}>
            <table className={joStyles.table}>
              <thead><tr><th>JO No.</th><th>Product</th><th>SO Ref.</th><th>Qty</th><th>Work Center</th><th>Operator</th><th>Planned End</th><th className={joStyles.center}>Progress</th><th className={joStyles.center}>Priority</th><th className={joStyles.center}>Status</th><th className={joStyles.center}>Actions</th></tr></thead>
              <tbody>{filtered.map(r=>{
                const pct = progressPct(r)
                return (
                  <tr key={r.id}>
                    <td className={joStyles.mono}>{r.jo_no}</td>
                    <td className={joStyles.bold}>{r.product}</td>
                    <td className={joStyles.muted}>{r.so_ref||'—'}</td>
                    <td className={joStyles.mono}>{r.qty} <span className={joStyles.muted}>{r.unit}</span></td>
                    <td>{r.work_center}</td>
                    <td>{r.operator}</td>
                    <td className={joStyles.mono} style={r.status!=='Completed'&&r.status!=='Cancelled'&&new Date(r.planned_end)<new Date()?{color:ROSE}:undefined}>{r.planned_end}</td>
                    <td className={joStyles.center}>
                      <div className={joStyles.progressWrap}>
                        <div className={joStyles.progressBar}><div className={joStyles.progressFill} style={{width:`${pct}%`,background:pct===100?GREEN:ACCENT}}/></div>
                        <span className={joStyles.progressPct}>{pct}%</span>
                      </div>
                    </td>
                    <td className={joStyles.center}><span className={joStyles.priorityPill} style={{background:`${PRIORITY_COLOR[r.priority]}18`,color:PRIORITY_COLOR[r.priority]}}>{r.priority}</span></td>
                    <td className={joStyles.center}><span className={joStyles.statusPill} style={{background:STATUS_BG[r.status],color:STATUS_COLOR[r.status]}}>{r.status}</span></td>
                    <td className={joStyles.center}>
                      <div className={joStyles.rowActions}>
                        <button className={joStyles.viewBtn} onClick={()=>setViewId(r.id)}>View</button>
                        <button className={joStyles.editBtn} onClick={()=>openEdit(r)}>Edit</button>
                        <button className={joStyles.delBtn}  onClick={()=>setDeleteId(r.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {open && (
        <div className={joStyles.overlay} onClick={()=>setOpen(false)}>
          <div className={joStyles.drawer} onClick={e=>e.stopPropagation()}>
            <div className={joStyles.drawerHead}><h2>{editId?'Edit Job Order':'New Job Order'}</h2><button className={joStyles.closeBtn} onClick={()=>setOpen(false)}>✕</button></div>
            <div className={joStyles.drawerBody}>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Product *</label><select value={form.product} onChange={e=>setForm((f:any)=>({...f,product:e.target.value}))}>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</select></div>
                <div className={joStyles.dField}><label>SO Reference</label><input placeholder="e.g. SO-001" value={form.so_ref} onChange={e=>setForm((f:any)=>({...f,so_ref:e.target.value}))}/></div>
              </div>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Quantity *</label><input type="number" min={1} value={form.qty} onChange={e=>setForm((f:any)=>({...f,qty:Number(e.target.value)}))}/></div>
                <div className={joStyles.dField}><label>Unit</label><select value={form.unit} onChange={e=>setForm((f:any)=>({...f,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              </div>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Work Center</label><select value={form.work_center} onChange={e=>setForm((f:any)=>({...f,work_center:e.target.value}))}>{WORK_CENTERS.map(w=><option key={w}>{w}</option>)}</select></div>
                <div className={joStyles.dField}><label>Operator</label><select value={form.operator} onChange={e=>setForm((f:any)=>({...f,operator:e.target.value}))}>{OPERATORS.map(o=><option key={o}>{o}</option>)}</select></div>
              </div>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Planned Start *</label><input type="date" value={form.planned_start} onChange={e=>setForm((f:any)=>({...f,planned_start:e.target.value}))}/></div>
                <div className={joStyles.dField}><label>Planned End *</label><input type="date" value={form.planned_end} onChange={e=>setForm((f:any)=>({...f,planned_end:e.target.value}))}/></div>
              </div>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Actual Start</label><input type="date" value={form.actual_start} onChange={e=>setForm((f:any)=>({...f,actual_start:e.target.value}))}/></div>
                <div className={joStyles.dField}><label>Actual End</label><input type="date" value={form.actual_end} onChange={e=>setForm((f:any)=>({...f,actual_end:e.target.value}))}/></div>
              </div>
              <div className={joStyles.dRow}>
                <div className={joStyles.dField}><label>Priority</label><select value={form.priority} onChange={e=>setForm((f:any)=>({...f,priority:e.target.value}))}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
                <div className={joStyles.dField}><label>Status</label><select value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              <div className={joStyles.sectionLabel}>Operations</div>
              <div className={joStyles.opsHeader}><span>Operation</span><span>Machine</span><span>Est. Hrs</span><span>Act. Hrs</span><span>Status</span><span/></div>
              {form.operations.map((op:any,idx:number)=>(
                <div key={idx} className={joStyles.opRow}>
                  <select value={op.operation} onChange={e=>setOp(idx,'operation',e.target.value)}>{OPERATIONS_LIST.map(o=><option key={o}>{o}</option>)}</select>
                  <select value={op.machine}   onChange={e=>setOp(idx,'machine',  e.target.value)}>{MACHINES_LIST.map(m=><option key={m}>{m}</option>)}</select>
                  <input type="number" min={0} value={op.est_hrs}    onChange={e=>setOp(idx,'est_hrs',   Number(e.target.value))}/>
                  <input type="number" min={0} value={op.actual_hrs} onChange={e=>setOp(idx,'actual_hrs',Number(e.target.value))}/>
                  <select value={op.op_status} onChange={e=>setOp(idx,'op_status',e.target.value)}><option>Pending</option><option>Running</option><option>Done</option></select>
                  <button className={joStyles.removeBtn} onClick={()=>removeOp(idx)} disabled={form.operations.length===1}>✕</button>
                </div>
              ))}
              <button className={joStyles.addRowBtn} onClick={addOp}>+ Add Operation</button>
              <div className={joStyles.dField}><label>Notes</label><textarea rows={2} value={form.notes} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className={joStyles.drawerFoot}>
              <button className={joStyles.cancelBtn} onClick={()=>setOpen(false)}>Cancel</button>
              <button className={joStyles.saveBtn} disabled={!canSave} onClick={handleSave}>{editId?'Update':'Create'} Job Order</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRec && (
        <div className={joStyles.overlay} onClick={()=>setViewId(null)}>
          <div className={joStyles.modal} onClick={e=>e.stopPropagation()}>
            <div className={joStyles.drawerHead}>
              <div>
                <h2>{viewRec.jo_no} — {viewRec.product}</h2>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.25rem',flexWrap:'wrap'}}>
                  <span className={joStyles.statusPill} style={{background:STATUS_BG[viewRec.status],color:STATUS_COLOR[viewRec.status]}}>{viewRec.status}</span>
                  <span className={joStyles.priorityPill} style={{background:`${PRIORITY_COLOR[viewRec.priority]}18`,color:PRIORITY_COLOR[viewRec.priority]}}>{viewRec.priority}</span>
                </div>
              </div>
              <button className={joStyles.closeBtn} onClick={()=>setViewId(null)}>✕</button>
            </div>
            <div className={joStyles.modalBody}>
              <div className={joStyles.metaGrid}>
                <div><p className={joStyles.metaLabel}>Work Center</p><p className={joStyles.metaVal}>{viewRec.work_center}</p></div>
                <div><p className={joStyles.metaLabel}>Operator</p><p className={joStyles.metaVal}>{viewRec.operator}</p></div>
                <div><p className={joStyles.metaLabel}>Quantity</p><p className={joStyles.metaVal}>{viewRec.qty} {viewRec.unit}</p></div>
                <div><p className={joStyles.metaLabel}>SO Ref.</p><p className={joStyles.metaVal}>{viewRec.so_ref||'—'}</p></div>
                <div><p className={joStyles.metaLabel}>Planned</p><p className={joStyles.metaVal}>{viewRec.planned_start} → {viewRec.planned_end}</p></div>
                <div><p className={joStyles.metaLabel}>Actual</p><p className={joStyles.metaVal}>{viewRec.actual_start||'—'} → {viewRec.actual_end||'—'}</p></div>
              </div>
              <div className={joStyles.progressWrap} style={{margin:'1rem 0'}}>
                <div className={joStyles.progressBar} style={{height:10}}>
                  <div className={joStyles.progressFill} style={{width:`${progressPct(viewRec)}%`,background:progressPct(viewRec)===100?GREEN:ACCENT}}/>
                </div>
                <span className={joStyles.progressPct}>{progressPct(viewRec)}% complete</span>
              </div>
              <div className={joStyles.sectionLabel} style={{marginTop:'1rem'}}>Operations</div>
              <table className={joStyles.viewItemTable}>
                <thead><tr><th>#</th><th>Operation</th><th>Machine</th><th>Est. Hrs</th><th>Act. Hrs</th><th>Status</th></tr></thead>
                <tbody>{viewRec.operations.map((op,i)=>(
                  <tr key={i}>
                    <td className={joStyles.muted}>{i+1}</td><td className={joStyles.bold}>{op.operation}</td>
                    <td className={joStyles.muted}>{op.machine}</td><td className={joStyles.mono}>{op.est_hrs}h</td>
                    <td className={joStyles.mono}>{op.actual_hrs}h</td>
                    <td><span style={{padding:'0.15rem 0.5rem',borderRadius:5,fontSize:'0.7rem',fontWeight:700,background:op.op_status==='Done'?`${GREEN}18`:op.op_status==='Running'?`${ACCENT}18`:'rgba(107,114,128,0.12)',color:op.op_status==='Done'?GREEN:op.op_status==='Running'?ACCENT:'#6b7280'}}>{op.op_status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
              {viewRec.notes&&<p className={joStyles.viewRemarks}><span>Notes:</span> {viewRec.notes}</p>}
              <div className={joStyles.modalActions}>
                <button className={joStyles.cancelBtn} onClick={()=>setViewId(null)}>Close</button>
                <button className={joStyles.editBtn}   onClick={()=>{setViewId(null);openEdit(viewRec)}}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId!==null&&(
        <div className={joStyles.overlay} onClick={()=>setDeleteId(null)}>
          <div className={joStyles.confirmModal} onClick={e=>e.stopPropagation()}>
            <h3>Delete Job Order?</h3><p>This record will be permanently removed.</p>
            <div className={joStyles.confirmActions}>
              <button className={joStyles.cancelBtn} onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className={joStyles.confirmDelBtn} onClick={()=>{setRecords(rs=>rs.filter(r=>r.id!==deleteId));setDeleteId(null)}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
