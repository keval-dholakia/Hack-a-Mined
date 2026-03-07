'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteIQCEntry } from '@/app/actions/quality'
import type { IQCEntry } from '@/types/quality'
import styles from './Quality.module.scss'

type Props = { entries: IQCEntry[] }

const RESULT_STYLE: Record<string, string> = {
  Pass:   styles.resultPass,
  Fail:   styles.resultFail,
  Rework: styles.resultRework,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function IQCList({ entries }: Props) {
  const router = useRouter()
  const [search, setSearch]         = useState('')
  const [resultFilter, setResult]   = useState('All')
  const [deleteConfirm, setConfirm] = useState<number | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const filtered = entries.filter(e => {
    const q = search.toLowerCase()
    const matchQ = !q || e.grn_no?.toLowerCase().includes(q) ||
      e.vendor_name?.toLowerCase().includes(q) ||
      e.product_name?.toLowerCase().includes(q) ||
      e.product_code?.toLowerCase().includes(q) ||
      e.checker_name?.toLowerCase().includes(q)
    const matchR  = resultFilter === 'All' || e.result === resultFilter
    return matchQ && matchR
  })

  // Stats
  const total   = entries.length
  const pass    = entries.filter(e => e.result === 'Pass').length
  const fail    = entries.filter(e => e.result === 'Fail').length
  const rework  = entries.filter(e => e.result === 'Rework').length
  const passRate = total ? Math.round((pass / total) * 100) : 0

  async function handleDelete(id: number) {
    setDeleting(true)
    await deleteIQCEntry(id)
    setConfirm(null)
    setDeleting(false)
    router.refresh()
  }

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Incoming Quality Control (IQC)</h1>
          <p className={styles.subtitle}>{total} entries · {passRate}% pass rate</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => router.push('/dashboard/quality/iqc/new')}>
          + New IQC Entry
        </button>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{total}</p>
          <p className={styles.statLabel}>Total Inspections</p>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <p className={styles.statVal}>{pass}</p>
          <p className={styles.statLabel}>Passed</p>
        </div>
        <div className={`${styles.statCard} ${fail > 0 ? styles.statRed : ''}`}>
          <p className={styles.statVal}>{fail}</p>
          <p className={styles.statLabel}>Failed</p>
        </div>
        <div className={`${styles.statCard} ${rework > 0 ? styles.statAmber : ''}`}>
          <p className={styles.statVal}>{rework}</p>
          <p className={styles.statLabel}>Sent for Rework</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search by GRN no., vendor, or product…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.filterSelect} value={resultFilter} onChange={e => setResult(e.target.value)}>
          <option value="All">All Results</option>
          <option>Pass</option>
          <option>Fail</option>
          <option>Rework</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔬</span>
            <p>{entries.length === 0 ? 'No IQC entries yet.' : 'No results match your filter.'}</p>
            {entries.length === 0 && (
              <button className={styles.primaryBtn} onClick={() => router.push('/dashboard/quality/iqc/new')}>
                Create First IQC Entry
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>GRN No.</th>
                  <th>Vendor</th>
                  <th>Product</th>
                  <th className={styles.center}>Total Qty</th>
                  <th className={styles.center}>Sample</th>
                  <th className={styles.center}>Accepted</th>
                  <th className={styles.center}>Rejected</th>
                  <th className={styles.center}>Visual</th>
                  <th className={styles.center}>Dimension</th>
                  <th className={styles.center}>Result</th>
                  <th>Checked By</th>
                  <th>Date</th>
                  <th className={styles.center}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{idx + 1}</td>
                    <td className={styles.mono}>{e.grn_no}</td>
                    <td>{e.vendor_name}</td>
                    <td>
                      <span className={styles.productCode}>{e.product_code}</span>
                      <span className={styles.productName}>{e.product_name}</span>
                    </td>
                    <td className={`${styles.center} ${styles.mono}`}>{e.total_qty}</td>
                    <td className={`${styles.center} ${styles.mono}`}>{e.sample_size}</td>
                    <td className={`${styles.center} ${styles.mono} ${styles.good}`}>{e.accepted_qty}</td>
                    <td className={`${styles.center} ${styles.mono} ${e.rejected_qty > 0 ? styles.bad : ''}`}>{e.rejected_qty}</td>
                    <td className={styles.center}>
                      <span className={e.visual_check ? styles.checkPass : styles.checkFail}>
                        {e.visual_check ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className={styles.center}>
                      <span className={e.dimension_check ? styles.checkPass : styles.checkFail}>
                        {e.dimension_check ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className={styles.center}>
                      <span className={`${styles.resultBadge} ${RESULT_STYLE[e.result] ?? ''}`}>
                        {e.result}
                      </span>
                    </td>
                    <td className={styles.checkerName}>{e.checker_name}</td>
                    <td className={styles.mono}>{formatDate(e.created_at)}</td>
                    <td className={styles.center}>
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => router.push(`/dashboard/quality/iqc/${e.id}`)}>
                          Edit
                        </button>
                        <button className={styles.deleteBtn} onClick={() => setConfirm(e.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmModal} onClick={ev => ev.stopPropagation()}>
            <h3>Delete IQC Entry?</h3>
            <p>This inspection record will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} disabled={deleting} onClick={() => handleDelete(deleteConfirm)}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
