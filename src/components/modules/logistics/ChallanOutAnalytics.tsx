'use client'

import { useMemo, useState } from 'react'
import { ChallanOutRecord, STATUS_COLOR, TYPE_COLOR } from './ChallanOut'
import cStyles from './ChallanOut.module.scss'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = ['#6366f1','#22d3ee','#a78bfa','#34d399','#fb923c','#f472b6','#facc15','#60a5fa']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'
const fmtCur = (n: number) => n>=1_00_000?`₹${(n/1_00_000).toFixed(1)}L`:`₹${n.toLocaleString('en-IN')}`
const grandTotal = (items: {qty:number;rate:number}[]) => items.reduce((s,i)=>s+i.qty*i.rate,0)

function DarkTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={cStyles.tooltip}>
      {label && <p className={cStyles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>{p.name}: <strong>{fmt ? fmt(p.value) : p.value}</strong></p>
      ))}
    </div>
  )
}

function KPI({ icon, label, value, color }: { icon:string; label:string; value:string; color:string }) {
  return (
    <div className={cStyles.kpiCard}>
      <div className={cStyles.kpiIcon} style={{ color, background:`${color}18` }}>{icon}</div>
      <div><p className={cStyles.kpiLabel}>{label}</p><p className={cStyles.kpiValue} style={{ color }}>{value}</p></div>
    </div>
  )
}

interface Props { records: ChallanOutRecord[]; onClose: () => void }

export default function ChallanOutAnalytics({ records, onClose }: Props) {
  const [tab, setTab] = useState<'overview'|'customers'|'transporters'|'trend'>('overview')

  const stats = useMemo(() => {
    const total      = records.length
    const delivered  = records.filter(r=>r.status==='Delivered').length
    const dispatched = records.filter(r=>r.status==='Dispatched').length
    const issued     = records.filter(r=>r.status==='Issued').length
    const returned   = records.filter(r=>r.status==='Returned').length
    const cancelled  = records.filter(r=>r.status==='Cancelled').length
    const draft      = records.filter(r=>r.status==='Draft').length
    const deliveryRate = total?Math.round((delivered)/total*100):0

    const totalValue   = records.reduce((s,r)=>s+grandTotal(r.items),0)
    const deliveredVal = records.filter(r=>r.status==='Delivered').reduce((s,r)=>s+grandTotal(r.items),0)
    const avgValue     = total?Math.round(totalValue/total):0

    const statusPie = [
      {name:'Delivered',value:delivered},{name:'Dispatched',value:dispatched},
      {name:'Issued',value:issued},{name:'Returned',value:returned},
      {name:'Cancelled',value:cancelled},{name:'Draft',value:draft},
    ].filter(s=>s.value>0)

    const typeMap: Record<string,{count:number;value:number}> = {}
    records.forEach(r=>{ if(!typeMap[r.challan_type]) typeMap[r.challan_type]={count:0,value:0}; typeMap[r.challan_type].count++; typeMap[r.challan_type].value+=grandTotal(r.items) })
    const typeData = Object.entries(typeMap).map(([name,d])=>({name,...d}))
    const typePie  = typeData.map(t=>({name:t.name,value:t.count}))

    // Monthly trend
    const now = new Date()
    const monthData = Array.from({length:12},(_,m)=>{
      const d   = new Date(now.getFullYear(),now.getMonth()-11+m,1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const lbl = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
      const mos = records.filter(r=>r.challan_date.startsWith(key))
      return { label:lbl, total:mos.length, delivered:mos.filter(r=>r.status==='Delivered').length, value:mos.reduce((s,r)=>s+grandTotal(r.items),0) }
    })

    // Customer breakdown
    const cMap: Record<string,{count:number;value:number;delivered:number}> = {}
    records.forEach(r=>{ if(!cMap[r.customer]) cMap[r.customer]={count:0,value:0,delivered:0}; cMap[r.customer].count++; cMap[r.customer].value+=grandTotal(r.items); if(r.status==='Delivered') cMap[r.customer].delivered++ })
    const customerData = Object.entries(cMap).sort((a,b)=>b[1].value-a[1].value).map(([name,d])=>({name,...d,shortName:name.split(' ')[0],rate:d.count?Math.round(d.delivered/d.count*100):0}))
    const radarData = customerData.slice(0,6).map(c=>({cust:c.shortName,count:c.count,valueL:Math.round(c.value/1_00_000*100)/100}))

    // Transporter breakdown
    const tMap: Record<string,{count:number;value:number;delivered:number}> = {}
    records.forEach(r=>{ if(!tMap[r.transporter]) tMap[r.transporter]={count:0,value:0,delivered:0}; tMap[r.transporter].count++; tMap[r.transporter].value+=grandTotal(r.items); if(r.status==='Delivered') tMap[r.transporter].delivered++ })
    const transporterData = Object.entries(tMap).sort((a,b)=>b[1].count-a[1].count).map(([name,d])=>({name:name.split(' ')[0],fullName:name,...d,rate:d.count?Math.round(d.delivered/d.count*100):0}))

    return { total,delivered,dispatched,issued,returned,cancelled,draft,deliveryRate,totalValue,deliveredVal,avgValue,statusPie,typePie,typeData,monthData,customerData,radarData,transporterData }
  },[records])

  const tabs = [
    {id:'overview',     label:'⊞ Overview'},
    {id:'customers',    label:'◈ Customers'},
    {id:'transporters', label:'◉ Transporters'},
    {id:'trend',        label:'◎ Trend & Health'},
  ] as const

  return (
    <div className={cStyles.analyticsPage}>
      <div className={cStyles.analyticsHeader}>
        <div>
          <h1 className={cStyles.analyticsTitle}>Challan Out Analytics</h1>
          <p className={cStyles.analyticsSub}>360° dispatch data visualization · {stats.total} challans</p>
        </div>
        <button className={cStyles.backBtn} onClick={onClose}>← Back to List</button>
      </div>

      <div className={cStyles.kpiStrip}>
        <KPI icon="◈" label="Total Challans"  value={String(stats.total)}           color={ACCENT} />
        <KPI icon="◉" label="Delivered"        value={String(stats.delivered)}       color={GREEN}  />
        <KPI icon="▣" label="In Progress"      value={String(stats.dispatched+stats.issued)} color={CYAN} />
        <KPI icon="⬡" label="Delivery Rate"    value={`${stats.deliveryRate}%`}     color={AMBER}  />
        <KPI icon="◎" label="Total Value"      value={fmtCur(stats.totalValue)}      color={GREEN}  />
        <KPI icon="◇" label="Delivered Value"  value={fmtCur(stats.deliveredVal)}    color={'#a78bfa'} />
      </div>

      <div className={cStyles.tabBar}>
        {tabs.map(t=>(
          <button key={t.id} className={`${cStyles.aTab} ${tab===t.id?cStyles.aTabActive:''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div className={cStyles.aGrid}>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Status Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4} label={({name,percent})=>`${name?.split(' ')[0]??''} ${((percent??0)*100).toFixed(0)}%`}>
                {stats.statusPie.map((e,i)=><Cell key={i} fill={STATUS_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Challan Type Split</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={stats.typePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={48} paddingAngle={4} label={({name,percent})=>`${((percent??0)*100).toFixed(0)}%`}>
                {stats.typePie.map((e,i)=><Cell key={i} fill={TYPE_COLOR[e.name]??COLORS[i]}/>)}
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Value by Challan Type</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.typeData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtCur(v)}/>
                <Tooltip content={<DarkTooltip fmt={fmtCur}/>}/>
                <Bar dataKey="value" name="Value" radius={[6,6,0,0]}>{stats.typeData.map((e,i)=><Cell key={i} fill={TYPE_COLOR[e.name]??COLORS[i]}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Status Summary</p>
            <table className={cStyles.sTable}>
              <thead><tr><th>Status</th><th>Count</th><th>%</th><th>Share</th></tr></thead>
              <tbody>{stats.statusPie.map(row=>(
                <tr key={row.name}>
                  <td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:STATUS_COLOR[row.name],marginRight:8}}/>{row.name}</td>
                  <td className={cStyles.mono}>{row.value}</td>
                  <td className={cStyles.mono}>{stats.total?(row.value/stats.total*100).toFixed(1):0}%</td>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{height:6,width:`${stats.total?row.value/stats.total*100:0}%`,maxWidth:80,background:STATUS_COLOR[row.name],borderRadius:4,minWidth:2}}/><span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{row.value}</span></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMERS */}
      {tab==='customers' && (
        <div className={cStyles.aGrid}>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Customer Dispatch Volume & Value</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.customerData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="shortName" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="ct" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis yAxisId="val" orientation="right" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtCur(v)}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar yAxisId="ct" dataKey="count" name="Challans" fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar yAxisId="ct" dataKey="delivered" name="Delivered" fill={GREEN} radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Customer Activity Radar</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={95}>
                <PolarGrid stroke="#1f2235"/><PolarAngleAxis dataKey="cust" tick={{fill:'#9ca3af',fontSize:10}}/><PolarRadiusAxis tick={{fill:'#4b5563',fontSize:9}}/>
                <Radar name="Challans" dataKey="count" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/><Tooltip content={<DarkTooltip/>}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={cStyles.aCardTitle}>Customer Value Detail</p>
            <table className={cStyles.sTable}>
              <thead><tr><th>#</th><th>Customer</th><th>Challans</th><th>Delivered</th><th>Total Value</th><th>Delivery %</th></tr></thead>
              <tbody>{stats.customerData.map((c,i)=>(
                <tr key={c.name}>
                  <td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td>
                  <td><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length],marginRight:8}}/><strong>{c.name}</strong></td>
                  <td className={cStyles.mono}>{c.count}</td>
                  <td className={cStyles.mono} style={{color:GREEN}}>{c.delivered}</td>
                  <td className={cStyles.mono} style={{color:GREEN}}>{c.value>0?fmtCur(c.value):'—'}</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:c.rate>=70?`${GREEN}22`:`${AMBER}22`,color:c.rate>=70?GREEN:AMBER}}>{c.rate}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSPORTERS */}
      {tab==='transporters' && (
        <div className={cStyles.aGrid}>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Transporter Volume</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.transporterData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="count"     name="Total"     fill={ACCENT} radius={[4,4,0,0]}/>
                <Bar dataKey="delivered" name="Delivered" fill={GREEN}  radius={[4,4,0,0]}/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Transporter Leaderboard <span className={cStyles.aBadge}>by delivery rate</span></p>
            <table className={cStyles.sTable}>
              <thead><tr><th>#</th><th>Transporter</th><th>Total</th><th>Delivered</th><th>Rate</th></tr></thead>
              <tbody>{[...stats.transporterData].sort((a,b)=>b.rate-a.rate).map((t,i)=>(
                <tr key={t.fullName}>
                  <td style={{color:'#6b7280',fontFamily:'var(--mono)'}}>#{i+1}</td>
                  <td><strong>{t.fullName}</strong></td>
                  <td className={cStyles.mono}>{t.count}</td>
                  <td className={cStyles.mono} style={{color:GREEN}}>{t.delivered}</td>
                  <td><span style={{padding:'0.2rem 0.55rem',borderRadius:5,fontSize:'0.72rem',fontWeight:700,background:t.rate>=70?`${GREEN}22`:`${AMBER}22`,color:t.rate>=70?GREEN:AMBER}}>{t.rate}%</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREND & HEALTH */}
      {tab==='trend' && (
        <div className={cStyles.aGrid}>
          <div className={cStyles.aCard} style={{gridColumn:'span 2'}}>
            <p className={cStyles.aCardTitle}>12-Month Challan Trend <span className={cStyles.aBadge}>issued · delivered · value</span></p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235"/>
                <XAxis dataKey="label" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={44} interval={1}/>
                <YAxis yAxisId="vol" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <YAxis yAxisId="val" orientation="right" tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtCur(v)}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Line yAxisId="vol" type="monotone" dataKey="total"     name="Issued"    stroke={ACCENT} strokeWidth={2.5} dot={{fill:ACCENT,r:4}} activeDot={{r:6}}/>
                <Line yAxisId="vol" type="monotone" dataKey="delivered" name="Delivered" stroke={GREEN}  strokeWidth={2}   dot={{fill:GREEN,r:3}}/>
                <Line yAxisId="val" type="monotone" dataKey="value"     name="Value"     stroke={AMBER}  strokeWidth={2}   dot={{fill:AMBER,r:3}} strokeDasharray="4 2"/>
                <Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Outcome Mix</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={[{name:'Delivered',value:stats.delivered},{name:'Dispatched',value:stats.dispatched},{name:'Issued',value:stats.issued},{name:'Returned',value:stats.returned},{name:'Cancelled',value:stats.cancelled}].filter(d=>d.value>0)}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} paddingAngle={3}
                label={({name,percent})=>`${((percent??0)*100).toFixed(0)}%`} labelLine={false}>
                <Cell fill={GREEN}/><Cell fill={ACCENT}/><Cell fill={CYAN}/><Cell fill={AMBER}/><Cell fill={ROSE}/>
              </Pie><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{color:'var(--text-muted)',fontSize:'0.78rem'}}/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className={cStyles.aCard}>
            <p className={cStyles.aCardTitle}>Dispatch Health</p>
            <div className={cStyles.healthPanel}>
              {[
                {label:'Delivery Rate',   val:stats.deliveryRate, color:GREEN},
                {label:'In Progress',     val:stats.total?Math.round((stats.dispatched+stats.issued)/stats.total*100):0, color:CYAN},
                {label:'Returned/Cancel', val:stats.total?Math.round((stats.returned+stats.cancelled)/stats.total*100):0, color:ROSE},
              ].map(row=>(
                <div key={row.label} className={cStyles.hRow}>
                  <span className={cStyles.hLabel}>{row.label}</span>
                  <div className={cStyles.hTrack}><div className={cStyles.hFill} style={{width:`${row.val}%`,background:row.color}}/></div>
                  <span className={cStyles.hPct} style={{color:row.color}}>{row.val}%</span>
                </div>
              ))}
              <div className={cStyles.insight}>
                <span>
                  {stats.deliveryRate>=70?'Strong delivery performance — over 70% challans delivered successfully.':stats.deliveryRate>=50?'Good dispatch activity. Monitor open challans for follow-up.':'High open challans. Review dispatched/issued ones for timely delivery.'}
                  {' '}Total challan value of <strong>{fmtCur(stats.totalValue)}</strong>, with <strong>{fmtCur(stats.deliveredVal)}</strong> delivered.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
