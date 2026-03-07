'use client'

import { useMemo, useState } from 'react'
import { JobOrderRecord, STATUS_COLOR, PRIORITY_COLOR } from './JobOrder'
import joStyles from './JobOrder.module.scss'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = ['#6366f1','#22d3ee','#a78bfa','#34d399','#fb923c','#f472b6','#facc15','#60a5fa','#4ade80','#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e', PURPLE = '#a78bfa'

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={joStyles.tooltip}>
      {label && <p className={joStyles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon:string; label:string; value:string; color:string }) {
  return (
    <div className={joStyles.kpiCard}>
      <div className={joStyles.kpiIcon} style={{ color, background:`${color}18` }}>{icon}</div>
      <div><p className={joStyles.kpiLabel}>{label}</p><p className={joStyles.kpiValue} style={{ color }}>{value}</p></div>
    </div>
  )
}

interface Props { records: JobOrderRecord[]; onClose: () => void }

export default function JobOrderAnalytics({ records, onClose }: Props) {
  const [tab, setTab] = useState<'overview'|'workcenters'|'operators'|'trend'>('overview')

  const stats = useMemo(() => {
    const total       = records.length
    const completed   = records.filter(r=>r.status==='Completed').length
    const inProgress  = records.filter(r=>r.status==='In Progress').length
    const planned     = records.filter(r=>r.status==='Planned').length
    const onHold      = records.filter(r=>r.status==='On Hold').length
    const cancelled   = records.filter(r=>r.status==='Cancelled').length
    const draft       = records.filter(r=>r.status==='Draft').length
    const completionRate = total ? Math.round(completed/total*100) : 0
    const totalQty    = records.reduce((s,r)=>s+r.qty, 0)

    // Hours
    const totalEstHrs = records.reduce((s,r)=>s+r.operations.reduce((a,o)=>a+o.est_hrs,0),0)
    const totalActHrs = records.reduce((s,r)=>s+r.operations.reduce((a,o)=>a+o.actual_hrs,0),0)
    const efficiency  = totalEstHrs > 0 ? Math.round(totalActHrs/totalEstHrs*100) : 0

    const statusPie = [
      {name:'Completed',value:completed},{name:'In Progress',value:inProgress},
      {name:'Planned',value:planned},{name:'On Hold',value:onHold},
      {name:'Cancelled',value:cancelled},{name:'Draft',value:draft},
    ].filter(s=>s.value>0)

    const prioMap: Record<string,number> = {Low:0,Medium:0,High:0,Urgent:0}
    records.forEach(r=>{prioMap[r.priority]++})
    const prioPie = Object.entries(prioMap).map(([name,value])=>({name,value})).filter(s=>s.value>0)

    // Monthly trend – last 12 months
    const now = new Date()
    const monthData = Array.from({length:12},(_,m)=>{
      const d   = new Date(now.getFullYear(),now.getMonth()-11+m,1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const lbl = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
      const mos = records.filter(r=>r.planned_start.startsWith(key))
      return { label:lbl, total:mos.length, completed:mos.filter(r=>r.status==='Completed').length }
    })

    // Work center breakdown
    const wcMap: Record<string,{total:number;completed:number;estHrs:number;actHrs:number}> = {}
    records.forEach(r=>{
      if(!wcMap[r.work_center]) wcMap[r.work_center]={total:0,completed:0,estHrs:0,actHrs:0}
      wcMap[r.work_center].total++
      if(r.status==='Completed') wcMap[r.work_center].completed++
      wcMap[r.work_center].estHrs += r.operations.reduce((a,o)=>a+o.est_hrs,0)
      wcMap[r.work_center].actHrs += r.operations.reduce((a,o)=>a+o.actual_hrs,0)
    })
    const wcData = Object.entries(wcMap).sort((a,b)=>b[1].total-a[1].total).map(([name,d])=>({name,...d,eff:d.estHrs?Math.round(d.actHrs/d.estHrs*100):0}))

    // Operator breakdown
    const opMap: Record<string,{total:number;completed:number;qty:number}> = {}
    records.forEach(r=>{
      if(!opMap[r.operator]) opMap[r.operator]={total:0,completed:0,qty:0}
      opMap[r.operator].total++
      if(r.status==='Completed') opMap[r.operator].completed++
      opMap[r.operator].qty += r.qty
    })
    const operatorData = Object.entries(opMap).sort((a,b)=>b[1].total-a[1].total).map(([name,d])=>({name:name.split(' ')[0], fullName:name, ...d, rate:d.total?Math.round(d.completed/d.total*100):0}))

    // Operations frequency
    const opsFreq: Record<string,number> = {}
    records.forEach(r=>r.operations.forEach(o=>{opsFreq[o.operation]=(opsFreq[o.operation]??0)+1}))
    const topOps = Object.entries(opsFreq).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name,value}))

    const radarData = wcData.slice(0,6).map(w=>({ wc:w.name.length>8?w.name.slice(0,8)+'…':w.name, total:w.total, completed:w.completed }))

    return { total,completed,inProgress,planned,onHold,cancelled,draft,completionRate,totalQty,totalEstHrs,totalActHrs,efficiency,statusPie,prioPie,monthData,wcData,operatorData,topOps,radarData }
  },[records])

  const tabs = [
    {id:'overview',label:'⊞ Overview'},{id:'workcenters',label:'◈ Work Centers'},
    {id:'operators',label:'◉ Operators'},{id:'trend',label:'◎ Trend & Health'},
  ] as const

  return (
    <div className={joStyles.analyticsPage}>
      <div className={joStyles.analyticsHeader}>
        <div>
          <h1 className={joStyles.analyticsTitle}>Job Order Analytics</h1>
          <p className={joStyles.analyticsSub}>360° production data visualization · {stats.total} orders</p>
        </div>
        <button className={joStyles.backBtn} onClick={onClose}>← Back to List</button>
      </div>

      {/* KPI Strip */}
      <div className={joStyles.kpiStrip}>
        <KPI icon="◈" label="Total JOs"       value={String(stats.total)}          color={ACCENT}  />
        <KPI icon="◉" label="Completed"        value={String(stats.completed)}      color={GREEN}   />
        <KPI icon="▣" label="In Progress"      value={String(stats.inProgress)}     color={ACCENT}  />
        <KPI icon="⬡" label="Completion Rate"  value={`${stats.completionRate}%`}  color={AMBER}   />
        <KPI icon="◎" label="Total Quantity"   value={String(stats.totalQty)}       color={CYAN}    />
        <KPI icon="◇" label="Est vs Act Hrs"   value={`${stats.totalEstHrs}h / ${stats.totalActHrs}h`} color={PURPLE} />
      </div>

      {/* Tabs */}
      <div className={joStyles.tabBar}>
        {tabs.map(t=>(
          <button key={t.id} className={`${joStyles.aTab} ${tab===t.id?joStyles.aTabActive:''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div className={joStyles.aGrid}>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Status Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4} label={({name,percent})=>`${name.split(' ')[0]} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.statusPie.map((e,i)=><Cell key={i} fill={STATUS_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Priority Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.prioPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4} label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.prioPie.map((e,i)=><Cell key={i} fill={PRIORITY_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Top Operations by Frequency</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topOps} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false}/>
                <XAxis type="number" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis type="category" dataKey="name" width={100} tick={{fill:'#9ca3af',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>{stats.topOps.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Status Summary</p>
            <table className={joStyles.sTable}>
              <thead><tr><th>Status</th><th>Count</th><th>%</th><th>Share</th></tr></thead>
              <tbody>{stats.statusPie.map(row=>(
                <tr key={row.name}>
                  <td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:STATUS_COLOR[row.name],marginRight:8}}/>{row.name}</td>
                  <td className={joStyles.mono}>{row.value}</td>
                  <td className={joStyles.mono}>{stats.total?(row.value/stats.total*100).toFixed(1):0}%</td>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{height:6,width:`${stats.total?row.value/stats.total*100:0}%`,maxWidth:80,background:STATUS_COLOR[row.name],borderRadius:4,minWidth:2}}/><span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{row.value}</span></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* WORK CENTERS */}
      {tab==='workcenters' && (
        <div className={joStyles.aGrid}>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>JOs by Work Center</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.wcData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="completed" name="Completed" fill={GREEN} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Work Center Radar</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={100}>
                <PolarGrid stroke="#1f2235"/><PolarAngleAxis dataKey="wc" tick={{fill:'#9ca3af',fontSize:11}}/><PolarRadiusAxis tick={{fill:'#4b5563',fontSize:10}}/>
                <Radar name="Total" dataKey="total" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15}/>
                <Radar name="Completed" dataKey="completed" stroke={GREEN} fill={GREEN} fillOpacity={0.15}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/><Tooltip content={<DarkTooltip/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={joStyles.aCardTitle}>Work Center Detail</p>
            <table className={joStyles.sTable}>
              <thead><tr><th>Work Center</th><th>Total JOs</th><th>Completed</th><th>Est. Hrs</th><th>Act. Hrs</th><th>Efficiency</th></tr></thead>
              <tbody>{stats.wcData.map((w,i)=>(
                <tr key={w.name}>
                  <td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length],marginRight:8}}/><strong>{w.name}</strong></td>
                  <td className={joStyles.mono}>{w.total}</td>
                  <td className={joStyles.mono} style={{color:GREEN}}>{w.completed}</td>
                  <td className={joStyles.mono}>{w.estHrs}h</td>
                  <td className={joStyles.mono}>{w.actHrs}h</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:w.eff<=100?`${GREEN}22`:`${ROSE}22`,color:w.eff<=100?GREEN:ROSE}}>{w.eff}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPERATORS */}
      {tab==='operators' && (
        <div className={joStyles.aGrid}>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Operator — Total vs Completed</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.operatorData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="total" name="Total" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="completed" name="Completed" fill={GREEN} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Operator Leaderboard</p>
            <table className={joStyles.sTable}>
              <thead><tr><th>#</th><th>Operator</th><th>JOs</th><th>Completed</th><th>Total Qty</th><th>Completion %</th></tr></thead>
              <tbody>{[...stats.operatorData].sort((a,b)=>b.rate-a.rate).map((op,i)=>(
                <tr key={op.fullName}>
                  <td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td>
                  <td><strong>{op.fullName}</strong></td>
                  <td className={joStyles.mono}>{op.total}</td>
                  <td className={joStyles.mono} style={{color:GREEN}}>{op.completed}</td>
                  <td className={joStyles.mono}>{op.qty}</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:op.rate>=50?`${GREEN}22`:`${AMBER}22`,color:op.rate>=50?GREEN:AMBER}}>{op.rate}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREND & HEALTH */}
      {tab==='trend' && (
        <div className={joStyles.aGrid}>
          <div className={joStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={joStyles.aCardTitle}>12-Month JO Trend <span className={joStyles.aBadge}>planned · completed</span></p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235"/>
                <XAxis dataKey="label" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1}/>
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line type="monotone" dataKey="total" name="Planned" stroke={ACCENT} strokeWidth={2.5} dot={{fill:ACCENT,r:4}} activeDot={{r:6}}/>
                <Line type="monotone" dataKey="completed" name="Completed" stroke={GREEN} strokeWidth={2} dot={{fill:GREEN,r:3}}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Outcome Mix</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={[{name:'Completed',value:stats.completed},{name:'In Progress',value:stats.inProgress},{name:'Open/Planned',value:stats.planned+stats.draft},{name:'On Hold',value:stats.onHold},{name:'Cancelled',value:stats.cancelled}].filter(d=>d.value>0)}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} paddingAngle={3}
                label={({name,percent})=>`${((percent??0)*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={GREEN}/><Cell fill={ACCENT}/><Cell fill={CYAN}/><Cell fill={AMBER}/><Cell fill={ROSE}/>
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={joStyles.aCard}>
            <p className={joStyles.aCardTitle}>Production Health</p>
            <div className={joStyles.healthPanel}>
              {[
                {label:'Completion Rate', val:stats.completionRate,                                                  color:GREEN},
                {label:'In Progress',     val:stats.total?Math.round(stats.inProgress/stats.total*100):0,             color:ACCENT},
                {label:'On Hold / Risk',  val:stats.total?Math.round((stats.onHold+stats.cancelled)/stats.total*100):0,color:ROSE},
              ].map(row=>(
                <div key={row.label} className={joStyles.hRow}>
                  <span className={joStyles.hLabel}>{row.label}</span>
                  <div className={joStyles.hTrack}><div className={joStyles.hFill} style={{width:`${row.val}%`,background:row.color}}/></div>
                  <span className={joStyles.hPct} style={{color:row.color}}>{row.val}%</span>
                </div>
              ))}
              <div className={joStyles.insight}>
                <span>
                  {stats.completionRate>=70?'Excellent production flow — over 70% JOs completed.':stats.completionRate>=50?'Good progress. Monitor in-progress orders for delays.':'Focus on clearing backlog and resolving on-hold orders.'}
                  {' '}Total estimated <strong>{stats.totalEstHrs}h</strong>, actual <strong>{stats.totalActHrs}h</strong> logged across <strong>{stats.total}</strong> job orders.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
