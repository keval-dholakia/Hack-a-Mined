'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './Dashboard.module.scss'

export default function HRDashboard({ data }: { data: any }) {
  const { kpis, deptChartData } = data

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Total Employees"    value={kpis.totalEmployees}    />
        <KPI label="Active Employees"   value={kpis.activeEmployees}   />
        <KPI label="Inactive Employees" value={kpis.inactiveEmployees} alert={kpis.inactiveEmployees > 0} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <p className={styles.chartTitle}>Headcount by Department</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptChartData}>
              <XAxis dataKey="department" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Employees" fill="#6c8fff" radius={[4,4,0,0]} />
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