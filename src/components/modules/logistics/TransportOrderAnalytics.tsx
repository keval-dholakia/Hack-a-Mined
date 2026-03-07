"use client";

import { useMemo, useState } from "react";
import {
  TransportOrderRecord,
  STATUS_COLOR,
  MODE_COLOR,
  SEED,
} from "./TransportOrder";
import toStyles from "./TransportOrder.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#facc15",
  "#60a5fa",
];
const ACCENT = "#6366f1",
  GREEN = "#34d399",
  CYAN = "#22d3ee",
  AMBER = "#facc15",
  ROSE = "#f43f5e",
  PURPLE = "#a78bfa";

const fmtCur = (n: number) =>
  n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={toStyles.tooltip}>
      {label && <p className={toStyles.tooltipLabel}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? ACCENT }}>
          {p.name}: <strong>{formatter ? formatter(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={toStyles.kpiCard}>
      <div
        className={toStyles.kpiIcon}
        style={{ color, background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <p className={toStyles.kpiLabel}>{label}</p>
        <p className={toStyles.kpiValue} style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface Props {
  records: TransportOrderRecord[];
  onClose: () => void;
}

export default function TransportOrderAnalytics({ records, onClose }: Props) {
  const [tab, setTab] = useState<
    "overview" | "routes" | "transporters" | "trend"
  >("overview");

  const stats = useMemo(() => {
    const total = records.length;
    const delivered = records.filter((r) => r.status === "Delivered").length;
    const inTransit = records.filter((r) => r.status === "In Transit").length;
    const dispatched = records.filter((r) => r.status === "Dispatched").length;
    const booked = records.filter((r) => r.status === "Booked").length;
    const cancelled = records.filter((r) => r.status === "Cancelled").length;
    const draft = records.filter((r) => r.status === "Draft").length;
    const deliveryRate = total ? Math.round((delivered / total) * 100) : 0;

    const totalFreight = records.reduce((s, r) => s + r.freight_amt, 0);
    const totalWeight = records.reduce(
      (s, r) => s + r.items.reduce((a, i) => a + i.weight_kg, 0),
      0,
    );
    const totalPkgs = records.reduce(
      (s, r) => s + r.items.reduce((a, i) => a + i.packages, 0),
      0,
    );
    const avgFreight = total ? Math.round(totalFreight / total) : 0;

    const statusPie = [
      { name: "Delivered", value: delivered },
      { name: "In Transit", value: inTransit },
      { name: "Dispatched", value: dispatched },
      { name: "Booked", value: booked },
      { name: "Cancelled", value: cancelled },
      { name: "Draft", value: draft },
    ].filter((s) => s.value > 0);

    // Mode breakdown
    const modeMap: Record<string, { count: number; freight: number }> = {};
    records.forEach((r) => {
      if (!modeMap[r.mode]) modeMap[r.mode] = { count: 0, freight: 0 };
      modeMap[r.mode].count++;
      modeMap[r.mode].freight += r.freight_amt;
    });
    const modeData = Object.entries(modeMap).map(([name, d]) => ({
      name,
      ...d,
    }));
    const modePie = modeData.map((m) => ({ name: m.name, value: m.count }));

    // Monthly trend
    const now = new Date();
    const monthData = Array.from({ length: 12 }, (_, m) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + m, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const lbl = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      const mos = records.filter((r) => r.dispatch_date.startsWith(key));
      return {
        label: lbl,
        total: mos.length,
        delivered: mos.filter((r) => r.status === "Delivered").length,
        freight: mos.reduce((s, r) => s + r.freight_amt, 0),
      };
    });

    // Transporter breakdown
    const tMap: Record<
      string,
      { count: number; delivered: number; freight: number }
    > = {};
    records.forEach((r) => {
      if (!tMap[r.transporter])
        tMap[r.transporter] = { count: 0, delivered: 0, freight: 0 };
      tMap[r.transporter].count++;
      if (r.status === "Delivered") tMap[r.transporter].delivered++;
      tMap[r.transporter].freight += r.freight_amt;
    });
    const transporterData = Object.entries(tMap)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, d]) => ({
        name: name.split(" ")[0],
        fullName: name,
        ...d,
        rate: d.count ? Math.round((d.delivered / d.count) * 100) : 0,
      }));

    // Customer breakdown (top 6 for radar)
    const cMap: Record<string, { count: number; freight: number }> = {};
    records.forEach((r) => {
      if (!cMap[r.customer]) cMap[r.customer] = { count: 0, freight: 0 };
      cMap[r.customer].count++;
      cMap[r.customer].freight += r.freight_amt;
    });
    const topCustomers = Object.entries(cMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([name, d]) => ({ name, revenueB: name.split(" ")[0], ...d }));
    const radarData = topCustomers
      .slice(0, 6)
      .map((c) => ({
        cust: c.name.split(" ")[0],
        count: c.count,
        freightL: Math.round(c.freight / 1_00_000),
      }));

    // Route popularity
    const routeMap: Record<string, number> = {};
    records.forEach((r) => {
      const key = `${r.origin}→${r.destination}`;
      routeMap[key] = (routeMap[key] ?? 0) + 1;
    });
    const topRoutes = Object.entries(routeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return {
      total,
      delivered,
      inTransit,
      dispatched,
      booked,
      cancelled,
      draft,
      deliveryRate,
      totalFreight,
      totalWeight,
      totalPkgs,
      avgFreight,
      statusPie,
      modePie,
      modeData,
      monthData,
      transporterData,
      topCustomers,
      radarData,
      topRoutes,
    };
  }, [records]);

  const tabs = [
    { id: "overview", label: "⊞ Overview" },
    { id: "routes", label: "◈ Routes & Modes" },
    { id: "transporters", label: "◉ Transporters" },
    { id: "trend", label: "◎ Trend & Health" },
  ] as const;

  return (
    <div className={toStyles.analyticsPage}>
      <div className={toStyles.analyticsHeader}>
        <div>
          <h1 className={toStyles.analyticsTitle}>Transport Order Analytics</h1>
          <p className={toStyles.analyticsSub}>
            360° logistics data visualization · {stats.total} orders
          </p>
        </div>
        <button className={toStyles.backBtn} onClick={onClose}>
          ← Back to List
        </button>
      </div>

      <div className={toStyles.kpiStrip}>
        <KPI
          icon="◈"
          label="Total Orders"
          value={String(stats.total)}
          color={ACCENT}
        />
        <KPI
          icon="◉"
          label="Delivered"
          value={String(stats.delivered)}
          color={GREEN}
        />
        <KPI
          icon="▣"
          label="In Transit"
          value={String(stats.inTransit)}
          color={AMBER}
        />
        <KPI
          icon="⬡"
          label="Delivery Rate"
          value={`${stats.deliveryRate}%`}
          color={CYAN}
        />
        <KPI
          icon="◎"
          label="Total Freight"
          value={fmtCur(stats.totalFreight)}
          color={PURPLE}
        />
        <KPI
          icon="◇"
          label="Total Weight"
          value={`${stats.totalWeight} kg`}
          color={ROSE}
        />
      </div>

      <div className={toStyles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${toStyles.aTab} ${tab === t.id ? toStyles.aTabActive : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className={toStyles.aGrid}>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Status Distribution</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.statusPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={48}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    `${String(name || "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {stats.statusPie.map((e, i) => (
                    <Cell key={i} fill={STATUS_COLOR[e.name] ?? COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Mode Split</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.modePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={48}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    `${name || ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {stats.modePie.map((e, i) => (
                    <Cell key={i} fill={MODE_COLOR[e.name] ?? COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Top Routes by Volume</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.topRoutes} layout="vertical" barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2235"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="value" name="Shipments" radius={[0, 6, 6, 0]}>
                  {stats.topRoutes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Status Summary</p>
            <table className={toStyles.sTable}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>%</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {stats.statusPie.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: STATUS_COLOR[row.name],
                          marginRight: 8,
                        }}
                      />
                      {row.name}
                    </td>
                    <td className={toStyles.mono}>{row.value}</td>
                    <td className={toStyles.mono}>
                      {stats.total
                        ? ((row.value / stats.total) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            width: `${stats.total ? (row.value / stats.total) * 100 : 0}%`,
                            maxWidth: 80,
                            background: STATUS_COLOR[row.name],
                            borderRadius: 4,
                            minWidth: 2,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROUTES & MODES */}
      {tab === "routes" && (
        <div className={toStyles.aGrid}>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Freight by Mode</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.modeData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2235"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCur(v)}
                />
                <Tooltip content={<DarkTooltip formatter={fmtCur} />} />
                <Bar dataKey="freight" name="Freight" radius={[6, 6, 0, 0]}>
                  {stats.modeData.map((e, i) => (
                    <Cell key={i} fill={MODE_COLOR[e.name] ?? COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Customer Activity Radar</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart
                data={stats.radarData}
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                <PolarGrid stroke="#1f2235" />
                <PolarAngleAxis
                  dataKey="cust"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                />
                <PolarRadiusAxis tick={{ fill: "#4b5563", fontSize: 9 }} />
                <Radar
                  name="Shipments"
                  dataKey="count"
                  stroke={ACCENT}
                  fill={ACCENT}
                  fillOpacity={0.15}
                />
                <Radar
                  name="Freight (L)"
                  dataKey="freightL"
                  stroke={GREEN}
                  fill={GREEN}
                  fillOpacity={0.15}
                />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard} style={{ gridColumn: "span 2" }}>
            <p className={toStyles.aCardTitle}>Customer Freight Detail</p>
            <table className={toStyles.sTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Shipments</th>
                  <th>Total Freight</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCustomers.map((c, i) => (
                  <tr key={c.name}>
                    <td style={{ color: "#6b7280", fontFamily: "var(--mono)" }}>
                      #{i + 1}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: COLORS[i % COLORS.length],
                          marginRight: 8,
                        }}
                      />
                      <strong>{c.name}</strong>
                    </td>
                    <td className={toStyles.mono}>{c.count}</td>
                    <td className={toStyles.mono} style={{ color: GREEN }}>
                      {fmtCur(c.freight)}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            width: `${stats.totalFreight ? (c.freight / stats.totalFreight) * 100 : 0}%`,
                            maxWidth: 80,
                            background: COLORS[i % COLORS.length],
                            borderRadius: 4,
                            minWidth: 2,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {stats.totalFreight
                            ? ((c.freight / stats.totalFreight) * 100).toFixed(
                                1,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSPORTERS */}
      {tab === "transporters" && (
        <div className={toStyles.aGrid}>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>
              Transporter — Volume & Deliveries
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.transporterData} barSize={18}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2235"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar
                  dataKey="count"
                  name="Total"
                  fill={ACCENT}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="delivered"
                  name="Delivered"
                  fill={GREEN}
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>
              Transporter Leaderboard{" "}
              <span className={toStyles.aBadge}>by delivery rate</span>
            </p>
            <table className={toStyles.sTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Transporter</th>
                  <th>Total</th>
                  <th>Delivered</th>
                  <th>Freight</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.transporterData]
                  .sort((a, b) => b.rate - a.rate)
                  .map((t, i) => (
                    <tr key={t.fullName}>
                      <td
                        style={{ color: "#6b7280", fontFamily: "var(--mono)" }}
                      >
                        #{i + 1}
                      </td>
                      <td>
                        <strong>{t.fullName}</strong>
                      </td>
                      <td className={toStyles.mono}>{t.count}</td>
                      <td className={toStyles.mono} style={{ color: GREEN }}>
                        {t.delivered}
                      </td>
                      <td className={toStyles.mono} style={{ color: GREEN }}>
                        {fmtCur(t.freight)}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.2rem 0.55rem",
                            borderRadius: 5,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background:
                              t.rate >= 70 ? `${GREEN}22` : `${AMBER}22`,
                            color: t.rate >= 70 ? GREEN : AMBER,
                          }}
                        >
                          {t.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREND & HEALTH */}
      {tab === "trend" && (
        <div className={toStyles.aGrid}>
          <div className={toStyles.aCard} style={{ gridColumn: "span 2" }}>
            <p className={toStyles.aCardTitle}>
              12-Month Dispatch Trend{" "}
              <span className={toStyles.aBadge}>
                volume · delivered · freight
              </span>
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={44}
                  interval={1}
                />
                <YAxis
                  yAxisId="vol"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="fr"
                  orientation="right"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCur(v)}
                />
                <Tooltip content={<DarkTooltip />} />
                <Line
                  yAxisId="vol"
                  type="monotone"
                  dataKey="total"
                  name="Dispatched"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  dot={{ fill: ACCENT, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="vol"
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke={GREEN}
                  strokeWidth={2}
                  dot={{ fill: GREEN, r: 3 }}
                />
                <Line
                  yAxisId="fr"
                  type="monotone"
                  dataKey="freight"
                  name="Freight"
                  stroke={AMBER}
                  strokeWidth={2}
                  dot={{ fill: AMBER, r: 3 }}
                  strokeDasharray="4 2"
                />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Outcome Mix</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Delivered", value: stats.delivered },
                    { name: "In Transit", value: stats.inTransit },
                    { name: "Dispatched", value: stats.dispatched },
                    { name: "Booked/Draft", value: stats.booked + stats.draft },
                    { name: "Cancelled", value: stats.cancelled },
                  ].filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  <Cell fill={GREEN} />
                  <Cell fill={AMBER} />
                  <Cell fill={ACCENT} />
                  <Cell fill={CYAN} />
                  <Cell fill={ROSE} />
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{
                    color: "var(--text-muted)",
                    fontSize: "0.78rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={toStyles.aCard}>
            <p className={toStyles.aCardTitle}>Logistics Health</p>
            <div className={toStyles.healthPanel}>
              {[
                {
                  label: "Delivery Rate",
                  val: stats.deliveryRate,
                  color: GREEN,
                },
                {
                  label: "In Transit",
                  val: stats.total
                    ? Math.round((stats.inTransit / stats.total) * 100)
                    : 0,
                  color: AMBER,
                },
                {
                  label: "Cancellation",
                  val: stats.total
                    ? Math.round((stats.cancelled / stats.total) * 100)
                    : 0,
                  color: ROSE,
                },
              ].map((row) => (
                <div key={row.label} className={toStyles.hRow}>
                  <span className={toStyles.hLabel}>{row.label}</span>
                  <div className={toStyles.hTrack}>
                    <div
                      className={toStyles.hFill}
                      style={{ width: `${row.val}%`, background: row.color }}
                    />
                  </div>
                  <span className={toStyles.hPct} style={{ color: row.color }}>
                    {row.val}%
                  </span>
                </div>
              ))}
              <div className={toStyles.insight}>
                <span>
                  {stats.deliveryRate >= 70
                    ? "Excellent delivery performance — over 70% orders delivered."
                    : stats.deliveryRate >= 50
                      ? "Good flow. Track in-transit orders for timely delivery."
                      : "High open orders. Review transporter SLAs and in-transit delays."}{" "}
                  Total freight of <strong>{fmtCur(stats.totalFreight)}</strong>{" "}
                  across <strong>{stats.total}</strong> orders, covering{" "}
                  <strong>{stats.totalWeight} kg</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
