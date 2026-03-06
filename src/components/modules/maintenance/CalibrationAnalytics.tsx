'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import styles from './MaintenanceAnalytics.module.scss'

const COLORS = ['#6c8fff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']
const ACCENT = '#6c8fff'
const GREEN  = '#4ade80'
const AMBER  = '#fbbf24'
const RED    = '#f87171'

const RECORDS = [
  { id:1, tool_code:'TL-001', tool_name:'Vernier Caliper',  calibration_date:'2024-01-15', next_due_date:'2025-01-15', done_by:'National Test House', result:'Pass'        },
  { id:2, tool_code:'TL-005', tool_name:'Micrometer Set',   calibration_date:'2024-02-10', next_due_date:'2025-02-10', done_by:'National Test House', result:'Pass'        },
  { id:3, tool_code:'TL-003', tool_name:'Torque Wrench',    calibration_date:'2023-11-20', next_due_date:'2024-11-20', done_by:'In-house QC Team',    result:'Conditional' },
  { id:4, tool_code:'TL-001', tool_name:'Vernier Caliper',  calibration_date:'2023-01-10', next_due_date:'2024-01-10', done_by:'National Test House', result:'Pass'        },
  { id:5, tool_code:'TL-002', tool_name:'Drill Press',      calibration_date:'2024-03-05', next_due_date:'2025-03-05', done_by:'In-house QC Team',    result:'Fail'        },
  { id:6, tool_code:'TL-005', tool_name:'Micrometer Set',   calibration_date:'2023-02-08', next_due_date:'2024-02-08', done_by:'National Test House', result:'Pass'        },
]

function getDueStatus(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  return diff < 0 ? 'Overdue' : diff <= 30 ? 'Due Soon' : 'OK'
}

function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color:p.color??ACCENT }}>
          {p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon:string; label:string; value:string; color:string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiIcon} style={{ color, background:`${color}18` }}>{icon}</div>
      <div>
        <p className={styles.kpiLabel}>{label}</p>
        <p className={styles.kpiValue} style={{ color }}>{value}</p>
      </div>
    </div>
  )
}

export default function CalibrationAnalytics() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview'|'tools'>('overview')

  const stats = useMemo(() => {
    const total     = RECORDS.length
    const passRate  = Math.round(RECORDS.filter(r=>r.result==='Pass').length / total * 100)
    const overdue   = RECORDS.filter(r=>getDueStatus(r.next_due_date)==='Overdue').length
    const dueSoon   = RECORDS.filter(r=>getDueStatus(r.next_due_date)==='Due Soon').length

    const resultData = [
      { name:'Pass',        value: RECORDS.filter(r=>r.result==='Pass').length        },
      { name:'Fail',        value: RECORDS.filter(r=>r.result==='Fail').length        },
      { name:'Conditional', value: RECORDS.filter(r=>r.result==='Conditional').length },
    ]

    const dueData = [
      { name:'OK',       value: RECORDS.filter(r=>getDueStatus(r.next_due_date)==='OK').length       },
      { name:'Due Soon', value: dueSoon  },
      { name:'Overdue',  value: overdue  },
    ]

    // Calibrations per tool
    const toolMap: Record<string,number> = {}
    RECORDS.forEach(r => { toolMap[r.tool_name] = (toolMap[r.tool_name]??0)+1 })
    const perToolData = Object.entries(toolMap).map(([name,value]) => ({ name, value }))

    // By lab/agency
    const labMap: Record<string,number> = {}
    RECORDS.forEach(r => { labMap[r.done_by] = (labMap[r.done_by]??0)+1 })
    const labData = Object.entries(labMap).map(([name,value]) => ({ name,value }))

    return { total, passRate, overdue, dueSoon, resultData, dueData, perToolData, labData }
  }, [])

  const tabs = [
    { id:'overview', label:'⊞ Overview' },
    { id:'tools',    label:'◇ By Tool'  },
  ] as const

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calibration — Analytics</h1>
          <p className={styles.subtitle}>{stats.total} records · {stats.passRate}% pass rate</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/maintenance/calibration')}>← Back to List</Button>
      </div>

      <div className={styles.kpiStrip}>
        <KPI icon="◈" label="Total Records"   value={String(stats.total)}          color={ACCENT} />
        <KPI icon="◉" label="Pass Rate"        value={`${stats.passRate}%`}         color={GREEN}  />
        <KPI icon="◎" label="Overdue"          value={String(stats.overdue)}        color={RED}    />
        <KPI icon="▣" label="Due in 30 Days"   value={String(stats.dueSoon)}        color={AMBER}  />
        <KPI icon="⬡" label="Passed"           value={String(stats.resultData[0].value)} color={GREEN}  />
        <KPI icon="◇" label="Failed"           value={String(stats.resultData[1].value)} color={RED}    />
      </div>

      <div className={styles.tabBar}>
        {tabs.map(t => (
          <button key={t.id} className={`${styles.tab} ${tab===t.id?styles.tabActive:''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className={styles.grid}>
          <Card title="Result Distribution">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.resultData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent??0)*100).toFixed(0)}%`}>
                    <Cell fill={GREEN} />
                    <Cell fill={RED}   />
                    <Cell fill={AMBER} />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color:'var(--text-muted)', fontSize:'0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Calibration Due Status">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.dueData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5}
                    label={({ name, percent }) => `${name} ${((percent??0)*100).toFixed(0)}%`}>
                    <Cell fill={GREEN} />
                    <Cell fill={AMBER} />
                    <Cell fill={RED}   />
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color:'var(--text-muted)', fontSize:'0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Records by Lab / Agency">
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.labData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:'#6b7280', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Records" radius={[6,6,0,0]}>
                    {stats.labData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Health Overview">
            <div className={styles.healthPanel}>
              {[
                { label:'Pass Rate',         val:`${stats.resultData[0].value}/${stats.total}`, color:GREEN,  pct: stats.resultData[0].value/stats.total*100 },
                { label:'Fail Rate',         val:`${stats.resultData[1].value}/${stats.total}`, color:RED,    pct: stats.resultData[1].value/stats.total*100 },
                { label:'Conditional Rate',  val:`${stats.resultData[2].value}/${stats.total}`, color:AMBER,  pct: stats.resultData[2].value/stats.total*100 },
                { label:'Calibrations OK',   val:`${stats.total-stats.overdue-stats.dueSoon}/${stats.total}`, color:ACCENT, pct:(stats.total-stats.overdue-stats.dueSoon)/stats.total*100 },
              ].map(r => (
                <div key={r.label} className={styles.healthRow}>
                  <span className={styles.healthLabel}>{r.label}</span>
                  <div className={styles.healthBar}>
                    <div className={styles.healthFill} style={{ width:`${r.pct.toFixed(0)}%`, background:r.color }} />
                  </div>
                  <span className={styles.healthPct} style={{ color:r.color }}>{r.val}</span>
                </div>
              ))}
              <div className={styles.insight}>
                <span className={styles.insightIcon}>💡</span>
                <span>
                  {stats.overdue > 0
                    ? `${stats.overdue} calibration(s) are overdue — schedule immediately.`
                    : 'All calibrations are within schedule. '}
                  {stats.dueSoon > 0 && ` ${stats.dueSoon} coming due within 30 days.`}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'tools' && (
        <div className={styles.grid}>
          <Card title="Calibrations per Tool" action={<span className={styles.badge}>total records</span>}>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.perToolData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                  <XAxis type="number" tick={{ fill:'#6b7280', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill:'#9ca3af', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Calibrations" radius={[0,6,6,0]}>
                    {stats.perToolData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="All Calibration Records">
            <div className={styles.summaryTable}>
              <table>
                <thead><tr><th>Tool</th><th>Date</th><th>Next Due</th><th>Done By</th><th>Due Status</th><th>Result</th></tr></thead>
                <tbody>
                  {RECORDS.map(r => {
                    const due = getDueStatus(r.next_due_date)
                    return (
                      <tr key={r.id}>
                        <td><span className={styles.dot} style={{ background: ACCENT }} />{r.tool_code} {r.tool_name}</td>
                        <td style={{ fontFamily:'var(--mono)' }}>{new Date(r.calibration_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td style={{ fontFamily:'var(--mono)' }}>{new Date(r.next_due_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td>{r.done_by}</td>
                        <td><span className={styles.condPill} style={{
                          background: due==='OK'?`${GREEN}20`:due==='Due Soon'?`${AMBER}20`:`${RED}20`,
                          color:       due==='OK'? GREEN      :due==='Due Soon'? AMBER      : RED,
                        }}>{due}</span></td>
                        <td><span className={styles.condPill} style={{
                          background: r.result==='Pass'?`${GREEN}20`:r.result==='Fail'?`${RED}20`:`${AMBER}20`,
                          color:       r.result==='Pass'? GREEN      :r.result==='Fail'? RED      : AMBER,
                        }}>{r.result}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
