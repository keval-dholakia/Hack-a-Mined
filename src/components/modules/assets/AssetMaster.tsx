'use client'

import { useState, useMemo } from 'react'
import styles from './Assets.module.scss'

// ── Pre-defined choices ───────────────────────────────────

const CATEGORIES = [
  'Machinery',
  'Production Equipment',
  'IT Asset',
  'Furniture & Fixtures',
  'Vehicle',
  'Electrical Equipment',
  'Measuring Instrument',
  'Safety Equipment',
]

const LOCATIONS = [
  'Production Floor — Shop 1',
  'Production Floor — Shop 2',
  'Maintenance Bay',
  'Quality Lab',
  'Warehouse / Stores',
  'Admin Office',
  'HR Department',
  'IT Server Room',
  'Gate / Security',
]

const DEPARTMENTS = [
  'Production',
  'Maintenance',
  'Quality',
  'Stores / Warehouse',
  'Administration',
  'HR',
  'IT',
  'Safety',
]

const STATUSES = ['Active', 'Under Maintenance', 'Idle', 'Scrapped', 'Disposed'] as const
type AssetStatus = typeof STATUSES[number]

const CONDITION = ['Excellent', 'Good', 'Fair', 'Poor'] as const
type AssetCondition = typeof CONDITION[number]

interface Asset {
  id: number
  asset_code: string
  name: string
  category: string
  location: string
  department: string
  purchase_date: string
  purchase_cost: number
  current_value: number
  status: AssetStatus
  condition: AssetCondition
  assigned_to: string
  serial_no: string
  warranty_expiry: string
  service_interval_months: number
  last_service_date: string
  notes: string
}

const SEED: Asset[] = [
  {
    id: 1, asset_code: 'AST-001', name: 'CNC Milling Machine',
    category: 'Machinery', location: 'Production Floor — Shop 1',
    department: 'Production', purchase_date: '2021-04-15',
    purchase_cost: 1850000, current_value: 1295000,
    status: 'Active', condition: 'Good',
    assigned_to: 'Arjun Patel', serial_no: 'CMM-XK2100-4512',
    warranty_expiry: '2026-04-14', service_interval_months: 6,
    last_service_date: '2024-01-10', notes: 'German-make. Handles ±0.02mm tolerance.',
  },
  {
    id: 2, asset_code: 'AST-002', name: 'Hydraulic Press (50T)',
    category: 'Production Equipment', location: 'Production Floor — Shop 2',
    department: 'Production', purchase_date: '2019-07-20',
    purchase_cost: 650000, current_value: 325000,
    status: 'Active', condition: 'Fair',
    assigned_to: 'Dev Sharma', serial_no: 'HP50T-IND-7788',
    warranty_expiry: '2022-07-19', service_interval_months: 3,
    last_service_date: '2024-02-05', notes: 'Pressure gauge replaced Feb 2024.',
  },
  {
    id: 3, asset_code: 'AST-003', name: 'MIG Welding Machine',
    category: 'Machinery', location: 'Production Floor — Shop 1',
    department: 'Production', purchase_date: '2022-11-01',
    purchase_cost: 85000, current_value: 65000,
    status: 'Under Maintenance', condition: 'Fair',
    assigned_to: 'Ritu Nair', serial_no: 'MIG-315A-9934',
    warranty_expiry: '2025-10-31', service_interval_months: 12,
    last_service_date: '2024-01-28', notes: 'Wire feeder motor being replaced.',
  },
  {
    id: 4, asset_code: 'AST-004', name: 'Vernier Calliper (Digital 300mm)',
    category: 'Measuring Instrument', location: 'Quality Lab',
    department: 'Quality', purchase_date: '2023-03-10',
    purchase_cost: 12500, current_value: 10200,
    status: 'Active', condition: 'Excellent',
    assigned_to: 'Priya Shah', serial_no: 'VC-300D-LN455',
    warranty_expiry: '2026-03-09', service_interval_months: 12,
    last_service_date: '2024-03-09', notes: 'Calibrated annually. Last cert issued Mar 2024.',
  },
  {
    id: 5, asset_code: 'AST-005', name: 'Forklift — 3T Diesel',
    category: 'Vehicle', location: 'Warehouse / Stores',
    department: 'Stores / Warehouse', purchase_date: '2018-06-12',
    purchase_cost: 920000, current_value: 276000,
    status: 'Active', condition: 'Good',
    assigned_to: 'Suresh Kumar', serial_no: 'FLT-3TD-KION2018',
    warranty_expiry: '2021-06-11', service_interval_months: 3,
    last_service_date: '2024-02-20', notes: 'PUC renewed Feb 2024.',
  },
  {
    id: 6, asset_code: 'AST-006', name: 'Dell PowerEdge R740 Server',
    category: 'IT Asset', location: 'IT Server Room',
    department: 'IT', purchase_date: '2022-08-01',
    purchase_cost: 480000, current_value: 320000,
    status: 'Active', condition: 'Excellent',
    assigned_to: 'IT Team', serial_no: 'DLPE-R740-8XG44',
    warranty_expiry: '2027-07-31', service_interval_months: 12,
    last_service_date: '2024-02-01', notes: 'Running ERP DB + file server.',
  },
]

const EMPTY_FORM = {
  name:                    '',
  category:                '',
  location:                '',
  department:              '',
  purchase_date:           '',
  purchase_cost:           0,
  current_value:           0,
  status:                  'Active' as AssetStatus,
  condition:               'Good'   as AssetCondition,
  assigned_to:             '',
  serial_no:               '',
  warranty_expiry:         '',
  service_interval_months: 12,
  last_service_date:       '',
  notes:                   '',
}

let nextId  = SEED.length + 1
let nextSeq = nextId

function genCode(n: number) { return `AST-${String(n).padStart(3, '0')}` }

const STATUS_STYLE: Record<AssetStatus, string> = {
  'Active':             styles.sActive,
  'Under Maintenance':  styles.sMaintenance,
  'Idle':               styles.sIdle,
  'Scrapped':           styles.sScrapped,
  'Disposed':           styles.sDisposed,
}
const COND_STYLE: Record<AssetCondition, string> = {
  'Excellent': styles.condExcellent,
  'Good':      styles.condGood,
  'Fair':      styles.condFair,
  'Poor':      styles.condPoor,
}

function fmt(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function serviceOverdue(lastDate: string, intervalMonths: number): boolean {
  if (!lastDate || !intervalMonths) return false
  const last = new Date(lastDate)
  const due  = new Date(last)
  due.setMonth(due.getMonth() + intervalMonths)
  return due < new Date()
}

function warrantyExpired(expDate: string): boolean {
  if (!expDate) return false
  return new Date(expDate) < new Date()
}

// ── Component ─────────────────────────────────────────────
export default function AssetMaster() {
  const [assets, setAssets]       = useState<Asset[]>(SEED)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statFilter, setStatFilter] = useState('All')
  const [open, setOpen]           = useState(false)
  const [editId, setEditId]       = useState<number | null>(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [viewAsset, setViewAsset] = useState<Asset | null>(null)

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(a: Asset) {
    setForm({
      name: a.name, category: a.category, location: a.location, department: a.department,
      purchase_date: a.purchase_date, purchase_cost: a.purchase_cost, current_value: a.current_value,
      status: a.status, condition: a.condition, assigned_to: a.assigned_to,
      serial_no: a.serial_no, warranty_expiry: a.warranty_expiry,
      service_interval_months: a.service_interval_months, last_service_date: a.last_service_date,
      notes: a.notes,
    })
    setEditId(a.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    if (editId !== null) {
      setAssets(as => as.map(a => a.id === editId ? { ...a, ...form } : a))
    } else {
      const code = genCode(nextSeq++)
      setAssets(as => [{ id: nextId++, asset_code: code, ...form }, ...as])
    }
    setSaving(false); setOpen(false)
  }

  const filtered = useMemo(() => assets.filter(a => {
    const q = search.toLowerCase()
    return (!q || a.name.toLowerCase().includes(q) || a.asset_code.toLowerCase().includes(q) ||
      a.serial_no.toLowerCase().includes(q) || a.assigned_to.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)) &&
      (catFilter  === 'All' || a.category === catFilter) &&
      (statFilter === 'All' || a.status   === statFilter)
  }), [assets, search, catFilter, statFilter])

  // Stats
  const active     = assets.filter(a => a.status === 'Active').length
  const underMaint = assets.filter(a => a.status === 'Under Maintenance').length
  const overdue    = assets.filter(a => serviceOverdue(a.last_service_date, a.service_interval_months)).length
  const totalValue = assets.reduce((s, a) => s + (a.current_value || 0), 0)

  const canSave = form.name.trim() !== '' && form.category !== '' && form.location !== ''

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Asset Master</h1>
          <p className={styles.subtitle}>{assets.length} assets · Book value {fmtCurrency(totalValue)}</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ Add Asset</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <p className={styles.statVal}>{active}</p>
          <p className={styles.statLabel}>Active Assets</p>
        </div>
        <div className={`${styles.statCard} ${underMaint > 0 ? styles.statAmber : ''}`}>
          <p className={styles.statVal}>{underMaint}</p>
          <p className={styles.statLabel}>Under Maintenance</p>
        </div>
        <div className={`${styles.statCard} ${overdue > 0 ? styles.statRed : ''}`}>
          <p className={styles.statVal}>{overdue}</p>
          <p className={styles.statLabel}>Service Overdue</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{fmtCurrency(totalValue)}</p>
          <p className={styles.statLabel}>Total Book Value</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput}
            placeholder="Search name, code, serial no., assigned to…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={statFilter} onChange={e => setStatFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} asset{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Asset Cards Grid */}
      {filtered.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🏭</span>
            <p>{assets.length === 0 ? 'No assets registered yet.' : 'No assets match your filter.'}</p>
            {assets.length === 0 && <button className={styles.primaryBtn} onClick={openCreate}>Add First Asset</button>}
          </div>
        </div>
      ) : (
        <>
          {/* Asset Card Grid View */}
          <div className={styles.assetGrid}>
            {filtered.map(a => {
              const svcOverdue = serviceOverdue(a.last_service_date, a.service_interval_months)
              const warnExpired = warrantyExpired(a.warranty_expiry)

              return (
                <div key={a.id} className={styles.assetCard}>
                  {/* Card Header */}
                  <div className={styles.assetCardHead}>
                    <div className={styles.assetCardIcon}>
                      {a.category === 'Machinery'             ? '⚙️'  :
                       a.category === 'Production Equipment'  ? '🔩' :
                       a.category === 'IT Asset'              ? '💻' :
                       a.category === 'Vehicle'               ? '🚛' :
                       a.category === 'Measuring Instrument'  ? '📐' :
                       a.category === 'Electrical Equipment'  ? '⚡' :
                       a.category === 'Furniture & Fixtures'  ? '🪑' :
                       '🛡️'}
                    </div>
                    <div className={styles.assetCardMeta}>
                      <span className={styles.assetCode}>{a.asset_code}</span>
                      <span className={`${styles.assetStatus} ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                    </div>
                  </div>

                  {/* Asset Name & Category */}
                  <h3 className={styles.assetName}>{a.name}</h3>
                  <p className={styles.assetCategory}>{a.category}</p>

                  {/* Info rows */}
                  <div className={styles.assetInfoList}>
                    <div className={styles.assetInfoRow}>
                      <span>📍</span><span>{a.location}</span>
                    </div>
                    <div className={styles.assetInfoRow}>
                      <span>👤</span><span>{a.assigned_to || '—'}</span>
                    </div>
                    <div className={styles.assetInfoRow}>
                      <span>💰</span><span>{fmtCurrency(a.current_value)}</span>
                    </div>
                    {a.serial_no && (
                      <div className={styles.assetInfoRow}>
                        <span>🔖</span><span className={styles.monoSmall}>{a.serial_no}</span>
                      </div>
                    )}
                  </div>

                  {/* Condition & Alerts */}
                  <div className={styles.assetCardTags}>
                    <span className={`${styles.condTag} ${COND_STYLE[a.condition]}`}>{a.condition}</span>
                    {svcOverdue  && <span className={styles.alertTag}>⚠ Service Due</span>}
                    {warnExpired && <span className={styles.warnTag}>🔒 Warranty Expired</span>}
                  </div>

                  {/* Footer actions */}
                  <div className={styles.assetCardActions}>
                    <button className={styles.viewBtn} onClick={() => setViewAsset(a)}>View Details</button>
                    <button className={styles.editBtnSm} onClick={() => openEdit(a)}>Edit</button>
                    <button className={styles.deleteBtnSm} onClick={() => setDeleteId(a.id)}>✕</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table View (below cards) */}
          <div className={styles.tableCard}>
            <div className={styles.tableTitle}>All Assets — Tabular View</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Code</th><th>Asset Name</th><th>Category</th>
                    <th>Location</th><th>Assigned To</th>
                    <th>Purchase Cost</th><th>Book Value</th>
                    <th className={styles.center}>Condition</th>
                    <th className={styles.center}>Status</th>
                    <th>Last Service</th>
                    <th className={styles.center}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td className={styles.mono}>{a.asset_code}</td>
                      <td className={styles.assetNameCell}>{a.name}</td>
                      <td className={styles.catCell}>{a.category}</td>
                      <td className={styles.locCell}>{a.location}</td>
                      <td className={styles.assigneeCell}>{a.assigned_to || '—'}</td>
                      <td className={styles.mono}>{fmtCurrency(a.purchase_cost)}</td>
                      <td className={styles.mono}>{fmtCurrency(a.current_value)}</td>
                      <td className={styles.center}>
                        <span className={`${styles.condTag} ${COND_STYLE[a.condition]}`}>{a.condition}</span>
                      </td>
                      <td className={styles.center}>
                        <span className={`${styles.assetStatus} ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                      </td>
                      <td className={`${styles.mono} ${serviceOverdue(a.last_service_date, a.service_interval_months) ? styles.overdueText : ''}`}>
                        {fmt(a.last_service_date)}
                        {serviceOverdue(a.last_service_date, a.service_interval_months) && ' ⚠'}
                      </td>
                      <td className={styles.center}>
                        <div className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => openEdit(a)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(a.id)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      {viewAsset && (
        <div className={styles.modalOverlay} onClick={() => setViewAsset(null)}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.assetCode}>{viewAsset.asset_code}</span>
                <h2 className={styles.detailTitle}>{viewAsset.name}</h2>
                <p className={styles.detailCat}>{viewAsset.category} · {viewAsset.department}</p>
              </div>
              <button className={styles.drawerClose} onClick={() => setViewAsset(null)}>✕</button>
            </div>
            <div className={styles.detailGrid}>
              {[
                ['Location',         viewAsset.location],
                ['Assigned To',      viewAsset.assigned_to || '—'],
                ['Serial No.',        viewAsset.serial_no || '—'],
                ['Status',           viewAsset.status],
                ['Condition',        viewAsset.condition],
                ['Purchase Date',    fmt(viewAsset.purchase_date)],
                ['Purchase Cost',    fmtCurrency(viewAsset.purchase_cost)],
                ['Current Value',    fmtCurrency(viewAsset.current_value)],
                ['Warranty Expiry',  fmt(viewAsset.warranty_expiry)],
                ['Service Every',    `${viewAsset.service_interval_months} month(s)`],
                ['Last Service',     fmt(viewAsset.last_service_date)],
              ].map(([label, val]) => (
                <div key={label as string} className={styles.detailItem}>
                  <span className={styles.detailLabel}>{label}</span>
                  <span className={styles.detailVal}>{val}</span>
                </div>
              ))}
              {viewAsset.notes && (
                <div className={`${styles.detailItem} ${styles.detailSpan2}`}>
                  <span className={styles.detailLabel}>Notes</span>
                  <span className={styles.detailVal}>{viewAsset.notes}</span>
                </div>
              )}
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setViewAsset(null)}>Close</button>
              <button className={styles.primaryBtn} onClick={() => { setViewAsset(null); openEdit(viewAsset) }}>Edit Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer ── */}
      {open && (
        <div className={styles.drawerOverlay} onClick={() => setOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h2>{editId !== null ? 'Edit Asset' : 'Add New Asset'}</h2>
                {editId === null && <p style={{ fontSize:'0.74rem', color:'var(--text-muted)', marginTop:'2px' }}>Code will be auto-assigned</p>}
              </div>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerBody}>

              <p className={styles.dSectionLabel}>Basic Information</p>

              <div className={styles.dField}>
                <label>Asset Name *</label>
                <input value={form.name} placeholder="e.g. CNC Milling Machine"
                  onChange={e => set('name', e.target.value)} />
              </div>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value as any)}>
                    <option value="" disabled>— select —</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={styles.dField}>
                  <label>Serial No.</label>
                  <input value={form.serial_no} placeholder="manufacturer serial"
                    onChange={e => set('serial_no', e.target.value as any)} />
                </div>
              </div>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Location *</label>
                  <select value={form.location} onChange={e => set('location', e.target.value as any)}>
                    <option value="" disabled>— select —</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className={styles.dField}>
                  <label>Department</label>
                  <select value={form.department} onChange={e => set('department', e.target.value as any)}>
                    <option value="" disabled>— select —</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.dField}>
                <label>Assigned To</label>
                <input value={form.assigned_to} placeholder="person or team name"
                  onChange={e => set('assigned_to', e.target.value as any)} />
              </div>

              <p className={styles.dSectionLabel}>Financial Details</p>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Purchase Date</label>
                  <input type="date" value={form.purchase_date}
                    onChange={e => set('purchase_date', e.target.value as any)} />
                </div>
                <div className={styles.dField}>
                  <label>Purchase Cost (₹)</label>
                  <input type="number" min={0} value={form.purchase_cost || ''}
                    placeholder="e.g. 850000"
                    onChange={e => set('purchase_cost', Number(e.target.value) as any)} />
                </div>
              </div>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Current Book Value (₹)</label>
                  <input type="number" min={0} value={form.current_value || ''}
                    placeholder="after depreciation"
                    onChange={e => set('current_value', Number(e.target.value) as any)} />
                </div>
                <div className={styles.dField}>
                  <label>Warranty Expiry</label>
                  <input type="date" value={form.warranty_expiry}
                    onChange={e => set('warranty_expiry', e.target.value as any)} />
                </div>
              </div>

              <p className={styles.dSectionLabel}>Condition & Maintenance</p>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.dField}>
                  <label>Condition</label>
                  <select value={form.condition} onChange={e => set('condition', e.target.value as any)}>
                    {CONDITION.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Service Interval (months)</label>
                  <input type="number" min={1} value={form.service_interval_months}
                    onChange={e => set('service_interval_months', Number(e.target.value) as any)} />
                </div>
                <div className={styles.dField}>
                  <label>Last Service Date</label>
                  <input type="date" value={form.last_service_date}
                    onChange={e => set('last_service_date', e.target.value as any)} />
                </div>
              </div>

              <div className={styles.dField}>
                <label>Notes</label>
                <textarea rows={3} value={form.notes}
                  placeholder="Additional details, maintenance history, remarks…"
                  onChange={e => set('notes', e.target.value as any)}
                  className={styles.textarea}
                />
              </div>

            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update Asset' : 'Add Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Asset?</h3>
            <p>This asset record will be permanently removed from the register.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn}
                onClick={() => { setAssets(as => as.filter(a => a.id !== deleteId)); setDeleteId(null) }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
