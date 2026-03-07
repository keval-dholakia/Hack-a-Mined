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

const TOOLS = [
  { id: 1, tool_code: 'TL-001', tool_name: 'Vernier Caliper', category: 'Measuring', location: 'QC Lab', condition: 'Good', is_active: 1, purchase_cost: 4500 },
  { id: 2, tool_code: 'TL-002', tool_name: 'Drill Press', category: 'Machine', location: 'Machine Shop', condition: 'Good', is_active: 1, purchase_cost: 28000 },
  { id: 3, tool_code: 'TL-003', tool_name: 'Torque Wrench', category: 'Hand Tool', location: 'Assembly Bay', condition: 'Fair', is_active: 1, purchase_cost: 3200 },
  { id: 4, tool_code: 'TL-004', tool_name: 'Angle Grinder', category: 'Machine', location: 'Fabrication', condition: 'Needs Repair', is_active: 1, purchase_cost: 7800 },
  { id: 5, tool_code: 'TL-005', tool_name: 'Micrometer Set', category: 'Measuring', location: 'QC Lab', condition: 'Good', is_active: 1, purchase_cost: 12500 },
  { id: 6, tool_code: 'TL-006', tool_name: 'MIG Welder', category: 'Machine', location: 'Welding Section', condition: 'Good', is_active: 0, purchase_cost: 45000 },
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

export default function ToolMasterAnalytics() {
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<'overview' | 'health'>('overview')

  const stats = useMemo(() => {
    const total = TOOLS.length
    const active = TOOLS.filter(t => t.is_active === 1).length
    const totalValue = TOOLS.reduce((s, t) => s + (t.purchase_cost ?? 0), 0)
    const needsRepair = TOOLS.filter(t => t.condition === 'Needs Repair').length

    // By category
    const catMap: Record<string, { count: number; value: number }> = {}
    TOOLS.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { count: 0, value: 0 }
      catMap[t.category].count++
      catMap[t.category].value += t.purchase_cost ?? 0
    })
    const catData = Object.entries(catMap).map(([name, d]) => ({ name, count: d.count, value: d.value }))

    // By condition
    const condMap: Record<string, number> = {}
    TOOLS.forEach(t => { condMap[t.condition] = (condMap[t.condition] ?? 0) + 1 })
    const condData = Object.entries(condMap).map(([name, value]) => ({ name, value }))

    // By location
    const locMap: Record<string, number> = {}
    TOOLS.forEach(t => { if (t.location) locMap[t.location] = (locMap[t.location] ?? 0) + 1 })
    const locData = Object.entries(locMap).map(([name, value]) => ({ name, value }))

    // Active vs Inactive
    const statusPie = [
      { name: 'Active', value: active },
      { name: 'Inactive', value: total - active },
    ]

    return { total, active, totalValue, needsRepair, catData, condData, locData, statusPie }
  }, [])

  const tabs = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'health', label: '◉ Health' },
  ] as const

  return (
    <div className={styles.page} ref={reportRef}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tool Master — Analytics</h1>
          <p className={styles.subtitle}>Inventory health · {stats.total} tools · ₹{stats.totalValue.toLocaleString('en-IN')} total value</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <DownloadButton variant="analytics" onClick={() => downloadAnalysisPdf(reportRef, 'Tool_Master_Analytics')} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/maintenance/tool-master')}>← Back to List</Button>
        </div>
      </div>

      <div className={styles.kpiStrip}>
        <KPI icon="◈" label="Total Tools" value={String(stats.total)} color={ACCENT} />
        <KPI icon="◉" label="Active" value={String(stats.active)} color={GREEN} />
        <KPI icon="◎" label="Inactive" value={String(stats.total - stats.active)} color={RED} />
        <KPI icon="▣" label="Needs Repair" value={String(stats.needsRepair)} color={AMBER} />
        <KPI icon="⬡" label="Total Value" value={`₹${stats.totalValue.toLocaleString('en-IN')}`} color={ACCENT} />
        <KPI icon="◇" label="Categories" value={String(stats.catData.length)} color="#a78bfa" />
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
          <Card title="Tools by Category">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.catData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Tools" radius={[6, 6, 0, 0]}>
                    {stats.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Active vs Inactive">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={90} innerRadius={50} paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    <Cell fill={GREEN} />
                    <Cell fill={RED} />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Value by Category" action={<span className={styles.badge}>₹ purchase cost</span>}>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.catData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />} />
                  <Bar dataKey="value" name="Value" radius={[0, 6, 6, 0]}>
                    {stats.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Tools by Location">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.locData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={100} paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {stats.locData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {tab === 'health' && (
        <div className={styles.grid}>
          <Card title="Condition Breakdown">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.condData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    outerRadius={95} innerRadius={48} paddingAngle={4}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.condData.map((_, i) => (
                      <Cell key={i} fill={[GREEN, AMBER, RED, '#8b8fa8'][i % 4]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Health Summary">
            <div className={styles.healthPanel}>
              {[
                { label: 'Good Condition', val: TOOLS.filter(t => t.condition === 'Good').length, color: GREEN, pct: TOOLS.filter(t => t.condition === 'Good').length / TOOLS.length * 100 },
                { label: 'Fair Condition', val: TOOLS.filter(t => t.condition === 'Fair').length, color: AMBER, pct: TOOLS.filter(t => t.condition === 'Fair').length / TOOLS.length * 100 },
                { label: 'Needs Repair', val: TOOLS.filter(t => t.condition === 'Needs Repair').length, color: RED, pct: TOOLS.filter(t => t.condition === 'Needs Repair').length / TOOLS.length * 100 },
                { label: 'Active Rate', val: stats.active, color: ACCENT, pct: stats.active / TOOLS.length * 100 },
              ].map(r => (
                <div key={r.label} className={styles.healthRow}>
                  <span className={styles.healthLabel}>{r.label}</span>
                  <div className={styles.healthBar}>
                    <div className={styles.healthFill} style={{ width: `${r.pct.toFixed(0)}%`, background: r.color }} />
                  </div>
                  <span className={styles.healthPct} style={{ color: r.color }}>{r.val} tools ({r.pct.toFixed(0)}%)</span>
                </div>
              ))}
              <div className={styles.insight}>
                <span className={styles.insightIcon}>💡</span>
                <span>
                  {stats.needsRepair > 0
                    ? `${stats.needsRepair} tool(s) need immediate repair — raise rectification memos.`
                    : 'All tools are in serviceable condition. '}
                  Total inventory value: <strong>₹{stats.totalValue.toLocaleString('en-IN')}</strong>.
                </span>
              </div>
            </div>
          </Card>

          <Card title="Tool Inventory List" action={<span className={styles.badge}>all tools</span>}>
            <div className={styles.summaryTable}>
              <table>
                <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Condition</th><th>Value</th><th>Status</th></tr></thead>
                <tbody>
                  {TOOLS.map((t, i) => (
                    <tr key={t.id}>
                      <td><span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />{t.tool_code}</td>
                      <td>{t.tool_name}</td>
                      <td>{t.category}</td>
                      <td><span className={styles.condPill} style={{
                        background: t.condition === 'Good' ? `${GREEN}20` : t.condition === 'Fair' ? `${AMBER}20` : `${RED}20`,
                        color: t.condition === 'Good' ? GREEN : t.condition === 'Fair' ? AMBER : RED,
                      }}>{t.condition}</span></td>
                      <td style={{ fontFamily: 'var(--mono)' }}>₹{(t.purchase_cost ?? 0).toLocaleString('en-IN')}</td>
                      <td><span style={{ color: t.is_active ? GREEN : RED, fontSize: '0.75rem', fontWeight: 600 }}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
