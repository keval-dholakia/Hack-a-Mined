'use client'

import { useState } from 'react'
import toStyles from './TransportOrder.module.scss'
import TransportOrderAnalytics from './TransportOrderAnalytics'

/* ── Palette & constants ──────────────────────────────────── */
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

export const STATUS_COLOR: Record<string,string> = { Draft:'#6b7280', Booked:CYAN, Dispatched:ACCENT, 'In Transit':AMBER, Delivered:GREEN, Cancelled:ROSE }
export const STATUS_BG:    Record<string,string> = { Draft:'rgba(107,114,128,0.12)', Booked:`${CYAN}18`, Dispatched:`${ACCENT}18`, 'In Transit':`${AMBER}18`, Delivered:`${GREEN}18`, Cancelled:`${ROSE}18` }
export const MODE_COLOR:   Record<string,string> = { Road:GREEN, Rail:CYAN, Air:PURPLE, Sea:AMBER }

export type TOStatus = 'Draft'|'Booked'|'Dispatched'|'In Transit'|'Delivered'|'Cancelled'
export type TOMode   = 'Road'|'Rail'|'Air'|'Sea'

export interface TOItem { description: string; qty: number; packages: number; weight_kg: number }
export interface TransportOrderRecord {
  id: number; to_no: string; so_ref: string; customer: string
  transporter: string; vehicle_no: string; driver_name: string; driver_contact: string
  mode: TOMode; origin: string; destination: string
  dispatch_date: string; expected_delivery: string; actual_delivery: string
  status: TOStatus; freight_amt: number; items: TOItem[]; notes: string
}

/* ── Seed data ────────────────────────────────────────────── */
export const SEED: TransportOrderRecord[] = [
  { id:1,  to_no:'TO-2601', so_ref:'SO-001', customer:'Tata Motors Ltd',    transporter:'Mahavir Logistics',  vehicle_no:'GJ-05-AB-1234', driver_name:'Raju Yadav',    driver_contact:'9876543210', mode:'Road', origin:'Surat',     destination:'Pune',       dispatch_date:'2026-01-08', expected_delivery:'2026-01-10', actual_delivery:'2026-01-10', status:'Delivered',  freight_amt:8500,  items:[{description:'Steel Shafts',qty:200,packages:10,weight_kg:480}], notes:'On time delivery.' },
  { id:2,  to_no:'TO-2602', so_ref:'SO-002', customer:'Mahindra Electric',  transporter:'Blue Dart Logistics', vehicle_no:'MH-12-GH-5678', driver_name:'Suresh Patil',  driver_contact:'9812345678', mode:'Road', origin:'Pune',      destination:'Nashik',     dispatch_date:'2026-01-15', expected_delivery:'2026-01-16', actual_delivery:'2026-01-17', status:'Delivered',  freight_amt:5200,  items:[{description:'Motor Housings',qty:50,packages:5,weight_kg:250}], notes:'Delayed by 1 day.' },
  { id:3,  to_no:'TO-2603', so_ref:'SO-003', customer:'Bosch India',        transporter:'DTDC Freight',        vehicle_no:'KA-01-CD-9012', driver_name:'Mohan Das',      driver_contact:'9823456789', mode:'Road', origin:'Bangalore', destination:'Chennai',    dispatch_date:'2026-01-22', expected_delivery:'2026-01-24', actual_delivery:'2026-01-23', status:'Delivered',  freight_amt:12000, items:[{description:'Precision Gears',qty:300,packages:15,weight_kg:180}], notes:'' },
  { id:4,  to_no:'TO-2604', so_ref:'SO-004', customer:'L&T Electrical',     transporter:'TCI Express',         vehicle_no:'RJ-14-EF-3456', driver_name:'Anil Sharma',   driver_contact:'9834567890', mode:'Road', origin:'Jaipur',    destination:'Delhi',      dispatch_date:'2026-01-28', expected_delivery:'2026-01-30', actual_delivery:'2026-01-30', status:'Delivered',  freight_amt:7800,  items:[{description:'Control Panels',qty:10,packages:10,weight_kg:350}], notes:'' },
  { id:5,  to_no:'TO-2605', so_ref:'SO-005', customer:'Bajaj Auto',         transporter:'Mahavir Logistics',   vehicle_no:'GJ-01-KL-7890', driver_name:'Raju Yadav',    driver_contact:'9876543210', mode:'Road', origin:'Surat',     destination:'Aurangabad', dispatch_date:'2026-02-04', expected_delivery:'2026-02-06', actual_delivery:'',           status:'In Transit', freight_amt:9200,  items:[{description:'Crankshaft Assy',qty:80,packages:8,weight_kg:560}], notes:'Vehicle tracked at Dhule.' },
  { id:6,  to_no:'TO-2606', so_ref:'',       customer:'TVS Motor',          transporter:'VRL Logistics',       vehicle_no:'TN-07-MN-2345', driver_name:'Kannan R',      driver_contact:'9845678901', mode:'Road', origin:'Chennai',   destination:'Hosur',      dispatch_date:'2026-02-10', expected_delivery:'2026-02-11', actual_delivery:'',           status:'Dispatched', freight_amt:3800,  items:[{description:'Engine Mounts',qty:120,packages:6,weight_kg:420}], notes:'' },
  { id:7,  to_no:'TO-2607', so_ref:'SO-007', customer:'Ashok Leyland',      transporter:'DTDC Freight',        vehicle_no:'AP-28-PQ-6789', driver_name:'Venkat Rao',    driver_contact:'9856789012', mode:'Rail', origin:'Hyderabad', destination:'Mumbai',     dispatch_date:'2026-02-15', expected_delivery:'2026-02-17', actual_delivery:'',           status:'Dispatched', freight_amt:22000, items:[{description:'Axle Shafts',qty:60,packages:4,weight_kg:720}], notes:'Rail wagon WR-4421.' },
  { id:8,  to_no:'TO-2608', so_ref:'SO-008', customer:'Eicher Motors',      transporter:'Mahavir Logistics',   vehicle_no:'GJ-05-RS-1122', driver_name:'Dinesh Patel',  driver_contact:'9867890123', mode:'Road', origin:'Surat',     destination:'Pithampur',  dispatch_date:'2026-02-22', expected_delivery:'2026-02-25', actual_delivery:'',           status:'Booked',     freight_amt:11500, items:[{description:'Gear Box Covers',qty:40,packages:4,weight_kg:280}], notes:'Pickup scheduled 9AM.' },
  { id:9,  to_no:'TO-2609', so_ref:'SO-009', customer:'Mahindra Electric',  transporter:'Blue Dart Logistics', vehicle_no:'',              driver_name:'',              driver_contact:'',           mode:'Air',  origin:'Surat',     destination:'Bangalore',  dispatch_date:'2026-03-02', expected_delivery:'2026-03-03', actual_delivery:'',           status:'Booked',     freight_amt:35000, items:[{description:'Battery Brackets',qty:200,packages:10,weight_kg:180}], notes:'Air shipment due to urgency.' },
  { id:10, to_no:'TO-2610', so_ref:'',       customer:'Tata Motors Ltd',    transporter:'TCI Express',         vehicle_no:'',              driver_name:'',              driver_contact:'',           mode:'Road', origin:'Surat',     destination:'Lucknow',    dispatch_date:'2026-03-10', expected_delivery:'2026-03-13', actual_delivery:'',           status:'Draft',      freight_amt:14000, items:[{description:'Hydraulic Cylinders',qty:25,packages:5,weight_kg:375}], notes:'Awaiting dispatch clearance.' },
]

export const CUSTOMERS    = ['Tata Motors Ltd','Mahindra Electric','Bosch India','L&T Electrical','Bajaj Auto','TVS Motor','Ashok Leyland','Eicher Motors']
export const TRANSPORTERS = ['Mahavir Logistics','Blue Dart Logistics','DTDC Freight','TCI Express','VRL Logistics','Safexpress','Delhivery']
export const ORIGINS      = ['Surat','Pune','Bangalore','Jaipur','Chennai','Hyderabad','Mumbai','Delhi']
export const DESTINATIONS = ['Pune','Nashik','Chennai','Delhi','Aurangabad','Hosur','Mumbai','Pithampur','Bangalore','Lucknow']
export const STATUSES: TOStatus[] = ['Draft','Booked','Dispatched','In Transit','Delivered','Cancelled']
export const MODES:    TOMode[]   = ['Road','Rail','Air','Sea']

const fmtCur = (n: number) => n>=1_00_000?`₹${(n/1_00_000).toFixed(1)}L`:`₹${n.toLocaleString('en-IN')}`

let nextId = 11
const BLANK = (): any => ({ customer:CUSTOMERS[0], so_ref:'', transporter:TRANSPORTERS[0], vehicle_no:'', driver_name:'', driver_contact:'', mode:'Road' as TOMode, origin:ORIGINS[0], destination:DESTINATIONS[0], dispatch_date:new Date().toISOString().slice(0,10), expected_delivery:new Date(Date.now()+2*86400000).toISOString().slice(0,10), actual_delivery:'', status:'Draft' as TOStatus, freight_amt:0, notes:'', items:[{description:'',qty:1,packages:1,weight_kg:0}] })

/* ═══════════════════════════════════════════════════════════ */
export default function TransportOrder() {
  const [records, setRecords] = useState<TransportOrderRecord[]>(SEED)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [modeF,   setModeF]   = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [open,    setOpen]    = useState(false)
  const [editId,  setEditId]  = useState<number|null>(null)
  const [deleteId,setDeleteId]= useState<number|null>(null)
  const [viewId,  setViewId]  = useState<number|null>(null)
  const [form,    setForm]    = useState<any>(BLANK())

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.to_no.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.transporter.toLowerCase().includes(q) || r.so_ref.toLowerCase().includes(q) || r.vehicle_no.toLowerCase().includes(q)) &&
      (!statusF || r.status===statusF) && (!modeF || r.mode===modeF)
  })

  function openCreate() { setForm({ ...BLANK(), to_no:`TO-26${String(nextId).padStart(2,'0')}` }); setEditId(null); setOpen(true) }
  function openEdit(r: TransportOrderRecord) {
    setForm({ customer:r.customer, so_ref:r.so_ref, transporter:r.transporter, vehicle_no:r.vehicle_no, driver_name:r.driver_name, driver_contact:r.driver_contact, mode:r.mode, origin:r.origin, destination:r.destination, dispatch_date:r.dispatch_date, expected_delivery:r.expected_delivery, actual_delivery:r.actual_delivery, status:r.status, freight_amt:r.freight_amt, notes:r.notes, items:r.items.map(i=>({...i})) })
    setEditId(r.id); setOpen(true)
  }
  function setItem(idx:number, key:keyof TOItem, val:any) { setForm((f:any)=>({...f, items:f.items.map((it:TOItem,i:number)=>i===idx?{...it,[key]:val}:it)}))}
  function addItem()        { setForm((f:any)=>({...f, items:[...f.items,{description:'',qty:1,packages:1,weight_kg:0}]}))}
  function removeItem(idx:number) { setForm((f:any)=>({...f, items:f.items.filter((_:any,i:number)=>i!==idx)}))}

  function handleSave() {
    const rec: TransportOrderRecord = {
      id:editId??nextId++,
      to_no:editId?records.find(r=>r.id===editId)!.to_no:`TO-26${String(nextId-1).padStart(2,'0')}`,
      so_ref:form.so_ref, customer:form.customer, transporter:form.transporter,
      vehicle_no:form.vehicle_no, driver_name:form.driver_name, driver_contact:form.driver_contact,
      mode:form.mode, origin:form.origin, destination:form.destination,
      dispatch_date:form.dispatch_date, expected_delivery:form.expected_delivery, actual_delivery:form.actual_delivery,
      status:form.status, freight_amt:Number(form.freight_amt), items:form.items, notes:form.notes,
    }
    setRecords(rs=>editId?rs.map(r=>r.id===editId?rec:r):[rec,...rs]); setOpen(false)
  }

  const viewRec = records.find(r=>r.id===viewId)
  const canSave = form.customer && form.transporter && form.dispatch_date && form.expected_delivery && form.items.length>0

  if (showAnalytics) return <TransportOrderAnalytics records={records} onClose={()=>setShowAnalytics(false)} />

  const totalFreight = records.reduce((s,r)=>s+r.freight_amt,0)

  return (
    <div className={toStyles.page}>

      {/* Header */}
      <div className={toStyles.header}>
        <div><h1 className={toStyles.title}>Transport Orders</h1><p className={toStyles.subtitle}>{records.length} total orders</p></div>
        <div className={toStyles.headerBtns}>
          <button className={toStyles.analyticsBtn} onClick={()=>setShowAnalytics(true)}>Analytics</button>
          <button className={toStyles.primaryBtn} onClick={openCreate}>+ New Transport Order</button>
        </div>
      </div>

      {/* Stat Row */}
      <div className={toStyles.statRow}>
        {STATUSES.map(s=>{ const c=records.filter(r=>r.status===s).length; return (
          <div key={s} className={toStyles.statCard} style={{borderColor:c>0?`${STATUS_COLOR[s]}40`:undefined}}>
            <p className={toStyles.statVal} style={{color:STATUS_COLOR[s]}}>{c}</p><p className={toStyles.statLabel}>{s}</p>
          </div>
        )})}
        <div className={toStyles.statCard} style={{borderColor:`${GREEN}40`}}>
          <p className={toStyles.statVal} style={{color:GREEN}}>{fmtCur(totalFreight)}</p><p className={toStyles.statLabel}>Total Freight</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={toStyles.toolbar}>
        <input className={toStyles.searchInput} placeholder="Search TO no, customer, transporter, vehicle, SO ref…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className={toStyles.filterSelect} value={statusF} onChange={e=>setStatusF(e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select className={toStyles.filterSelect} value={modeF} onChange={e=>setModeF(e.target.value)}>
          <option value="">All Modes</option>{MODES.map(m=><option key={m}>{m}</option>)}
        </select>
        <span className={toStyles.resultCount}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* Table */}
      <div className={toStyles.tableCard}>
        {filtered.length===0 ? <div className={toStyles.empty}><p>No transport orders match your filter.</p></div> : (
          <div className={toStyles.tableWrap}>
            <table className={toStyles.table}>
              <thead><tr>
                <th>TO No.</th><th>Customer</th><th>Transporter</th><th>Mode</th>
                <th>Route</th><th>Dispatch</th><th>Exp. Delivery</th>
                <th className={toStyles.right}>Freight</th>
                <th className={toStyles.center}>Status</th>
                <th className={toStyles.center}>Actions</th>
              </tr></thead>
              <tbody>{filtered.map(r=>(
                <tr key={r.id}>
                  <td className={toStyles.mono}>{r.to_no}</td>
                  <td className={toStyles.bold}>{r.customer}</td>
                  <td>{r.transporter}</td>
                  <td><span className={toStyles.modePill} style={{background:`${MODE_COLOR[r.mode]}18`,color:MODE_COLOR[r.mode]}}>{r.mode}</span></td>
                  <td className={toStyles.muted} style={{fontSize:'0.8rem'}}>{r.origin} → {r.destination}</td>
                  <td className={toStyles.mono}>{r.dispatch_date}</td>
                  <td className={toStyles.mono} style={!r.actual_delivery&&r.status!=='Cancelled'&&new Date(r.expected_delivery)<new Date()?{color:ROSE}:undefined}>
                    {r.actual_delivery ? <span style={{color:GREEN}}>{r.actual_delivery} ✓</span> : r.expected_delivery}
                  </td>
                  <td className={`${toStyles.mono} ${toStyles.right}`}>{fmtCur(r.freight_amt)}</td>
                  <td className={toStyles.center}><span className={toStyles.statusPill} style={{background:STATUS_BG[r.status],color:STATUS_COLOR[r.status]}}>{r.status}</span></td>
                  <td className={toStyles.center}>
                    <div className={toStyles.rowActions}>
                      <button className={toStyles.viewBtn} onClick={()=>setViewId(r.id)}>View</button>
                      <button className={toStyles.editBtn} onClick={()=>openEdit(r)}>Edit</button>
                      <button className={toStyles.delBtn}  onClick={()=>setDeleteId(r.id)}>✕</button>
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
        <div className={toStyles.overlay} onClick={()=>setOpen(false)}>
          <div className={toStyles.drawer} onClick={e=>e.stopPropagation()}>
            <div className={toStyles.drawerHead}><h2>{editId?'Edit Transport Order':'New Transport Order'}</h2><button className={toStyles.closeBtn} onClick={()=>setOpen(false)}>✕</button></div>
            <div className={toStyles.drawerBody}>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Customer *</label><select value={form.customer} onChange={e=>setForm((f:any)=>({...f,customer:e.target.value}))}>{CUSTOMERS.map(c=><option key={c}>{c}</option>)}</select></div>
                <div className={toStyles.dField}><label>SO Reference</label><input placeholder="e.g. SO-001" value={form.so_ref} onChange={e=>setForm((f:any)=>({...f,so_ref:e.target.value}))}/></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Transporter *</label><select value={form.transporter} onChange={e=>setForm((f:any)=>({...f,transporter:e.target.value}))}>{TRANSPORTERS.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className={toStyles.dField}><label>Mode</label><select value={form.mode} onChange={e=>setForm((f:any)=>({...f,mode:e.target.value as TOMode}))}>{MODES.map(m=><option key={m}>{m}</option>)}</select></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Origin *</label><select value={form.origin} onChange={e=>setForm((f:any)=>({...f,origin:e.target.value}))}>{ORIGINS.map(o=><option key={o}>{o}</option>)}</select></div>
                <div className={toStyles.dField}><label>Destination *</label><select value={form.destination} onChange={e=>setForm((f:any)=>({...f,destination:e.target.value}))}>{DESTINATIONS.map(d=><option key={d}>{d}</option>)}</select></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Vehicle No.</label><input placeholder="e.g. GJ-05-AB-1234" value={form.vehicle_no} onChange={e=>setForm((f:any)=>({...f,vehicle_no:e.target.value}))}/></div>
                <div className={toStyles.dField}><label>Driver Name</label><input placeholder="Driver name" value={form.driver_name} onChange={e=>setForm((f:any)=>({...f,driver_name:e.target.value}))}/></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Driver Contact</label><input placeholder="Phone number" value={form.driver_contact} onChange={e=>setForm((f:any)=>({...f,driver_contact:e.target.value}))}/></div>
                <div className={toStyles.dField}><label>Freight Amount (₹)</label><input type="number" min={0} value={form.freight_amt} onChange={e=>setForm((f:any)=>({...f,freight_amt:e.target.value}))}/></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Dispatch Date *</label><input type="date" value={form.dispatch_date} onChange={e=>setForm((f:any)=>({...f,dispatch_date:e.target.value}))}/></div>
                <div className={toStyles.dField}><label>Expected Delivery *</label><input type="date" value={form.expected_delivery} onChange={e=>setForm((f:any)=>({...f,expected_delivery:e.target.value}))}/></div>
              </div>
              <div className={toStyles.dRow}>
                <div className={toStyles.dField}><label>Actual Delivery</label><input type="date" value={form.actual_delivery} onChange={e=>setForm((f:any)=>({...f,actual_delivery:e.target.value}))}/></div>
                <div className={toStyles.dField}><label>Status</label><select value={form.status} onChange={e=>setForm((f:any)=>({...f,status:e.target.value as TOStatus}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              {/* Consignment Items */}
              <div className={toStyles.sectionLabel}>Consignment Items</div>
              <div className={toStyles.itemsHeader}><span>Description</span><span>Qty</span><span>Packages</span><span>Weight (kg)</span><span/></div>
              {form.items.map((item:TOItem,idx:number)=>(
                <div key={idx} className={toStyles.itemRow}>
                  <input placeholder="Item description" value={item.description} onChange={e=>setItem(idx,'description',e.target.value)}/>
                  <input type="number" min={1} value={item.qty} onChange={e=>setItem(idx,'qty',Number(e.target.value))}/>
                  <input type="number" min={1} value={item.packages} onChange={e=>setItem(idx,'packages',Number(e.target.value))}/>
                  <input type="number" min={0} value={item.weight_kg} onChange={e=>setItem(idx,'weight_kg',Number(e.target.value))}/>
                  <button className={toStyles.removeBtn} onClick={()=>removeItem(idx)} disabled={form.items.length===1}>✕</button>
                </div>
              ))}
              <button className={toStyles.addRowBtn} onClick={addItem}>+ Add Item</button>
              <div className={toStyles.dField}><label>Notes</label><textarea rows={2} value={form.notes} onChange={e=>setForm((f:any)=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className={toStyles.drawerFoot}>
              <button className={toStyles.cancelBtn} onClick={()=>setOpen(false)}>Cancel</button>
              <button className={toStyles.saveBtn} disabled={!canSave} onClick={handleSave}>{editId?'Update':'Create'} Transport Order</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRec && (
        <div className={toStyles.overlay} onClick={()=>setViewId(null)}>
          <div className={toStyles.modal} onClick={e=>e.stopPropagation()}>
            <div className={toStyles.drawerHead}>
              <div>
                <h2>{viewRec.to_no}</h2>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.25rem',flexWrap:'wrap'}}>
                  <span className={toStyles.statusPill} style={{background:STATUS_BG[viewRec.status],color:STATUS_COLOR[viewRec.status]}}>{viewRec.status}</span>
                  <span className={toStyles.modePill} style={{background:`${MODE_COLOR[viewRec.mode]}18`,color:MODE_COLOR[viewRec.mode]}}>{viewRec.mode}</span>
                </div>
              </div>
              <button className={toStyles.closeBtn} onClick={()=>setViewId(null)}>✕</button>
            </div>
            <div className={toStyles.modalBody}>
              <div className={toStyles.metaGrid}>
                <div><p className={toStyles.metaLabel}>Customer</p>    <p className={toStyles.metaVal}>{viewRec.customer}</p></div>
                <div><p className={toStyles.metaLabel}>Transporter</p> <p className={toStyles.metaVal}>{viewRec.transporter}</p></div>
                <div><p className={toStyles.metaLabel}>Vehicle</p>     <p className={toStyles.metaVal}>{viewRec.vehicle_no||'—'}</p></div>
                <div><p className={toStyles.metaLabel}>Driver</p>      <p className={toStyles.metaVal}>{viewRec.driver_name||'—'} {viewRec.driver_contact?`(${viewRec.driver_contact})`:''}</p></div>
                <div><p className={toStyles.metaLabel}>Route</p>       <p className={toStyles.metaVal}>{viewRec.origin} → {viewRec.destination}</p></div>
                <div><p className={toStyles.metaLabel}>SO Ref.</p>     <p className={toStyles.metaVal}>{viewRec.so_ref||'—'}</p></div>
                <div><p className={toStyles.metaLabel}>Dispatch</p>    <p className={toStyles.metaVal}>{viewRec.dispatch_date}</p></div>
                <div><p className={toStyles.metaLabel}>Exp. Delivery</p><p className={toStyles.metaVal}>{viewRec.expected_delivery}</p></div>
                <div><p className={toStyles.metaLabel}>Act. Delivery</p><p className={toStyles.metaVal} style={{color:viewRec.actual_delivery?GREEN:'var(--text-muted)'}}>{viewRec.actual_delivery||'—'}</p></div>
                <div><p className={toStyles.metaLabel}>Freight</p>     <p className={toStyles.metaVal} style={{color:GREEN}}>{fmtCur(viewRec.freight_amt)}</p></div>
              </div>
              <div className={toStyles.sectionLabel} style={{marginTop:'1rem'}}>Consignment</div>
              <table className={toStyles.viewItemTable}>
                <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Packages</th><th>Weight (kg)</th></tr></thead>
                <tbody>{viewRec.items.map((item,i)=>(
                  <tr key={i}><td className={toStyles.muted}>{i+1}</td><td className={toStyles.bold}>{item.description||'—'}</td><td className={toStyles.mono}>{item.qty}</td><td className={toStyles.mono}>{item.packages}</td><td className={toStyles.mono}>{item.weight_kg}</td></tr>
                ))}</tbody>
              </table>
              {viewRec.notes&&<p className={toStyles.viewRemarks}><span>Notes:</span> {viewRec.notes}</p>}
              <div className={toStyles.modalActions}>
                <button className={toStyles.cancelBtn} onClick={()=>setViewId(null)}>Close</button>
                <button className={toStyles.editBtn} onClick={()=>{setViewId(null);openEdit(viewRec)}}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId!==null&&(
        <div className={toStyles.overlay} onClick={()=>setDeleteId(null)}>
          <div className={toStyles.confirmModal} onClick={e=>e.stopPropagation()}>
            <h3>Delete Transport Order?</h3><p>This record will be permanently removed.</p>
            <div className={toStyles.confirmActions}>
              <button className={toStyles.cancelBtn} onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className={toStyles.confirmDelBtn} onClick={()=>{setRecords(rs=>rs.filter(r=>r.id!==deleteId));setDeleteId(null)}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
