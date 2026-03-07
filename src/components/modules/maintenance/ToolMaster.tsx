'use client'

import type { Tool, ToolFormData } from '@/types/maintenance'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import styles from './ToolMaster.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

// ── MOCK DATA ─────────────────────────────────────────────
const SEED_TOOLS: Tool[] = [
  {
    id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper',
    category: 'Measuring', make: 'Mitutoyo', model: '530-312',
    serial_number: 'MTV-2021-001', location: 'QC Lab', purchase_date: '2021-04-10',
    purchase_cost: 4500, condition: 'Good', is_active: 1,
    remarks: 'Calibrated annually', created_at: '2021-04-10T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2, tool_code: 'TL-002', tool_name: 'Drill Press',
    category: 'Machine', make: 'Bosch', model: 'PBD-40',
    serial_number: 'BSH-2020-044', location: 'Machine Shop', purchase_date: '2020-06-15',
    purchase_cost: 28000, condition: 'Good', is_active: 1,
    remarks: null, created_at: '2020-06-15T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench',
    category: 'Hand Tool', make: 'Stanley', model: 'STMT74884',
    serial_number: null, location: 'Assembly Bay', purchase_date: '2022-09-01',
    purchase_cost: 3200, condition: 'Fair', is_active: 1,
    remarks: 'Slight wear on handle', created_at: '2022-09-01T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder',
    category: 'Machine', make: 'Makita', model: 'GA4530',
    serial_number: 'MKT-2019-221', location: 'Fabrication', purchase_date: '2019-03-22',
    purchase_cost: 7800, condition: 'Needs Repair', is_active: 1,
    remarks: 'Disc guard cracked — needs replacement', created_at: '2019-03-22T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set',
    category: 'Measuring', make: 'Mitutoyo', model: '293-Series',
    serial_number: 'MTV-2022-008', location: 'QC Lab', purchase_date: '2022-01-15',
    purchase_cost: 12500, condition: 'Good', is_active: 1,
    remarks: null, created_at: '2022-01-15T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 6, tool_code: 'TL-006', tool_name: 'MIG Welder',
    category: 'Machine', make: 'Lincoln Electric', model: 'POWER MIG 210',
    serial_number: 'LNE-2018-102', location: 'Welding Section', purchase_date: '2018-11-05',
    purchase_cost: 45000, condition: 'Good', is_active: 0,
    remarks: 'Decommissioned — awaiting replacement', created_at: '2018-11-05T10:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
]

const CATEGORIES = ['Measuring', 'Machine', 'Hand Tool', 'Jig', 'Fixture', 'Electrical', 'Other']
const CONDITIONS = ['Good', 'Fair', 'Needs Repair', 'Scrapped']

const EMPTY_FORM: ToolFormData = {
  tool_code: '', tool_name: '', category: 'Measuring',
  make: '', model: '', serial_number: '', location: '',
  purchase_date: '', purchase_cost: null, condition: 'Good', remarks: '',
}

const CONDITION_VARIANT: Record<string, string> = {
  'Good': styles.condGood,
  'Fair': styles.condFair,
  'Needs Repair': styles.condRepair,
  'Scrapped': styles.condScrapped,
}

function nextCode(tools: Tool[]): string {
  const nums = tools.map(t => parseInt(t.tool_code.replace('TL-', ''), 10)).filter(Boolean)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `TL-${String(next).padStart(3, '0')}`
}

export default function ToolMaster() {
  const [tools, setTools] = useState<Tool[]>(SEED_TOOLS)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [condFilter, setCondFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<ToolFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // ── Filtered list ──────────────────────────
  const filtered = useMemo(() => tools.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.tool_name.toLowerCase().includes(q) ||
      t.tool_code.toLowerCase().includes(q) ||
      (t.make?.toLowerCase().includes(q) ?? false) ||
      (t.location?.toLowerCase().includes(q) ?? false)
    const matchCat = catFilter === 'All' || t.category === catFilter
    const matchCond = condFilter === 'All' || t.condition === condFilter
    const matchStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' && t.is_active === 1) ||
      (statusFilter === 'Inactive' && t.is_active === 0)
    return matchSearch && matchCat && matchCond && matchStatus
  }), [tools, search, catFilter, condFilter, statusFilter])

  // ── Stats ──────────────────────────────────
  const stats = useMemo(() => ({
    total: tools.length,
    active: tools.filter(t => t.is_active === 1).length,
    needsRepair: tools.filter(t => t.condition === 'Needs Repair').length,
    totalValue: tools.reduce((s, t) => s + (t.purchase_cost ?? 0), 0),
  }), [tools])

  // ── Drawer helpers ─────────────────────────
  function openCreate() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, tool_code: nextCode(tools) })
    setDrawerOpen(true)
  }

  function openEdit(tool: Tool) {
    setEditId(tool.id)
    setForm({
      tool_code: tool.tool_code, tool_name: tool.tool_name,
      category: tool.category, make: tool.make ?? '',
      model: tool.model ?? '', serial_number: tool.serial_number ?? '',
      location: tool.location ?? '', purchase_date: tool.purchase_date ?? '',
      purchase_cost: tool.purchase_cost, condition: tool.condition,
      remarks: tool.remarks ?? '',
    })
    setDrawerOpen(true)
  }

  function closeDrawer() { setDrawerOpen(false); setEditId(null) }

  function handleField(key: keyof ToolFormData, val: string | number | null) {
    setForm((f: ToolFormData) => ({ ...f, [key]: val }))
  }

  function handleSave() {
    if (!form.tool_code || !form.tool_name) return
    setSaving(true)
    setTimeout(() => {
      if (editId !== null) {
        setTools(prev => prev.map(t =>
          t.id === editId
            ? { ...t, ...form, updated_at: new Date().toISOString() }
            : t
        ))
      } else {
        const newTool: Tool = {
          ...form,
          id: Date.now(),
          is_active: 1,
          make: form.make || null, model: form.model || null,
          serial_number: form.serial_number || null,
          location: form.location || null,
          purchase_date: form.purchase_date || null,
          remarks: form.remarks || null,
          purchase_cost: form.purchase_cost ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTools(prev => [newTool, ...prev])
      }
      setSaving(false)
      closeDrawer()
    }, 400)
  }

  function handleToggle(id: number) {
    setTools(prev => prev.map(t =>
      t.id === id ? { ...t, is_active: t.is_active === 1 ? 0 : 1 } : t
    ))
  }

  function handleDelete(id: number) {
    setTools(prev => prev.filter(t => t.id !== id))
    setDeleteConfirm(null)
  }

  const router = useRouter()

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tool Master</h1>
          <p className={styles.subtitle}>{stats.total} tools · {stats.active} active</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Tool Master Directory',
            subtitle: `${filtered.length} tools`,
            columns: [
              { header: 'Code', dataKey: 'tool_code' },
              { header: 'Tool Name', dataKey: 'tool_name' },
              { header: 'Category', dataKey: 'category' },
              { header: 'Location', dataKey: 'location' },
              { header: 'Condition', dataKey: 'condition' },
              { header: 'Value', dataKey: 'purchase_cost', format: 'currency', align: 'right' },
              { header: 'Status', dataKey: 'is_active' },
            ],
            rows: filtered.map(t => ({
              ...t,
              location: t.location || '—',
              purchase_cost: Number(t.purchase_cost) || 0,
              is_active: t.is_active === 1 ? 'Active' : 'Inactive'
            })),
            fileName: 'Tool_Master_Directory'
          })} />
          <button className={styles.ghostBtn} onClick={() => router.push('/dashboard/maintenance/tool-master/analytics')}>
            ◎ Analytics
          </button>
          <button className={styles.addBtn} onClick={openCreate}>
            <span>+</span> New Tool
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{stats.total}</p>
          <p className={styles.statLabel}>Total Tools</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{stats.active}</p>
          <p className={styles.statLabel}>Active</p>
        </div>
        <div className={`${styles.statCard} ${stats.needsRepair > 0 ? styles.statWarn : ''}`}>
          <p className={styles.statVal}>{stats.needsRepair}</p>
          <p className={styles.statLabel}>Need Repair</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>₹{stats.totalValue.toLocaleString('en-IN')}</p>
          <p className={styles.statLabel}>Total Value</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search by name, code, make or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={condFilter} onChange={e => setCondFilter(e.target.value)}>
          <option value="All">All Conditions</option>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔧</span>
            <p>No tools found</p>
            <button className={styles.addBtn} onClick={openCreate}>Add First Tool</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Tool Name</th>
                  <th>Category</th>
                  <th>Make / Model</th>
                  <th>Location</th>
                  <th className={styles.center}>Condition</th>
                  <th className={styles.center}>Status</th>
                  <th className={styles.right}>Value</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tool => (
                  <tr key={tool.id} className={tool.is_active === 0 ? styles.rowInactive : ''}>
                    <td className={styles.mono}>{tool.tool_code}</td>
                    <td>
                      <span className={styles.toolName}>{tool.tool_name}</span>
                      {tool.serial_number && (
                        <span className={styles.serial}>S/N: {tool.serial_number}</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.catBadge}>{tool.category}</span>
                    </td>
                    <td className={styles.makeModel}>
                      {tool.make && <span>{tool.make}</span>}
                      {tool.model && <span className={styles.model}>{tool.model}</span>}
                      {!tool.make && !tool.model && <span className={styles.na}>—</span>}
                    </td>
                    <td>{tool.location ?? <span className={styles.na}>—</span>}</td>
                    <td className={styles.center}>
                      <span className={`${styles.condBadge} ${CONDITION_VARIANT[tool.condition] ?? ''}`}>
                        {tool.condition}
                      </span>
                    </td>
                    <td className={styles.center}>
                      <span className={tool.is_active === 1 ? styles.statusActive : styles.statusInactive}>
                        {tool.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={styles.right}>
                      {tool.purchase_cost
                        ? <span className={styles.mono}>₹{tool.purchase_cost.toLocaleString('en-IN')}</span>
                        : <span className={styles.na}>—</span>}
                    </td>
                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => openEdit(tool)}>Edit</button>
                        <button className={styles.toggleBtn} onClick={() => handleToggle(tool.id)}>
                          {tool.is_active === 1 ? 'Disable' : 'Enable'}
                        </button>
                        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(tool.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      {deleteConfirm !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Tool?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer Overlay ── */}
      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={closeDrawer} />
      )}

      {/* ── Drawer ── */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>{editId ? 'Edit Tool' : 'New Tool'}</h2>
          <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          {/* Section: Identity */}
          <p className={styles.sectionLabel}>Identity</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Tool Code <span className={styles.req}>*</span></label>
              <input value={form.tool_code} onChange={e => handleField('tool_code', e.target.value)} placeholder="TL-001" />
            </div>
            <div className={styles.field}>
              <label>Category <span className={styles.req}>*</span></label>
              <select value={form.category} onChange={e => handleField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Tool Name <span className={styles.req}>*</span></label>
              <input value={form.tool_name} onChange={e => handleField('tool_name', e.target.value)} placeholder="e.g. Vernier Caliper" />
            </div>
          </div>

          {/* Section: Details */}
          <p className={styles.sectionLabel}>Details</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Make / Brand</label>
              <input value={form.make ?? ''} onChange={e => handleField('make', e.target.value)} placeholder="e.g. Mitutoyo" />
            </div>
            <div className={styles.field}>
              <label>Model</label>
              <input value={form.model ?? ''} onChange={e => handleField('model', e.target.value)} placeholder="e.g. 530-312" />
            </div>
            <div className={styles.field}>
              <label>Serial Number</label>
              <input value={form.serial_number ?? ''} onChange={e => handleField('serial_number', e.target.value)} placeholder="Optional" />
            </div>
            <div className={styles.field}>
              <label>Location / Store</label>
              <input value={form.location ?? ''} onChange={e => handleField('location', e.target.value)} placeholder="e.g. QC Lab" />
            </div>
          </div>

          {/* Section: Purchase */}
          <p className={styles.sectionLabel}>Purchase Info</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Purchase Date</label>
              <input type="date" value={form.purchase_date ?? ''} onChange={e => handleField('purchase_date', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Purchase Cost (₹)</label>
              <input
                type="number"
                value={form.purchase_cost ?? ''}
                onChange={e => handleField('purchase_cost', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Section: Condition */}
          <p className={styles.sectionLabel}>Condition & Notes</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Current Condition</label>
              <select value={form.condition} onChange={e => handleField('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Remarks</label>
              <textarea
                rows={3}
                value={form.remarks ?? ''}
                onChange={e => handleField('remarks', e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={closeDrawer}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || !form.tool_code || !form.tool_name}
          >
            {saving ? 'Saving…' : editId ? 'Update Tool' : 'Create Tool'}
          </button>
        </div>
      </aside>
    </div>
  )
}
