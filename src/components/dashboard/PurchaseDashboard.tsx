"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Dashboard.module.scss";

const COLORS = ["#6c8fff", "#ff6b6b"];
const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

export default function PurchaseDashboard({ data }: { data: any }) {
  const { kpis, chartData, billStatusData } = data;

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Open POs" value={kpis.openPOs} />
        <KPI
          label="GRNs Awaiting IQC"
          value={kpis.grnsAwaitingIQC}
          alert={kpis.grnsAwaitingIQC > 0}
        />
        <KPI
          label="Pending Bills"
          value={kpis.pendingBills}
          alert={kpis.pendingBills > 0}
        />
        <KPI label="Active Vendors" value={kpis.activeVendors} />
        <KPI label="Purchase (3 months)" value={fmt(kpis.totalPurchase)} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Monthly Purchase Value</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `₹${v / 1000}K`}
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Bar
                dataKey="total"
                name="Purchase"
                fill="#6c8fff"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Bill Payment Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={billStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {billStatusData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
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
