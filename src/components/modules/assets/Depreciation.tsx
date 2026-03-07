'use client'

import { useState, useMemo } from 'react'
import styles from './Assets.module.scss'
import depStyles from './Depreciation.module.scss'

// ── Asset register with depreciation config ───────────────
interface AssetDep {
  id: number
  code: string
  name: string
  category: string
  purchase_date: string
  purchase_cost: number
  salvage_value: number
  useful_life_years: number
  method: 'SLM' | 'WDV'
  wdv_rate: number          // % p.a. — used only if method = WDV
}

const ASSET_REGISTER: AssetDep[] = [
  { id: 1, code: 'AST-001', name: 'CNC Milling Machine',       category: 'Machinery',             purchase_date: '2021-04-15', purchase_cost: 1850000, salvage_value: 185000, useful_life_years: 10, method: 'SLM', wdv_rate: 0 },
  { id: 2, code: 'AST-002', name: 'Hydraulic Press (50T)',      category: 'Production Equipment',  purchase_date: '2019-07-20', purchase_cost: 650000,  salvage_value: 50000,  useful_life_years: 10, method: 'WDV', wdv_rate: 15 },
  { id: 3, code: 'AST-003', name: 'MIG Welding Machine',        category: 'Machinery',             purchase_date: '2022-11-01', purchase_cost: 85000,   salvage_value: 5000,   useful_life_years: 8,  method: 'SLM', wdv_rate: 0 },
  { id: 4, code: 'AST-004', name: 'Vernier Calliper (Digital)', category: 'Measuring Instrument',  purchase_date: '2023-03-10', purchase_cost: 12500,   salvage_value: 500,    useful_life_years: 5,  method: 'SLM', wdv_rate: 0 },
  { id: 5, code: 'AST-005', name: 'Forklift — 3T Diesel',       category: 'Vehicle',               purchase_date: '2018-06-12', purchase_cost: 920000,  salvage_value: 92000,  useful_life_years: 10, method: 'WDV', wdv_rate: 20 },
  { id: 6, code: 'AST-006', name: 'Dell PowerEdge R740 Server', category: 'IT Asset',              purchase_date: '2022-08-01', purchase_cost: 480000,  salvage_value: 48000,  useful_life_years: 5,  method: 'SLM', wdv_rate: 0 },
]

// ── Depreciation ledger entries ────────────────────────────
interface DepEntry {
  id: number
  asset_id: number
  fin_year: string     // e.g. "2021-22"
  opening_value: number
  dep_amount: number
  closing_value: number
  method: 'SLM' | 'WDV'
  recorded_by: string
  notes: string
}

// ── Calculation helpers ───────────────────────────────────
function yearsBetween(from: string, to: Date): number {
  const d = new Date(from)
  return Math.max(0, (to.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

function slmAnnualDep(cost: number, salvage: number, life: number): number {
  if (life <= 0) return 0
  return Math.round((cost - salvage) / life)
}

function buildSchedule(a: AssetDep): DepEntry[] {
  const entries: DepEntry[] = []
  const start = new Date(a.purchase_date)
  const startYear = start.getFullYear()
  const today = new Date()
  const todayYear = today.getFullYear()
  const yearsToShow = Math.min(a.useful_life_years, todayYear - startYear + 1)

  let bookValue = a.purchase_cost
  const annualSlm = slmAnnualDep(a.purchase_cost, a.salvage_value, a.useful_life_years)

  for (let i = 0; i < yearsToShow; i++) {
    const yr = startYear + i
    const finYear = `${yr}-${String(yr + 1).slice(-2)}`
    const opening = bookValue
    let dep = 0

    if (a.method === 'SLM') {
      dep = Math.min(annualSlm, Math.max(0, bookValue - a.salvage_value))
    } else {
      dep = Math.round(bookValue * a.wdv_rate / 100)
      dep = Math.min(dep, Math.max(0, bookValue - a.salvage_value))
    }

    bookValue = Math.max(a.salvage_value, bookValue - dep)

    entries.push({
      id: a.id * 100 + i,
      asset_id: a.id,
      fin_year: finYear,
      opening_value: opening,
      dep_amount: dep,
      closing_value: bookValue,
      method: a.method,
      recorded_by: 'System Auto',
      notes: i === 0 ? 'First year (partial if mid-year purchase)' : '',
    })
  }
  return entries
}

// Build summary per asset
interface AssetSummary {
  asset: AssetDep
  schedule: DepEntry[]
  accumulated_dep: number
  current_book_value: number
  dep_pct: number   // % of cost depreciated so far
  is_fully_dep: boolean
  annual_dep: number
}

function buildSummaries(): AssetSummary[] {
  return ASSET_REGISTER.map(a => {
    const schedule = buildSchedule(a)
    const accumulated = schedule.reduce((s, e) => s + e.dep_amount, 0)
    const book = Math.max(a.salvage_value, a.purchase_cost - accumulated)
    const pct  = Math.round((accumulated / (a.purchase_cost - a.salvage_value)) * 100)
    const ann  = a.method === 'SLM'
      ? slmAnnualDep(a.purchase_cost, a.salvage_value, a.useful_life_years)
      : Math.round(book * a.wdv_rate / 100)
    return {
      asset: a,
      schedule,
      accumulated_dep: accumulated,
      current_book_value: book,
      dep_pct: Math.min(100, pct),
      is_fully_dep: book <= a.salvage_value,
      annual_dep: ann,
    }
  })
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

function fmtCr(n: number) { return '₹' + n.toLocaleString('en-IN') }
function fmt(d: string)   { return d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—' }

// ── Component ─────────────────────────────────────────────
export default function Depreciation() {
  const summaries = useMemo(() => buildSummaries(), [])

  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [methodF, setMethodF] = useState('All')
  const [search, setSearch]   = useState('')

  const totalOriginal   = ASSET_REGISTER.reduce((s, a) => s + a.purchase_cost, 0)
  const totalAccum      = summaries.reduce((s, x) => s + x.accumulated_dep, 0)
  const totalBook       = summaries.reduce((s, x) => s + x.current_book_value, 0)
  const totalAnnual     = summaries.reduce((s, x) => s + x.annual_dep, 0)
  const fullyDep        = summaries.filter(x => x.is_fully_dep).length

  const filteredSums = summaries.filter(x => {
    const q = search.toLowerCase()
    return (!q || x.asset.name.toLowerCase().includes(q) || x.asset.code.toLowerCase().includes(q)) &&
      (methodF === 'All' || x.asset.method === methodF)
  })

  const activeSchedule = selectedAssetId !== null
    ? summaries.find(x => x.asset.id === selectedAssetId)
    : null

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Asset Depreciation</h1>
          <p className={styles.subtitle}>Scheduled depreciation register — SLM & WDV methods · FY {new Date().getFullYear()}-{String(new Date().getFullYear() + 1).slice(-2)}</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <select className={styles.filterSelect} value={methodF} onChange={e => setMethodF(e.target.value)}>
            <option value="All">SLM + WDV</option>
            <option value="SLM">SLM Only</option>
            <option value="WDV">WDV Only</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{fmtCr(totalOriginal)}</p>
          <p className={styles.statLabel}>Total Original Cost</p>
        </div>
        <div className={`${styles.statCard} ${styles.statAmber}`}>
          <p className={styles.statVal}>{fmtCr(totalAccum)}</p>
          <p className={styles.statLabel}>Total Accum. Depreciation</p>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <p className={styles.statVal}>{fmtCr(totalBook)}</p>
          <p className={styles.statLabel}>Total Net Book Value</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statVal}>{fmtCr(totalAnnual)}</p>
          <p className={styles.statLabel}>Annual Dep. (Current FY)</p>
        </div>
      </div>

      {/* Asset Depreciation Cards */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input className={styles.searchInput} placeholder="Search asset name or code…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <span className={styles.resultCount}>{filteredSums.length} asset{filteredSums.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={depStyles.depGrid}>
        {filteredSums.map(({ asset: a, accumulated_dep, current_book_value, dep_pct, is_fully_dep, annual_dep }) => (
          <div key={a.id}
            className={`${depStyles.depCard} ${selectedAssetId === a.id ? depStyles.depCardActive : ''}`}
            onClick={() => setSelectedAssetId(prev => prev === a.id ? null : a.id)}>

            {/* Card top */}
            <div className={depStyles.depCardHead}>
              <span className={depStyles.depIcon}>{CAT_ICON[a.category] ?? '🏭'}</span>
              <div className={depStyles.depAssetInfo}>
                <span className={styles.assetCode}>{a.code}</span>
                <span className={depStyles.depName}>{a.name}</span>
              </div>
              <span className={`${depStyles.methodBadge} ${a.method === 'SLM' ? depStyles.methodSLM : depStyles.methodWDV}`}>
                {a.method}
              </span>
            </div>

            {/* Progress bar */}
            <div className={depStyles.progressWrap}>
              <div className={depStyles.progressTrack}>
                <div
                  className={`${depStyles.progressFill} ${dep_pct >= 90 ? depStyles.progressRed : dep_pct >= 60 ? depStyles.progressAmber : depStyles.progressBlue}`}
                  style={{ width: `${dep_pct}%` }}
                />
              </div>
              <span className={depStyles.progressPct}>{dep_pct}% depreciated</span>
            </div>

            {/* Cost breakdown */}
            <div className={depStyles.depValues}>
              <div className={depStyles.depValItem}>
                <span className={depStyles.depValLabel}>Original Cost</span>
                <span className={depStyles.depValNum}>{fmtCr(a.purchase_cost)}</span>
              </div>
              <div className={depStyles.depValItem}>
                <span className={depStyles.depValLabel}>Accum. Dep.</span>
                <span className={`${depStyles.depValNum} ${depStyles.numAmber}`}>{fmtCr(accumulated_dep)}</span>
              </div>
              <div className={depStyles.depValItem}>
                <span className={depStyles.depValLabel}>Net Book Value</span>
                <span className={`${depStyles.depValNum} ${depStyles.numGreen}`}>{fmtCr(current_book_value)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className={depStyles.depCardFoot}>
              <span className={depStyles.depCardFootNote}>
                {a.useful_life_years} yr life · Salvage {fmtCr(a.salvage_value)}
                {a.method === 'WDV' ? ` · ${a.wdv_rate}% p.a.` : ''}
              </span>
              {is_fully_dep
                ? <span className={depStyles.fullyDepTag}>Fully Depreciated</span>
                : <span className={depStyles.annualDepTag}>₹{(annual_dep/1000).toFixed(0)}K / yr</span>
              }
            </div>

            {/* Click hint */}
            <p className={depStyles.clickHint}>{selectedAssetId === a.id ? '▲ Hide schedule' : '▼ View schedule'}</p>
          </div>
        ))}
      </div>

      {/* ── Depreciation Schedule (expanded) ── */}
      {activeSchedule && (
        <div className={depStyles.schedulePanel}>
          <div className={depStyles.schedulePanelHead}>
            <span className={depStyles.schedIcon}>{CAT_ICON[activeSchedule.asset.category] ?? '🏭'}</span>
            <div>
              <h3 className={depStyles.schedTitle}>{activeSchedule.asset.name}</h3>
              <p className={depStyles.schedSub}>
                {activeSchedule.asset.code} · {activeSchedule.asset.method === 'SLM' ? 'Straight Line Method' : 'Written Down Value Method'}
                · Purchased {fmt(activeSchedule.asset.purchase_date)}
              </p>
            </div>
            <button className={styles.ghostBtn} style={{ marginLeft:'auto' }} onClick={() => setSelectedAssetId(null)}>
              Close ✕
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Financial Year</th>
                  <th>Opening Value</th>
                  <th>Depreciation</th>
                  <th>Dep. Rate</th>
                  <th>Closing / Book Value</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {activeSchedule.schedule.map((e, i) => (
                  <tr key={e.id} className={i === activeSchedule.schedule.length - 1 ? depStyles.currentYearRow : ''}>
                    <td className={styles.mono}>{e.fin_year}</td>
                    <td className={styles.mono}>{fmtCr(e.opening_value)}</td>
                    <td className={`${styles.mono} ${depStyles.numAmber}`}>{fmtCr(e.dep_amount)}</td>
                    <td className={styles.mono}>
                      {activeSchedule.asset.method === 'SLM'
                        ? `${(e.dep_amount / activeSchedule.asset.purchase_cost * 100).toFixed(1)}%`
                        : `${activeSchedule.asset.wdv_rate}%`}
                    </td>
                    <td className={`${styles.mono} ${depStyles.numGreen}`}>{fmtCr(e.closing_value)}</td>
                    <td>
                      <span className={`${depStyles.methodBadge} ${activeSchedule.asset.method === 'SLM' ? depStyles.methodSLM : depStyles.methodWDV}`}>
                        {e.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={depStyles.totalRow}>
                  <td><strong>Total</strong></td>
                  <td>—</td>
                  <td className={`${styles.mono} ${depStyles.numAmber}`}><strong>{fmtCr(activeSchedule.accumulated_dep)}</strong></td>
                  <td>—</td>
                  <td className={`${styles.mono} ${depStyles.numGreen}`}><strong>{fmtCr(activeSchedule.current_book_value)}</strong></td>
                  <td>—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Full Ledger (all assets, all years) ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableTitle}>Full Depreciation Ledger — All Assets</div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset Code</th><th>Asset Name</th><th>FY</th>
                <th>Method</th>
                <th>Opening Value</th>
                <th>Depreciation</th>
                <th>Closing Value</th>
                <th>% of Cost</th>
              </tr>
            </thead>
            <tbody>
              {summaries.flatMap(({ asset: a, schedule }) =>
                schedule.map(e => (
                  <tr key={e.id}>
                    <td className={styles.mono}>{a.code}</td>
                    <td className={styles.assetNameCell}>{a.name}</td>
                    <td className={styles.mono}>{e.fin_year}</td>
                    <td>
                      <span className={`${depStyles.methodBadge} ${a.method === 'SLM' ? depStyles.methodSLM : depStyles.methodWDV}`}>
                        {a.method}
                      </span>
                    </td>
                    <td className={styles.mono}>{fmtCr(e.opening_value)}</td>
                    <td className={`${styles.mono} ${depStyles.numAmber}`}>{fmtCr(e.dep_amount)}</td>
                    <td className={`${styles.mono} ${depStyles.numGreen}`}>{fmtCr(e.closing_value)}</td>
                    <td className={styles.mono}>
                      {(e.dep_amount / a.purchase_cost * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
