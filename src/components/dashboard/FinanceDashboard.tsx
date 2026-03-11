"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Dashboard.module.scss";

const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

export default function FinanceDashboard({ data }: { data: any }) {
  const { kpis, chartData, overdueByCustomer } = data;

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Invoiced (3 months)" value={fmt(kpis.totalInvoiced)} />
        <KPI label="Collected (3 months)" value={fmt(kpis.totalCollected)} />
        <KPI
          label="Overdue Amount"
          value={fmt(kpis.overdueAmount)}
          alert={kpis.overdueAmount > 0}
        />
        <KPI label="Vouchers This Month" value={kpis.vouchersThisMonth} />
        <KPI
          label="Pending Vendor Bills"
          value={kpis.pendingBills}
          alert={kpis.pendingBills > 0}
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Collection Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `₹${v / 1000}K`}
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="invoiced"
                name="Invoiced"
                stroke="#6c8fff"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="#4ecdc4"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Top Overdue Customers</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={overdueByCustomer} layout="vertical">
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${v / 1000}K`}
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#888", fontSize: 11 }}
                width={90}
              />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Bar
                dataKey="amount"
                name="Overdue"
                fill="#ff6b6b"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function KPI({
  label,
  value,
  alert,
}: {
  label: string;
  value: any;
  alert?: boolean;
}) {
  return (
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={`${styles.kpiValue} ${alert ? styles.kpiAlert : ""}`}>
        {value}
      </span>
    </div>
  );
}
