'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { RectificationMemo, RectificationFormData } from '@/types/maintenance'
import styles from './Rectification.module.scss'

// ── SEED TOOLS ────────────────────────────────
const TOOL_OPTIONS = [
  { id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper' },
  { id: 2, tool_code: 'TL-002', tool_name: 'Drill Press' },
  { id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench' },
  { id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder' },
  { id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set' },
]

// ── MOCK RECTIFICATION MEMOS ──────────────────
const SEED_MEMOS: RectificationMemo[] = [
  {
    id: 1, memo_number: 'RM-2024-001',
    tool_id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder',
    issue_date: '2024-01-08',
    issue_desc: 'Disc guard cracked and cannot be secured. Sparks are deflecting towards operator.',
    action_taken: 'Ordered replacement guard from Makita — part no. 122-4401.',
    resolved_date: null,
    cost: 850,
    status: 'In Progress',
    remarks: 'Part expected within 7 working days.',
    created_at: '2024-01-08T09:30:00Z',
    updated_at: '2024-01-10T11:00:00Z',
  },
  {
    id: 2, memo_number: 'RM-2024-002',
    tool_id: 2, tool_code: 'TL-002', tool_name: 'Drill Press',
    issue_date: '2024-03-05',
    issue_desc: 'Chuck runout exceeds 0.1mm tolerance limit. Holes are not concentric.',
    action_taken: 'Chuck replaced with a new Jacobs 3/4" chuck. Machine retested — runout now 0.02mm.',
    resolved_date: '2024-03-12',
    cost: 2400,
    status: 'Resolved',
    remarks: 'Calibration certificate updated post-repair.',
    created_at: '2024-03-05T10:00:00Z',
    updated_at: '2024-03-12T16:00:00Z',
  },
  {
    id: 3, memo_number: 'RM-2024-003',
    tool_id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench',
    issue_date: '2024-02-20',
    issue_desc: 'Ratchet mechanism slipping at high torque settings. Click sound inconsistent.',
    action_taken: null,
    resolved_date: null,
    cost: null,
    status: 'Open',
    remarks: 'Tool quarantined in QC store. Do not use.',
    created_at: '2024-02-20T08:00:00Z',
    updated_at: '2024-02-20T08:00:00Z',
  },
  {
    id: 4, memo_number: 'RM-2023-008',
    tool_id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper',
    issue_date: '2023-10-14',
    issue_desc: 'Sliding jaw stiff and scratched — readings inconsistent below 5mm.',
    action_taken: 'Cleaned and lubricated jaw tracks. Scratches polished. Recalibrated.',
    resolved_date: '2023-10-16',
    cost: 0,
    status: 'Resolved',
    remarks: 'In-house repair. No external cost.',
    created_at: '2023-10-14T10:00:00Z',
    updated_at: '2023-10-16T14:00:00Z',
  },
  {
    id: 5, memo_number: 'RM-2023-012',
    tool_id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder',
    issue_date: '2023-12-01',
    issue_desc: 'Motor overheating after 10 mins of use. Burning smell detected.',
    action_taken: 'Sent to Makita service centre. Motor windings burnt — beyond economical repair.',
    resolved_date: '2023-12-20',
    cost: null,
    status: 'Scrapped',
    remarks: 'Second unit purchased as replacement (TL-007 — incoming).',
    created_at: '2023-12-01T09:00:00Z',
    updated_at: '2023-12-20T12:00:00Z',
  },
]

const STATUSES  = ['Open', 'In Progress', 'Resolved', 'Scrapped']
const EMPTY_FORM: RectificationFormData = {
  tool_id: 0, issue_date: '', issue_desc: '',
  action_taken: '', resolved_date: '', cost: null,
  status: 'Open', remarks: '',
}

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nextMemoNumber(memos: RectificationMemo[]): string {
  const year = new Date().getFullYear()
  const nums = memos
    .filter(m => m.memo_number.startsWith(`RM-${year}-`))
    .map(m => parseInt(m.memo_number.split('-')[2], 10))
    .filter(Boolean)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `RM-${year}-${String(next).padStart(3, '0')}`
}

const STATUS_CLASS: Record<string, string> = {
  'Open':        styles.statusOpen,
  'In Progress': styles.statusInProgress,
  'Resolved':    styles.statusResolved,
  'Scrapped':    styles.statusScrapped,
}

export default function Rectification() {
  const [memos, setMemos]             = useState<RectificationMemo[]>(SEED_MEMOS)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toolFilter, setToolFilter]   = useState('All')
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [editId, setEditId]           = useState<number | null>(null)
  const [form, setForm]               = useState<RectificationFormData>(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [expandedId, setExpandedId]   = useState<number | null>(null)

  // ── Stats ──────────────────────────────────
  const stats = useMemo(() => ({
    total:      memos.length,
    open:       memos.filter(m => m.status === 'Open').length,
    inProgress: memos.filter(m => m.status === 'In Progress').length,
    totalCost:  memos.reduce((s, m) => s + (m.cost ?? 0), 0),
  }), [memos])

  // ── Filtered ───────────────────────────────
  const filtered = useMemo(() => memos.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      m.memo_number.toLowerCase().includes(q) ||
      m.tool_name?.toLowerCase().includes(q) ||
      m.tool_code?.toLowerCase().includes(q) ||
      m.issue_desc.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || m.status === statusFilter
    const matchTool   = toolFilter   === 'All' || m.tool_code === toolFilter
    return matchSearch && matchStatus && matchTool
  }), [memos, search, statusFilter, toolFilter])

  // ── Drawer helpers ─────────────────────────
  function openCreate() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, issue_date: new Date().toISOString().split('T')[0] })
    setDrawerOpen(true)
  }

  function openEdit(m: RectificationMemo) {
    setEditId(m.id)
    setForm({
      tool_id:       m.tool_id,
      issue_date:    m.issue_date,
      issue_desc:    m.issue_desc,
      action_taken:  m.action_taken ?? '',
      resolved_date: m.resolved_date ?? '',
      cost:          m.cost,
      status:        m.status,
      remarks:       m.remarks ?? '',
    })
    setDrawerOpen(true)
  }

  function closeDrawer() { setDrawerOpen(false); setEditId(null) }
  function handleField(key: keyof RectificationFormData, val: string | number | null) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleSave() {
    if (!form.tool_id || !form.issue_date || !form.issue_desc) return
    setSaving(true)
    const tool = TOOL_OPTIONS.find(t => t.id === Number(form.tool_id))
    setTimeout(() => {
      if (editId !== null) {
        setMemos(prev => prev.map(m =>
          m.id === editId ? {
            ...m, ...form,
            tool_id:      Number(form.tool_id),
            tool_name:    tool?.tool_name ?? m.tool_name,
            tool_code:    tool?.tool_code ?? m.tool_code,
            action_taken: form.action_taken  || null,
            resolved_date: form.resolved_date || null,
            remarks:       form.remarks || null,
            updated_at:    new Date().toISOString(),
          } : m
        ))
      } else {
        const newMemo: RectificationMemo = {
          id:            Date.now(),
          memo_number:   nextMemoNumber(memos),
          tool_id:       Number(form.tool_id),
          tool_name:     tool?.tool_name ?? '',
          tool_code:     tool?.tool_code ?? '',
          issue_date:    form.issue_date,
          issue_desc:    form.issue_desc,
          action_taken:  form.action_taken  || null,
          resolved_date: form.resolved_date || null,
          cost:          form.cost,
          status:        form.status,
          remarks:       form.remarks || null,
          created_at:    new Date().toISOString(),
          updated_at:    new Date().toISOString(),
        }
        setMemos(prev => [newMemo, ...prev])
      }
      setSaving(false)
      closeDrawer()
    }, 400)
  }

  function handleDelete(id: number) {
    setMemos(prev => prev.filter(m => m.id !== id))
    setDeleteConfirm(null)
  }

  const isResolved = form.status === 'Resolved' || form.status === 'Scrapped'

  const router = useRouter()

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rectification Memos</h1>
          <p className={styles.subtitle}>{memos.length} total memos</p>
        </div>
        <div style={{ display:'flex', gap:'0.6rem' }}>
          <button className={styles.ghostBtn} onClick={() => router.push('/dashboard/maintenance/rectification/analytics')}>
            ◎ Analytics
          </button>
          <button className={styles.addBtn} onClick={openCreate}>
            <span>+</span> New Memo
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{stats.total}</p>
          <p className={styles.statLabel}>Total Memos</p>
        </div>
        <div className={`${styles.statCard} ${stats.open > 0 ? styles.statDanger : ''}`}>
          <p className={styles.statVal}>{stats.open}</p>
          <p className={styles.statLabel}>Open</p>
        </div>
        <div className={`${styles.statCard} ${stats.inProgress > 0 ? styles.statWarn : ''}`}>
          <p className={styles.statVal}>{stats.inProgress}</p>
          <p className={styles.statLabel}>In Progress</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>₹{stats.totalCost.toLocaleString('en-IN')}</p>
          <p className={styles.statLabel}>Repair Cost MTD</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search memo no., tool, or issue…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={toolFilter} onChange={e => setToolFilter(e.target.value)}>
          <option value="All">All Tools</option>
          {TOOL_OPTIONS.map(t => (
            <option key={t.tool_code} value={t.tool_code}>{t.tool_code} — {t.tool_name}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛠️</span>
            <p>No rectification memos found</p>
            <button className={styles.addBtn} onClick={openCreate}>Create First Memo</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Memo No.</th>
                  <th>Tool</th>
                  <th>Issue Date</th>
                  <th>Issue Description</th>
                  <th className={styles.center}>Status</th>
                  <th>Resolved Date</th>
                  <th className={styles.right}>Cost (₹)</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(memo => {
                  const isExpanded = expandedId === memo.id
                  return (
                    <>
                      <tr
                        key={memo.id}
                        className={memo.status === 'Open' ? styles.rowOpen : ''}
                        onClick={() => setExpandedId(isExpanded ? null : memo.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className={styles.mono}>{memo.memo_number}</td>
                        <td>
                          <span className={styles.toolCode}>{memo.tool_code}</span>
                          <span className={styles.toolName}>{memo.tool_name}</span>
                        </td>
                        <td className={styles.mono}>{formatDate(memo.issue_date)}</td>
                        <td>
                          <span className={styles.issueDesc}>
                            {memo.issue_desc.length > 65
                              ? memo.issue_desc.slice(0, 65) + '…'
                              : memo.issue_desc}
                          </span>
                        </td>
                        <td className={styles.center}>
                          <span className={`${styles.statusBadge} ${STATUS_CLASS[memo.status] ?? ''}`}>
                            {memo.status}
                          </span>
                        </td>
                        <td className={styles.mono}>
                          {memo.resolved_date
                            ? formatDate(memo.resolved_date)
                            : <span className={styles.na}>—</span>}
                        </td>
                        <td className={`${styles.right} ${styles.mono}`}>
                          {memo.cost !== null
                            ? `₹${memo.cost.toLocaleString('en-IN')}`
                            : <span className={styles.na}>—</span>}
                        </td>
                        <td className={styles.center} onClick={e => e.stopPropagation()}>
                          <div className={styles.actions}>
                            <button className={styles.editBtn} onClick={() => openEdit(memo)}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(memo.id)}>✕</button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {isExpanded && (
                        <tr key={`${memo.id}-detail`} className={styles.detailRow}>
                          <td colSpan={8}>
                            <div className={styles.detailBox}>
                              <div className={styles.detailSection}>
                                <span className={styles.detailLabel}>Issue Description</span>
                                <p>{memo.issue_desc}</p>
                              </div>
                              {memo.action_taken && (
                                <div className={styles.detailSection}>
                                  <span className={styles.detailLabel}>Action Taken</span>
                                  <p>{memo.action_taken}</p>
                                </div>
                              )}
                              {memo.remarks && (
                                <div className={styles.detailSection}>
                                  <span className={styles.detailLabel}>Remarks</span>
                                  <p>{memo.remarks}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm ── */}
      {deleteConfirm !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h3>Delete Memo?</h3>
            <p>This rectification memo will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Drawer Overlay ── */}
      {drawerOpen && <div className={styles.drawerOverlay} onClick={closeDrawer} />}

      {/* ── Drawer ── */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div>
            <h2 className={styles.drawerTitle}>{editId ? 'Edit Memo' : 'New Rectification Memo'}</h2>
            {!editId && (
              <p className={styles.drawerSub}>
                Memo no. will be auto-assigned: <strong>{nextMemoNumber(memos)}</strong>
              </p>
            )}
          </div>
          <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
        </div>

        <div className={styles.drawerBody}>

          <p className={styles.sectionLabel}>Tool & Issue</p>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Select Tool <span className={styles.req}>*</span></label>
              <select
                value={form.tool_id}
                onChange={e => handleField('tool_id', Number(e.target.value))}
              >
                <option value={0} disabled>— choose a tool —</option>
                {TOOL_OPTIONS.map(t => (
                  <option key={t.id} value={t.id}>{t.tool_code} — {t.tool_name}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Issue Date <span className={styles.req}>*</span></label>
              <input
                type="date"
                value={form.issue_date}
                onChange={e => handleField('issue_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select value={form.status} onChange={e => handleField('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Issue Description <span className={styles.req}>*</span></label>
              <textarea
                rows={3}
                value={form.issue_desc}
                onChange={e => handleField('issue_desc', e.target.value)}
                placeholder="Describe the problem in detail…"
              />
            </div>
          </div>

          <p className={styles.sectionLabel}>Resolution</p>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Action Taken</label>
              <textarea
                rows={3}
                value={form.action_taken ?? ''}
                onChange={e => handleField('action_taken', e.target.value)}
                placeholder="What was done to fix the issue…"
              />
            </div>
            <div className={styles.field}>
              <label>Resolved Date {isResolved && <span className={styles.req}>*</span>}</label>
              <input
                type="date"
                value={form.resolved_date ?? ''}
                onChange={e => handleField('resolved_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Repair Cost (₹)</label>
              <input
                type="number"
                value={form.cost ?? ''}
                onChange={e => handleField('cost', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
              />
            </div>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Remarks</label>
              <textarea
                rows={2}
                value={form.remarks ?? ''}
                onChange={e => handleField('remarks', e.target.value)}
                placeholder="Any additional notes…"
              />
            </div>
          </div>

          {/* Status banner */}
          {form.status === 'Open' && (
            <div className={styles.dangerBanner}>
              ⚠ Open — tool should be quarantined until issue is resolved.
            </div>
          )}
          {form.status === 'Scrapped' && (
            <div className={styles.scrapBanner}>
              🗑 Scrapped — ensure tool is removed from active inventory and marked accordingly.
            </div>
          )}
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={closeDrawer}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || !form.tool_id || !form.issue_date || !form.issue_desc}
          >
            {saving ? 'Saving…' : editId ? 'Update Memo' : 'Create Memo'}
          </button>
        </div>
      </aside>
    </div>
  )
}
