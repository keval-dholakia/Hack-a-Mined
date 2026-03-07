'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styles from './Dashboard.module.scss'

export default function ProductionDashboard({ data }: { data: any }) {
  const { kpis, chartData } = data

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Active Route Cards"    value={kpis.activeRouteCards}   />
        <KPI label="Completed This Month"  value={kpis.completedThisMonth} />
        <KPI label="Total Output (3 mo.)"  value={kpis.totalOutput}        />
        <KPI label="Total Rejection (3 mo.)" value={kpis.totalRejection}   alert={kpis.totalRejection > 0} />
        <KPI label="Material Issues (3 mo.)" value={kpis.materialIssues}   />
        <KPI label="Active BOMs"           value={kpis.openBOMs}           />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <p className={styles.chartTitle}>Output vs Rejection</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="output"    name="Good Output" fill="#6c8fff" radius={[4,4,0,0]} />
              <Bar dataKey="rejection" name="Rejection"   fill="#ff6b6b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

function KPI({ label, value, alert }: { label: string; value: any; alert?: boolean }) {
  return (
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={`${styles.kpiValue} ${alert ? styles.kpiAlert : ''}`}>{value}</span>
    </div>
  )
}