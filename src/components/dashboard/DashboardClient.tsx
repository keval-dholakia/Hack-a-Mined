"use client";

import type { SessionUser } from "@/types/auth";
import SuperAdminDashboard from "./SuperAdminDashboard";
import SalesDashboard from "./SalesDashboard";
import PurchaseDashboard from "./PurchaseDashboard";
import ProductionDashboard from "./ProductionDashboard";
import HRDashboard from "./HRDashboard";
import FinanceDashboard from "./FinanceDashboard";
import DefaultDashboard from "./DefaultDashboard";
import styles from "./Dashboard.module.scss";

type Props = {
  user: SessionUser;
  role: string;
  data: any;
};

export default function DashboardClient({ user, role, data }: Props) {
  const greeting = getGreeting();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className={styles.subtitle}>
            Here&apos;s what&apos;s happening today
          </p>
        </div>
        <div className={styles.roleTag}>{role}</div>
      </div>

      {(role === "Super Admin" || user.is_super_admin) && (
        <SuperAdminDashboard data={data} />
      )}
      {role === "Sales Manager" && <SalesDashboard data={data} />}
      {role === "Purchase Manager" && <PurchaseDashboard data={data} />}
      {role === "Production Manager" && <ProductionDashboard data={data} />}
      {role === "HR Manager" && <HRDashboard data={data} />}
      {role === "Finance Manager" && <FinanceDashboard data={data} />}
      {!data && <DefaultDashboard user={user} />}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
