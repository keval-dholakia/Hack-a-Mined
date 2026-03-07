'use client'

import { useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadAnalysisPdf } from '@/lib/pdf/downloadAnalysisPdf'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import styles from './MaintenanceAnalytics.module.scss'

const COLORS = ['#6c8fff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
const ACCENT = '#6c8fff'
const GREEN = '#4ade80'
const AMBER = '#fbbf24'
const RED = '#f87171'
const MUTED = '#8b8fa8'

const MEMOS = [
  { id: 1, memo_number: 'RM-2024-001', tool_code: 'TL-004', tool_name: 'Angle Grinder', issue_date: '2024-01-08', status: 'In Progress', cost: 850 },
  { id: 2, memo_number: 'RM-2024-002', tool_code: 'TL-002', tool_name: 'Drill Press', issue_date: '2024-03-05', status: 'Resolved', cost: 2400 },
  { id: 3, memo_number: 'RM-2024-003', tool_code: 'TL-003', tool_name: 'Torque Wrench', issue_date: '2024-02-20', status: 'Open', cost: null },
  { id: 4, memo_number: 'RM-2023-008', tool_code: 'TL-001', tool_name: 'Vernier Caliper', issue_date: '2023-10-14', status: 'Resolved', cost: 0 },
  { id: 5, memo_number: 'RM-2023-012', tool_code: 'TL-004', tool_name: 'Angle Grinder', issue_date: '2023-12-01', status: 'Scrapped', cost: null },
]

function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>
          {p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiIcon} style={{ color, background: `${color}18` }}>{icon}</div>
      <div>
        <p className={styles.kpiLabel}>{label}</p>
        <p className={styles.kpiValue} style={{ color }}>{value}</p>
      </div>
    </div>
  )
}

const STATUS_COLOR: Record<string, string> = {
  'Open': RED,
  'In Progress': AMBER,
  'Resolved': GREEN,
  'Scrapped': MUTED,
}

export default function RectificationAnalytics() {
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<'overview' | 'cost'>('overview')

  const stats = useMemo(() => {
    const total = MEMOS.length
    const totalCost = MEMOS.reduce((s, m) => s + (m.cost ?? 0), 0)
    const open = MEMOS.filter(m => m.status === 'Open').length
    const inProgress = MEMOS.filter(m => m.status === 'In Progress').length
    const resolved = MEMOS.filter(m => m.status === 'Resolved').length
    const scrapped = MEMOS.filter(m => m.status === 'Scrapped').length
    const resolveRate = Math.round((resolved + scrapped) / total * 100)

    const statusData = [
      { name: 'Open', value: open },
      { name: 'In Progress', value: inProgress },
      { name: 'Resolved', value: resolved },
      { name: 'Scrapped', value: scrapped },
    ]

    // Cost by tool
    const costMap: Record<string, number> = {}
    MEMOS.forEach(m => { costMap[m.tool_name] = (costMap[m.tool_name] ?? 0) + (m.cost ?? 0) })
    const costData = Object.entries(costMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Memos by tool (count)
    const toolMap: Record<string, number> = {}
    MEMOS.forEach(m => { toolMap[m.tool_name] = (toolMap[m.tool_name] ?? 0) + 1 })
    const perToolData = Object.entries(toolMap).map(([name, value]) => ({ name, value }))

    return { total, totalCost, open, inProgress, resolved, scrapped, resolveRate, statusData, costData, perToolData }
  }, [])

  const tabs = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'cost', label: '◈ Cost' },
  ] as const

  return (
    <div className={styles.page} ref={reportRef}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rectification — Analytics</h1>
          <p className={styles.subtitle}>{stats.total} memos · ₹{stats.totalCost.toLocaleString('en-IN')} total repair cost · {stats.resolveRate}% resolution rate</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <DownloadButton variant="analytics" onClick={() => downloadAnalysisPdf(reportRef, 'Rectification_Analytics')} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/maintenance/rectification')}>← Back to List</Button>
        </div>
      </div>

      <div className={styles.kpiStrip}>
        <KPI icon="◈" label="Total Memos" value={String(stats.total)} color={ACCENT} />
        <KPI icon="◉" label="Open" value={String(stats.open)} color={RED} />
        <KPI icon="◎" label="In Progress" value={String(stats.inProgress)} color={AMBER} />
        <KPI icon="▣" label="Resolved" value={String(stats.resolved)} color={GREEN} />
        <KPI icon="⬡" label="Scrapped" value={String(stats.scrapped)} color={MUTED} />
        <KPI icon="◇" label="Total Repair Cost" value={`₹${stats.totalCost.toLocaleString('en-IN')}`} color={ACCENT} />
      </div>

      <div className={styles.tabBar}>
        {tabs.map(t => (
          <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={styles.grid}>
          <Card title="Status Distribution">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.statusData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill={RED} />
                    <Cell fill={AMBER} />
                    <Cell fill={GREEN} />
                    <Cell fill={MUTED} />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Memos per Tool">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.perToolData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Memos" radius={[0, 6, 6, 0]}>
                    {stats.perToolData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Resolution Health">
            <div className={styles.healthPanel}>
              {[
                { label: 'Open', val: stats.open, color: RED, pct: stats.open / stats.total * 100 },
                { label: 'In Progress', val: stats.inProgress, color: AMBER, pct: stats.inProgress / stats.total * 100 },
                { label: 'Resolved', val: stats.resolved, color: GREEN, pct: stats.resolved / stats.total * 100 },
                { label: 'Scrapped', val: stats.scrapped, color: MUTED, pct: stats.scrapped / stats.total * 100 },
              ].map(r => (
                <div key={r.label} className={styles.healthRow}>
                  <span className={styles.healthLabel}>{r.label}</span>
                  <div className={styles.healthBar}>
                    <div className={styles.healthFill} style={{ width: `${r.pct.toFixed(0)}%`, background: r.color }} />
                  </div>
                  <span className={styles.healthPct} style={{ color: r.color }}>{r.val} memos ({r.pct.toFixed(0)}%)</span>
                </div>
              ))}
              <div className={styles.insight}>
                <span className={styles.insightIcon}>💡</span>
                <span>
                  {stats.open > 0
                    ? `${stats.open} memo(s) are still open — ensure tools are quarantined.`
                    : 'No open issues. '}
                  Resolution rate: <strong>{stats.resolveRate}%</strong>.
                  Total repair spend: <strong>₹{stats.totalCost.toLocaleString('en-IN')}</strong>.
                </span>
              </div>
            </div>
          </Card>

          <Card title="Memo Summary">
            <div className={styles.summaryTable}>
              <table>
                <thead><tr><th>Memo No.</th><th>Tool</th><th>Issue Date</th><th>Status</th><th>Cost</th></tr></thead>
                <tbody>
                  {MEMOS.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontFamily: 'var(--mono)' }}>{m.memo_number}</td>
                      <td><span className={styles.dot} style={{ background: COLORS[MEMOS.indexOf(m) % COLORS.length] }} />{m.tool_code} {m.tool_name}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{new Date(m.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><span className={styles.condPill} style={{ background: `${STATUS_COLOR[m.status]}20`, color: STATUS_COLOR[m.status] }}>{m.status}</span></td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{m.cost !== null ? `₹${m.cost.toLocaleString('en-IN')}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === 'cost' && (
        <div className={styles.grid}>
          <Card title="Repair Cost by Tool" action={<span className={styles.badge}>₹ total spend</span>}>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.costData} layout="vertical" barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />} />
                  <Bar dataKey="value" name="Repair Cost" radius={[0, 6, 6, 0]}>
                    {stats.costData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Cost Analysis">
            <div className={styles.healthPanel}>
              <div className={styles.costSummary}>
                <div className={styles.costItem}>
                  <span className={styles.costLabel}>Total Repair Spend</span>
                  <span className={styles.costValue} style={{ color: ACCENT }}>₹{stats.totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.costItem}>
                  <span className={styles.costLabel}>Average per Memo (with cost)</span>
                  <span className={styles.costValue} style={{ color: GREEN }}>
                    ₹{(MEMOS.filter(m => m.cost != null && m.cost > 0).reduce((s, m) => s + (m.cost ?? 0), 0) /
                      Math.max(MEMOS.filter(m => m.cost != null && m.cost > 0).length, 1)).toFixed(0)}
                  </span>
                </div>
                <div className={styles.costItem}>
                  <span className={styles.costLabel}>Highest Single Repair</span>
                  <span className={styles.costValue} style={{ color: RED }}>
                    ₹{Math.max(...MEMOS.map(m => m.cost ?? 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={styles.costItem}>
                  <span className={styles.costLabel}>Memos with No Cost Data</span>
                  <span className={styles.costValue} style={{ color: MUTED }}>{MEMOS.filter(m => m.cost == null).length}</span>
                </div>
              </div>
              <div className={styles.insight}>
                <span className={styles.insightIcon}>💡</span>
                <span>
                  Most repairs on <strong>Angle Grinder (TL-004)</strong> — consider replacement evaluation.
                  In-house repairs saved costs vs external service.
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
