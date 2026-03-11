"use client";

import {
  LineChart,
  Line,
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

const COLORS = ["#6c8fff", "#4ecdc4", "#ff6b6b"];
const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

export default function SalesDashboard({ data }: { data: any }) {
  const { kpis, chartData, invoiceStatusData } = data;

  return (
    <>
      <div className={styles.kpiGrid}>
        <KPI label="Open Inquiries" value={kpis.openInquiries} />
        <KPI label="Active Sale Orders" value={kpis.activeSaleOrders} />
        <KPI label="Invoiced (3 months)" value={fmt(kpis.totalInvoiced)} />
        <KPI label="Collected (3 months)" value={fmt(kpis.totalCollected)} />
        <KPI
          label="Overdue Invoices"
          value={kpis.overdueInvoices}
          alert={kpis.overdueInvoices > 0}
        />
        <KPI label="Reminders Sent Today" value={kpis.pendingReminders} />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>Invoiced vs Collected</p>
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
