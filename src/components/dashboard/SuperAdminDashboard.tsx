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

const COLORS = ["#6c8fff", "#4ecdc4", "#ff6b6b", "#ffe66d"];
const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

export default function SuperAdminDashboard({ data }: { data: any }) {
  const { kpis, chartData, invoiceStatusData } = data;

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Revenue (3 months)" value={fmt(kpis.totalRevenue)} />
        <KPI label="Purchase (3 months)" value={fmt(kpis.totalPurchase)} />
        <KPI label="Active Orders" value={kpis.activeOrders} />
        <KPI label="Pending Invoices" value={kpis.pendingInvoices} />
        <KPI
          label="Overdue Invoices"
          value={kpis.overdueInvoices}
          alert={kpis.overdueInvoices > 0}
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Revenue vs Purchase</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `₹${v / 1000}K`}
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#6c8fff"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="purchase"
                name="Purchase"
                fill="#4ecdc4"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Invoice Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {invoiceStatusData.map((_: any, i: number) => (
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
