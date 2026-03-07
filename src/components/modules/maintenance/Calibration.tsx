'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { CalibrationRecord, CalibrationFormData } from '@/types/maintenance'
import styles from './Calibration.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'

// ── SEED TOOLS (mirrors ToolMaster seed) ─────
const TOOL_OPTIONS = [
  { id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper' },
  { id: 2, tool_code: 'TL-002', tool_name: 'Drill Press' },
  { id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench' },
  { id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder' },
  { id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set' },
]

// ── MOCK CALIBRATION RECORDS ─────────────────
const SEED_RECORDS: CalibrationRecord[] = [
  {
    id: 1, tool_id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper',
    calibration_date: '2024-01-15', next_due_date: '2025-01-15',
    done_by: 'National Test House', result: 'Pass',
    certificate_number: 'NTH/2024/0115', remarks: 'Within tolerance limits',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2, tool_id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set',
    calibration_date: '2024-02-10', next_due_date: '2025-02-10',
    done_by: 'National Test House', result: 'Pass',
    certificate_number: 'NTH/2024/0210', remarks: null,
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 3, tool_id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench',
    calibration_date: '2023-11-20', next_due_date: '2024-11-20',
    done_by: 'In-house QC Team', result: 'Conditional',
    certificate_number: null, remarks: 'Acceptable with ±5% tolerance — next check in 6 months',
    created_at: '2023-11-20T10:00:00Z',
  },
  {
    id: 4, tool_id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper',
    calibration_date: '2023-01-10', next_due_date: '2024-01-10',
    done_by: 'National Test House', result: 'Pass',
    certificate_number: 'NTH/2023/0110', remarks: null,
    created_at: '2023-01-10T10:00:00Z',
  },
  {
    id: 5, tool_id: 2, tool_code: 'TL-002', tool_name: 'Drill Press',
    calibration_date: '2024-03-05', next_due_date: '2025-03-05',
    done_by: 'In-house QC Team', result: 'Fail',
    certificate_number: null, remarks: 'Chuck runout exceeds 0.1mm limit — send for repair',
    created_at: '2024-03-05T10:00:00Z',
  },
  {
    id: 6, tool_id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set',
    calibration_date: '2023-02-08', next_due_date: '2024-02-08',
    done_by: 'National Test House', result: 'Pass',
    certificate_number: 'NTH/2023/0208', remarks: null,
    created_at: '2023-02-08T10:00:00Z',
  },
]

const RESULTS = ['Pass', 'Fail', 'Conditional']
const EMPTY_FORM: CalibrationFormData = {
  tool_id: 0,
  calibration_date: '',
  next_due_date: '',
  done_by: '',
  result: 'Pass',
  certificate_number: '',
  remarks: '',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDueStatus(nextDue: string): 'overdue' | 'due-soon' | 'ok' {
  const today = new Date()
  const dueDate = new Date(nextDue)
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 30) return 'due-soon'
  return 'ok'
}

export default function Calibration() {
  const [records, setRecords] = useState<CalibrationRecord[]>(SEED_RECORDS)
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState('All')
  const [toolFilter, setToolFilter] = useState('All')
  const [dueFilter, setDueFilter] = useState('All')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<CalibrationFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // ── Stats ──────────────────────────────────
  const stats = useMemo(() => {
    const overdue = records.filter(r => getDueStatus(r.next_due_date) === 'overdue').length
    const dueSoon = records.filter(r => getDueStatus(r.next_due_date) === 'due-soon').length
    const passRate = records.length
      ? Math.round((records.filter(r => r.result === 'Pass').length / records.length) * 100)
      : 0
    return { total: records.length, overdue, dueSoon, passRate }
  }, [records])

  // ── Filtered list ──────────────────────────
  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.tool_name?.toLowerCase().includes(q) ||
      r.tool_code?.toLowerCase().includes(q) ||
      r.done_by.toLowerCase().includes(q) ||
      (r.certificate_number?.toLowerCase().includes(q) ?? false)
    const matchResult = resultFilter === 'All' || r.result === resultFilter
    const matchTool = toolFilter === 'All' || r.tool_code === toolFilter
    const due = getDueStatus(r.next_due_date)
    const matchDue =
      dueFilter === 'All' ||
      (dueFilter === 'Overdue' && due === 'overdue') ||
      (dueFilter === 'Due Soon' && due === 'due-soon') ||
      (dueFilter === 'OK' && due === 'ok')
    return matchSearch && matchResult && matchTool && matchDue
  }), [records, search, resultFilter, toolFilter, dueFilter])

  // ── Drawer helpers ─────────────────────────
  function openCreate() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, calibration_date: new Date().toISOString().split('T')[0] })
    setDrawerOpen(true)
  }

  function openEdit(r: CalibrationRecord) {
    setEditId(r.id)
    setForm({
      tool_id: r.tool_id,
      calibration_date: r.calibration_date,
      next_due_date: r.next_due_date,
      done_by: r.done_by,
      result: r.result,
      certificate_number: r.certificate_number ?? '',
      remarks: r.remarks ?? '',
    })
    setDrawerOpen(true)
  }

  function closeDrawer() { setDrawerOpen(false); setEditId(null) }
  function handleField(key: keyof CalibrationFormData, val: string | number) {
    setForm((f: CalibrationFormData) => ({ ...f, [key]: val }))
  }

  function handleSave() {
    if (!form.tool_id || !form.calibration_date || !form.next_due_date || !form.done_by) return
    setSaving(true)
    const tool = TOOL_OPTIONS.find(t => t.id === Number(form.tool_id))
    setTimeout(() => {
      if (editId !== null) {
        setRecords(prev => prev.map(r =>
          r.id === editId ? {
            ...r, ...form,
            tool_id: Number(form.tool_id),
            tool_name: tool?.tool_name ?? r.tool_name,
            tool_code: tool?.tool_code ?? r.tool_code,
            certificate_number: form.certificate_number || null,
            remarks: form.remarks || null,
          } : r
        ))
      } else {
        const newRec: CalibrationRecord = {
          id: Date.now(),
          tool_id: Number(form.tool_id),
          tool_name: tool?.tool_name ?? '',
          tool_code: tool?.tool_code ?? '',
          calibration_date: form.calibration_date,
          next_due_date: form.next_due_date,
          done_by: form.done_by,
          result: form.result,
          certificate_number: form.certificate_number || null,
          remarks: form.remarks || null,
          created_at: new Date().toISOString(),
        }
        setRecords(prev => [newRec, ...prev])
      }
      setSaving(false)
      closeDrawer()
    }, 400)
  }

  function handleDelete(id: number) {
    setRecords(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }

  const router = useRouter()

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calibration Records</h1>
          <p className={styles.subtitle}>{records.length} total records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Calibration Records',
            subtitle: `${filtered.length} records.`,
            columns: [
              { header: 'Tool Code', dataKey: 'tool_code' },
              { header: 'Tool Name', dataKey: 'tool_name' },
              { header: 'Calib. Date', dataKey: 'calibration_date' },
              { header: 'Due Date', dataKey: 'next_due_date' },
              { header: 'Done By', dataKey: 'done_by' },
              { header: 'Cert No.', dataKey: 'certificate_number' },
              { header: 'Result', dataKey: 'result' },
            ],
            rows: filtered.map(r => ({
              ...r,
              calibration_date: formatDate(r.calibration_date),
              next_due_date: formatDate(r.next_due_date),
              certificate_number: r.certificate_number || '—'
            })),
            fileName: 'Calibration_Records'
          })} />
          <button className={styles.ghostBtn} onClick={() => router.push('/dashboard/maintenance/calibration/analytics')}>
            ◎ Analytics
          </button>
          <button className={styles.addBtn} onClick={openCreate}>
            <span>+</span> New Record
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{stats.total}</p>
          <p className={styles.statLabel}>Total Records</p>
        </div>
        <div className={`${styles.statCard} ${stats.overdue > 0 ? styles.statDanger : ''}`}>
          <p className={styles.statVal}>{stats.overdue}</p>
          <p className={styles.statLabel}>Overdue</p>
        </div>
        <div className={`${styles.statCard} ${stats.dueSoon > 0 ? styles.statWarn : ''}`}>
          <p className={styles.statVal}>{stats.dueSoon}</p>
          <p className={styles.statLabel}>Due in 30 Days</p>
        </div>
        <div className={styles.statCard}>
          <p className={`${styles.statVal} ${styles.accent}`}>{stats.passRate}%</p>
          <p className={styles.statLabel}>Pass Rate</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search by tool, done by, certificate…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={toolFilter} onChange={e => setToolFilter(e.target.value)}>
          <option value="All">All Tools</option>
          {TOOL_OPTIONS.map(t => <option key={t.tool_code} value={t.tool_code}>{t.tool_code} — {t.tool_name}</option>)}
        </select>
        <select className={styles.filterSelect} value={resultFilter} onChange={e => setResultFilter(e.target.value)}>
          <option value="All">All Results</option>
          {RESULTS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className={styles.filterSelect} value={dueFilter} onChange={e => setDueFilter(e.target.value)}>
          <option value="All">All Due Status</option>
          <option value="Overdue">Overdue</option>
          <option value="Due Soon">Due in 30 Days</option>
          <option value="OK">OK</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No calibration records found</p>
            <button className={styles.addBtn} onClick={openCreate}>Add First Record</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Calibration Date</th>
                  <th>Next Due</th>
                  <th>Done By</th>
                  <th>Certificate No.</th>
                  <th className={styles.center}>Result</th>
                  <th className={styles.center}>Due Status</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => {
                  const dueStatus = getDueStatus(rec.next_due_date)
                  const isExpanded = expandedId === rec.id
                  return (
                    <>
                      <tr
                        key={rec.id}
                        className={`${dueStatus === 'overdue' ? styles.rowOverdue : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <span className={styles.toolCode}>{rec.tool_code}</span>
                          <span className={styles.toolName}>{rec.tool_name}</span>
                        </td>
                        <td className={styles.mono}>{formatDate(rec.calibration_date)}</td>
                        <td className={styles.mono}>{formatDate(rec.next_due_date)}</td>
                        <td>{rec.done_by}</td>
                        <td className={styles.mono}>
                          {rec.certificate_number ?? <span className={styles.na}>—</span>}
                        </td>
                        <td className={styles.center}>
                          <span className={`${styles.resultBadge} ${styles[`result${rec.result.replace(' ', '')}`]}`}>
                            {rec.result}
                          </span>
                        </td>
                        <td className={styles.center}>
                          <span className={`${styles.dueBadge} ${styles[`due${dueStatus.replace('-', '')}`]}`}>
                            {dueStatus === 'overdue' ? '⚠ Overdue' :
                              dueStatus === 'due-soon' ? '⏱ Due Soon' : '✓ OK'}
                          </span>
                        </td>
                        <td className={styles.center} onClick={e => e.stopPropagation()}>
                          <div className={styles.actions}>
                            <button className={styles.editBtn} onClick={() => openEdit(rec)}>Edit</button>
                            <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(rec.id)}>✕</button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable remarks row */}
                      {isExpanded && rec.remarks && (
                        <tr key={`${rec.id}-remarks`} className={styles.remarksRow}>
                          <td colSpan={8}>
                            <div className={styles.remarksBox}>
                              <span className={styles.remarksLabel}>Remarks:</span>
                              {rec.remarks}
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
            <h3>Delete Record?</h3>
            <p>This calibration record will be permanently removed.</p>
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
          <h2 className={styles.drawerTitle}>{editId ? 'Edit Calibration Record' : 'New Calibration Record'}</h2>
          <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
        </div>

        <div className={styles.drawerBody}>

          <p className={styles.sectionLabel}>Tool</p>
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
          </div>

          <p className={styles.sectionLabel}>Calibration Details</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Calibration Date <span className={styles.req}>*</span></label>
              <input
                type="date"
                value={form.calibration_date}
                onChange={e => handleField('calibration_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Next Due Date <span className={styles.req}>*</span></label>
              <input
                type="date"
                value={form.next_due_date}
                onChange={e => handleField('next_due_date', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Done By <span className={styles.req}>*</span></label>
              <input
                value={form.done_by}
                onChange={e => handleField('done_by', e.target.value)}
                placeholder="e.g. National Test House"
              />
            </div>
            <div className={styles.field}>
              <label>Result <span className={styles.req}>*</span></label>
              <select value={form.result} onChange={e => handleField('result', e.target.value)}>
                {RESULTS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Certificate Number</label>
              <input
                value={form.certificate_number ?? ''}
                onChange={e => handleField('certificate_number', e.target.value)}
                placeholder="Optional — e.g. NTH/2024/0115"
              />
            </div>
          </div>

          <p className={styles.sectionLabel}>Notes</p>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.span2}`}>
              <label>Remarks</label>
              <textarea
                rows={3}
                value={form.remarks ?? ''}
                onChange={e => handleField('remarks', e.target.value)}
                placeholder="Any observations or notes…"
              />
            </div>
          </div>

          {/* Result preview */}
          {form.result === 'Fail' && (
            <div className={styles.warnBanner}>
              ⚠ A Fail result means this tool should be taken out of service until repaired.
            </div>
          )}
          {form.result === 'Conditional' && (
            <div className={styles.infoBanner}>
              ℹ Conditional pass — document all conditions and limitations clearly in remarks.
            </div>
          )}
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={closeDrawer}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || !form.tool_id || !form.calibration_date || !form.next_due_date || !form.done_by}
          >
            {saving ? 'Saving…' : editId ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </aside>
    </div>
  )
}
