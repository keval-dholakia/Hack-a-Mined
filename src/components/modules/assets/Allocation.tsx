'use client'

import { useState, useMemo } from 'react'
import styles from './Assets.module.scss'
import allocStyles from './Allocation.module.scss'

// ── Pre-defined choices ───────────────────────────────────
const ASSETS = [
  { id: 1, code: 'AST-001', name: 'CNC Milling Machine',        category: 'Machinery'            },
  { id: 2, code: 'AST-002', name: 'Hydraulic Press (50T)',       category: 'Production Equipment' },
  { id: 3, code: 'AST-003', name: 'MIG Welding Machine',         category: 'Machinery'            },
  { id: 4, code: 'AST-004', name: 'Vernier Calliper (Digital)',  category: 'Measuring Instrument' },
  { id: 5, code: 'AST-005', name: 'Forklift — 3T Diesel',        category: 'Vehicle'              },
  { id: 6, code: 'AST-006', name: 'Dell PowerEdge R740 Server',  category: 'IT Asset'             },
]

const EMPLOYEES = [
  { id: 1, name: 'Arjun Patel',   dept: 'Production'  },
  { id: 2, name: 'Dev Sharma',    dept: 'Production'  },
  { id: 3, name: 'Ritu Nair',     dept: 'Production'  },
  { id: 4, name: 'Priya Shah',    dept: 'Quality'     },
  { id: 5, name: 'Raj Mehta',     dept: 'Admin'       },
  { id: 6, name: 'Suresh Kumar',  dept: 'Stores'      },
  { id: 7, name: 'IT Team',       dept: 'IT'          },
]

const LOCATIONS = [
  'Production Floor — Shop 1',
  'Production Floor — Shop 2',
  'Maintenance Bay',
  'Quality Lab',
  'Warehouse / Stores',
  'Admin Office',
  'IT Server Room',
]

const ALLOC_STATUSES = ['Allocated', 'Returned', 'Transferred'] as const
type AllocStatus = typeof ALLOC_STATUSES[number]

interface AllocationRecord {
  id: number
  alloc_no: string
  asset_id: number
  asset_code: string
  asset_name: string
  asset_category: string
  allocated_to_id: number
  allocated_to: string
  department: string
  location: string
  alloc_date: string
  expected_return: string
  actual_return: string
  status: AllocStatus
  purpose: string
  remarks: string
}

function genAllocNo(n: number) { return `ALLOC-${String(n).padStart(4, '0')}` }

const SEED: AllocationRecord[] = [
  {
    id: 1, alloc_no: 'ALLOC-0001',
    asset_id: 1, asset_code: 'AST-001', asset_name: 'CNC Milling Machine', asset_category: 'Machinery',
    allocated_to_id: 1, allocated_to: 'Arjun Patel', department: 'Production',
    location: 'Production Floor — Shop 1',
    alloc_date: '2024-01-10', expected_return: '', actual_return: '',
    status: 'Allocated', purpose: 'Permanent assignment — production operations',
    remarks: 'Operator trained and certified.',
  },
  {
    id: 2, alloc_no: 'ALLOC-0002',
    asset_id: 2, asset_code: 'AST-002', asset_name: 'Hydraulic Press (50T)', asset_category: 'Production Equipment',
    allocated_to_id: 2, allocated_to: 'Dev Sharma', department: 'Production',
    location: 'Production Floor — Shop 2',
    alloc_date: '2024-01-12', expected_return: '', actual_return: '',
    status: 'Allocated', purpose: 'Permanent assignment — forming operations',
    remarks: '',
  },
  {
    id: 3, alloc_no: 'ALLOC-0003',
    asset_id: 4, asset_code: 'AST-004', asset_name: 'Vernier Calliper (Digital)', asset_category: 'Measuring Instrument',
    allocated_to_id: 4, allocated_to: 'Priya Shah', department: 'Quality',
    location: 'Quality Lab',
    alloc_date: '2024-02-01', expected_return: '2024-08-01', actual_return: '',
    status: 'Allocated', purpose: 'IQC and in-process dimensional inspection',
    remarks: 'Calibration due Mar 2025.',
  },
  {
    id: 4, alloc_no: 'ALLOC-0004',
    asset_id: 5, asset_code: 'AST-005', asset_name: 'Forklift — 3T Diesel', asset_category: 'Vehicle',
    allocated_to_id: 6, allocated_to: 'Suresh Kumar', department: 'Stores',
    location: 'Warehouse / Stores',
    alloc_date: '2023-07-01', expected_return: '', actual_return: '',
    status: 'Allocated', purpose: 'Material handling in warehouse',
    remarks: 'PUC renewed Feb 2024.',
  },
  {
    id: 5, alloc_no: 'ALLOC-0005',
    asset_id: 3, asset_code: 'AST-003', asset_name: 'MIG Welding Machine', asset_category: 'Machinery',
    allocated_to_id: 3, allocated_to: 'Ritu Nair', department: 'Production',
    location: 'Maintenance Bay',
    alloc_date: '2024-03-01', expected_return: '2024-03-20', actual_return: '2024-03-18',
    status: 'Returned', purpose: 'Transferred to maintenance bay for wire feeder repair',
    remarks: 'Returned after repair. Back to Shop 1.',
  },
]

const EMPTY_FORM = {
  asset_id:        0,
  allocated_to_id: 0,
  location:        '',
  alloc_date:      new Date().toISOString().split('T')[0],
  expected_return: '',
  actual_return:   '',
  status:          'Allocated' as AllocStatus,
  purpose:         '',
  remarks:         '',
}

let nextId  = SEED.length + 1
let nextSeq = nextId

const STATUS_STYLE: Record<AllocStatus, string> = {
  'Allocated':   allocStyles.statusAllocated,
  'Returned':    allocStyles.statusReturned,
  'Transferred': allocStyles.statusTransferred,
}

const CAT_ICON: Record<string, string> = {
  'Machinery':            '⚙️',
  'Production Equipment': '🔩',
  'IT Asset':             '💻',
  'Vehicle':              '🚛',
  'Measuring Instrument': '📐',
  'Electrical Equipment': '⚡',
  'Furniture & Fixtures': '🪑',
  'Safety Equipment':     '🛡️',
}

function fmt(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Allocation() {
  const [records, setRecords]   = useState<AllocationRecord[]>(SEED)
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('All')
  const [assetF, setAssetF]     = useState('All')
  const [open, setOpen]         = useState(false)
  const [editId, setEditId]     = useState<number | null>(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const selectedAsset    = ASSETS.find(a => a.id === form.asset_id)
  const selectedEmployee = EMPLOYEES.find(e => e.id === form.allocated_to_id)

  // Stats
  const allocated   = records.filter(r => r.status === 'Allocated').length
  const returned    = records.filter(r => r.status === 'Returned').length
  const transferred = records.filter(r => r.status === 'Transferred').length
  // Assets with no active allocation
  const allocatedAssetIds = new Set(records.filter(r => r.status === 'Allocated').map(r => r.asset_id))
  const unallocated = ASSETS.filter(a => !allocatedAssetIds.has(a.id)).length

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase()
    return (!q || r.alloc_no.toLowerCase().includes(q) ||
      r.asset_name.toLowerCase().includes(q) || r.asset_code.toLowerCase().includes(q) ||
      r.allocated_to.toLowerCase().includes(q) || r.department.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)) &&
      (statusF === 'All' || r.status === statusF) &&
      (assetF  === 'All' || r.asset_code === assetF)
  }), [records, search, statusF, assetF])

  function set<K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleAssetChange(assetId: number) {
    setForm(f => ({ ...f, asset_id: assetId }))
  }

  function handleEmployeeChange(empId: number) {
    const emp = EMPLOYEES.find(e => e.id === empId)
    setForm(f => ({ ...f, allocated_to_id: empId, location: f.location }))
  }

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  function openEdit(r: AllocationRecord) {
    setForm({
      asset_id: r.asset_id, allocated_to_id: r.allocated_to_id,
      location: r.location, alloc_date: r.alloc_date,
      expected_return: r.expected_return, actual_return: r.actual_return,
      status: r.status, purpose: r.purpose, remarks: r.remarks,
    })
    setEditId(r.id); setOpen(true)
  }

  function handleSave() {
    setSaving(true)
    const asset = ASSETS.find(a => a.id === form.asset_id)!
    const emp   = EMPLOYEES.find(e => e.id === form.allocated_to_id)!

    if (editId !== null) {
      setRecords(rs => rs.map(r => r.id === editId ? {
        ...r,
        asset_id: asset.id, asset_code: asset.code, asset_name: asset.name, asset_category: asset.category,
        allocated_to_id: emp.id, allocated_to: emp.name, department: emp.dept,
        location: form.location, alloc_date: form.alloc_date,
        expected_return: form.expected_return, actual_return: form.actual_return,
        status: form.status, purpose: form.purpose, remarks: form.remarks,
      } : r))
    } else {
      const rec: AllocationRecord = {
        id: nextId, alloc_no: genAllocNo(nextSeq++),
        asset_id: asset.id, asset_code: asset.code, asset_name: asset.name, asset_category: asset.category,
        allocated_to_id: emp.id, allocated_to: emp.name, department: emp.dept,
        location: form.location, alloc_date: form.alloc_date,
        expected_return: form.expected_return, actual_return: form.actual_return,
        status: form.status, purpose: form.purpose, remarks: form.remarks,
      }
      nextId++
      setRecords(rs => [rec, ...rs])
    }
    setSaving(false); setOpen(false)
  }

  const canSave = form.asset_id > 0 && form.allocated_to_id > 0 && form.location !== '' && form.alloc_date !== ''

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Asset Allocation</h1>
          <p className={styles.subtitle}>Track who has what — assign, transfer, and return company assets</p>
        </div>
        <button className={styles.primaryBtn} onClick={openCreate}>+ New Allocation</button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <p className={styles.statVal}>{allocated}</p>
          <p className={styles.statLabel}>Currently Allocated</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{returned}</p>
          <p className={styles.statLabel}>Returned</p>
        </div>
        <div className={`${styles.statCard} ${styles.statAmber}`}>
          <p className={styles.statVal}>{transferred}</p>
          <p className={styles.statLabel}>Transferred</p>
        </div>
        <div className={`${styles.statCard} ${unallocated > 0 ? styles.statRed : ''}`}>
          <p className={styles.statVal}>{unallocated}</p>
          <p className={styles.statLabel}>Unallocated Assets</p>
        </div>
      </div>

      {/* Unallocated Assets Banner */}
      {unallocated > 0 && (
        <div className={allocStyles.unallocBanner}>
          <span className={allocStyles.unallocIcon}>📦</span>
          <div>
            <p className={allocStyles.unallocTitle}>Unallocated Assets</p>
            <p className={allocStyles.unallocList}>
              {ASSETS.filter(a => !allocatedAssetIds.has(a.id)).map(a => `${a.code} — ${a.name}`).join('  ·  ')}
            </p>
          </div>
          <button className={styles.primaryBtn} style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={openCreate}>
            Allocate Now
          </button>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput}
            placeholder="Search alloc no., asset, employee, location…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={assetF} onChange={e => setAssetF(e.target.value)}>
          <option value="All">All Assets</option>
          {ASSETS.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="All">All Statuses</option>
          {ALLOC_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Allocation Cards */}
      {filtered.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>{records.length === 0 ? 'No allocations yet.' : 'No records match your filter.'}</p>
          </div>
        </div>
      ) : (
        <>
          <div className={allocStyles.allocGrid}>
            {filtered.map(r => (
              <div key={r.id} className={`${allocStyles.allocCard} ${r.status === 'Returned' ? allocStyles.allocCardReturned : ''}`}>

                {/* Card top: asset info */}
                <div className={allocStyles.allocCardTop}>
                  <span className={allocStyles.allocIcon}>{CAT_ICON[r.asset_category] ?? '🏭'}</span>
                  <div className={allocStyles.allocAssetInfo}>
                    <span className={styles.assetCode}>{r.asset_code}</span>
                    <span className={allocStyles.allocAssetName}>{r.asset_name}</span>
                    <span className={allocStyles.allocCategory}>{r.asset_category}</span>
                  </div>
                  <span className={`${allocStyles.allocStatusBadge} ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                </div>

                {/* Divider */}
                <div className={allocStyles.allocDivider} />

                {/* Assigned to */}
                <div className={allocStyles.allocTo}>
                  <span className={allocStyles.allocToIcon}>👤</span>
                  <div>
                    <p className={allocStyles.allocToName}>{r.allocated_to}</p>
                    <p className={allocStyles.allocToDept}>{r.department} · {r.location}</p>
                  </div>
                </div>

                {/* Dates row */}
                <div className={allocStyles.allocDates}>
                  <div className={allocStyles.allocDateItem}>
                    <span className={allocStyles.allocDateLabel}>Allocated</span>
                    <span className={allocStyles.allocDateVal}>{fmt(r.alloc_date)}</span>
                  </div>
                  {r.expected_return && (
                    <div className={allocStyles.allocDateItem}>
                      <span className={allocStyles.allocDateLabel}>Expected Return</span>
                      <span className={allocStyles.allocDateVal}>{fmt(r.expected_return)}</span>
                    </div>
                  )}
                  {r.actual_return && (
                    <div className={allocStyles.allocDateItem}>
                      <span className={allocStyles.allocDateLabel}>Returned On</span>
                      <span className={allocStyles.allocDateVal}>{fmt(r.actual_return)}</span>
                    </div>
                  )}
                </div>

                {/* Purpose */}
                {r.purpose && <p className={allocStyles.allocPurpose}>{r.purpose}</p>}

                {/* Footer */}
                <div className={allocStyles.allocCardFooter}>
                  <span className={allocStyles.allocNo}>{r.alloc_no}</span>
                  <div className={styles.actions}>
                    <button className={styles.editBtnSm} onClick={() => openEdit(r)}>Edit</button>
                    <button className={styles.deleteBtnSm} onClick={() => setDeleteId(r.id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table View */}
          <div className={styles.tableCard}>
            <div className={styles.tableTitle}>Allocation Register — Tabular View</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Alloc No.</th><th>Asset</th><th>Allocated To</th>
                    <th>Department</th><th>Location</th>
                    <th>Alloc Date</th><th>Exp. Return</th><th>Actual Return</th>
                    <th className={styles.center}>Status</th>
                    <th className={styles.center}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td className={styles.mono}>{r.alloc_no}</td>
                      <td>
                        <span className={styles.assetCode} style={{ display:'block' }}>{r.asset_code}</span>
                        <span style={{ fontSize:'0.8rem', fontWeight:500 }}>{r.asset_name}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.allocated_to}</td>
                      <td className={styles.catCell}>{r.department}</td>
                      <td className={styles.locCell}>{r.location}</td>
                      <td className={styles.mono}>{fmt(r.alloc_date)}</td>
                      <td className={styles.mono}>{r.expected_return ? fmt(r.expected_return) : '—'}</td>
                      <td className={styles.mono}>{r.actual_return ? fmt(r.actual_return) : '—'}</td>
                      <td className={styles.center}>
                        <span className={`${allocStyles.allocStatusBadge} ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                      </td>
                      <td className={styles.center}>
                        <div className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => openEdit(r)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteId(r.id)}>✕</button>
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

      {/* ── Drawer ── */}
      {open && (
        <div className={styles.drawerOverlay} onClick={() => setOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h2>{editId !== null ? 'Edit Allocation' : 'New Asset Allocation'}</h2>
                {editId === null && <p style={{ fontSize:'0.74rem', color:'var(--text-muted)', marginTop:'2px' }}>Alloc no. will be auto-generated</p>}
              </div>
              <button className={styles.drawerClose} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerBody}>

              <p className={styles.dSectionLabel}>Asset & Recipient</p>

              <div className={styles.dField}>
                <label>Select Asset *</label>
                <select value={form.asset_id} onChange={e => handleAssetChange(Number(e.target.value))}>
                  <option value={0} disabled>— select asset —</option>
                  {ASSETS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name} ({a.category})
                      {allocatedAssetIds.has(a.id) ? ' [Currently Allocated]' : ' ✓ Available'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAsset && (
                <div className={allocStyles.assetPreviewCard}>
                  <span style={{ fontSize:'1.4rem' }}>{CAT_ICON[selectedAsset.category] ?? '🏭'}</span>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.85rem' }}>{selectedAsset.name}</p>
                    <p style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{selectedAsset.code} · {selectedAsset.category}</p>
                  </div>
                </div>
              )}

              <div className={styles.dField}>
                <label>Allocate To *</label>
                <select value={form.allocated_to_id} onChange={e => handleEmployeeChange(Number(e.target.value))}>
                  <option value={0} disabled>— select employee / team —</option>
                  {EMPLOYEES.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>
                  ))}
                </select>
                {selectedEmployee && (
                  <span className={styles.dHint ?? allocStyles.hint}>Department: {selectedEmployee.dept}</span>
                )}
              </div>

              <div className={styles.dField}>
                <label>Location *</label>
                <select value={form.location} onChange={e => set('location', e.target.value as any)}>
                  <option value="" disabled>— select location —</option>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <p className={styles.dSectionLabel}>Dates & Status</p>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Allocation Date *</label>
                  <input type="date" value={form.alloc_date}
                    onChange={e => set('alloc_date', e.target.value as any)} />
                </div>
                <div className={styles.dField}>
                  <label>Expected Return</label>
                  <input type="date" value={form.expected_return}
                    onChange={e => set('expected_return', e.target.value as any)} />
                  <span className={allocStyles.hint}>Leave blank for permanent</span>
                </div>
              </div>

              <div className={styles.dRow}>
                <div className={styles.dField}>
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)}>
                    {ALLOC_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className={styles.dField}>
                  <label>Actual Return Date</label>
                  <input type="date" value={form.actual_return}
                    onChange={e => set('actual_return', e.target.value as any)}
                    disabled={form.status === 'Allocated'} />
                  {form.status === 'Allocated' && <span className={allocStyles.hint}>Fill when asset is returned</span>}
                </div>
              </div>

              <p className={styles.dSectionLabel}>Purpose & Remarks</p>

              <div className={styles.dField}>
                <label>Purpose of Allocation</label>
                <input value={form.purpose} placeholder="e.g. Permanent assignment — production operations"
                  onChange={e => set('purpose', e.target.value as any)} />
              </div>

              <div className={styles.dField}>
                <label>Remarks</label>
                <textarea rows={2} value={form.remarks}
                  placeholder="Any additional notes…"
                  onChange={e => set('remarks', e.target.value as any)}
                  className={styles.textarea} />
              </div>

            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} disabled={saving || !canSave} onClick={handleSave}>
                {saving ? 'Saving…' : editId !== null ? 'Update Allocation' : 'Save Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Allocation Record?</h3>
            <p>This record will be permanently removed from the allocation register.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn}
                onClick={() => { setRecords(rs => rs.filter(r => r.id !== deleteId)); setDeleteId(null) }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
