// src/app/dashboard/hr/advance-memo/_components/AdvanceMemoDetail.tsx
"use client";
import type { AdvanceMemo, Employee } from "@/types/advanceMemo"
import {
    fmtINR, fmtDate, outstanding, recoveryPct,
    monthsRemaining, getEmployee, MONTHS,
} from "@/types/advanceMemo";
import styles from "./AdvanceMemoDetail.module.scss";

interface Props {
    memo: AdvanceMemo;
    employees: Employee[];
    onEdit: () => void;
    onClose: () => void;
}

// Derived: recovery schedule rows
function buildSchedule(memo: AdvanceMemo) {
    const rows: { month: string; amount: number; cumulative: number; status: "paid" | "upcoming" }[] = [];
    let remaining = memo.amount;
    let cumulative = 0;
    const now = new Date();

    for (let i = 0; remaining > 0 && i < 36; i++) {
        const m = ((memo.recovery_start_month - 1 + i) % 12);
        const y = memo.recovery_start_year + Math.floor((memo.recovery_start_month - 1 + i) / 12);
        const deduction = Math.min(memo.monthly_deduction, remaining);
        cumulative += deduction;
        remaining -= deduction;

        const isPast =
            y < now.getFullYear() ||
            (y === now.getFullYear() && m + 1 <= now.getMonth() + 1);

        rows.push({
            month: `${MONTHS[m].slice(0, 3)} ${y}`,
            amount: deduction,
            cumulative,
            status: isPast && cumulative <= memo.total_recovered ? "paid" : "upcoming",
        });
    }
    return rows;
}

export default function AdvanceMemoDetail({ memo, employees, onEdit, onClose }: Props) {
    const emp = getEmployee(employees, memo.employee_id);
    const bal = outstanding(memo);
    const pct = recoveryPct(memo);
    const rem = monthsRemaining(memo);
    const schedule = buildSchedule(memo);

    const statusColor =
        memo.status === "Active" ? styles.statusAmber
            : memo.status === "Fully Recovered" ? styles.statusGreen
                : styles.statusRed;

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <aside className={styles.drawer}>

                {/* Header */}
                <div className={styles.drawerHeader}>
                    <div>
                        <p className={styles.drawerEye}>Advance Memo · Detail View</p>
                        <h2 className={styles.drawerTitle}>{memo.memo_no}</h2>
                        <p className={styles.drawerSub}>{fmtDate(memo.memo_date)}</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.editBtn} onClick={onEdit}>Edit</button>
                        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={styles.drawerBody}>

                    {/* Status + Employee */}
                    <div className={styles.topStrip}>
                        <div className={styles.empBlock}>
                            <div className={styles.empAvatar}>
                                {emp?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <p className={styles.empName}>{emp?.name ?? "—"}</p>
                                <p className={styles.empMeta}>
                                    {emp?.designation} · {emp?.department}
                                </p>
                                <p className={styles.empMeta}>{emp?.emp_code}</p>
                            </div>
                        </div>
                        <span className={`${styles.statusBadge} ${statusColor}`}>
                            {memo.status}
                        </span>
                    </div>

                    {/* KPI strip */}
                    <div className={styles.kpiRow}>
                        <div className={styles.kpi}>
                            <p className={styles.kpiLabel}>Advance Amount</p>
                            <p className={styles.kpiVal}>{fmtINR(memo.amount)}</p>
                        </div>
                        <div className={styles.kpi}>
                            <p className={styles.kpiLabel}>Recovered</p>
                            <p className={`${styles.kpiVal} ${styles.kpiGreen}`}>{fmtINR(memo.total_recovered)}</p>
                        </div>
                        <div className={styles.kpi}>
                            <p className={styles.kpiLabel}>Outstanding</p>
                            <p className={`${styles.kpiVal} ${bal > 0 ? styles.kpiAmber : styles.kpiGreen}`}>
                                {fmtINR(bal)}
                            </p>
                        </div>
                        <div className={styles.kpi}>
                            <p className={styles.kpiLabel}>Monthly EMI</p>
                            <p className={styles.kpiVal}>{fmtINR(memo.monthly_deduction)}</p>
                        </div>
                    </div>

                    {/* Recovery progress */}
                    <div className={styles.progressBlock}>
                        <div className={styles.progressHeader}>
                            <p className={styles.sectionLabel}>Recovery Progress</p>
                            <span className={styles.progressPct}>{pct}%</span>
                        </div>
                        <div className={styles.barTrack}>
                            <div
                                className={`${styles.barFill} ${pct === 100 ? styles.barGreen : pct >= 50 ? styles.barAmber : styles.barRed
                                    }`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className={styles.progressMeta}>
                            <span>{fmtINR(memo.total_recovered)} recovered</span>
                            {rem > 0 && <span>{rem} month{rem !== 1 ? "s" : ""} remaining</span>}
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className={styles.detailGrid}>
                        {[
                            { label: "Purpose", value: memo.purpose },
                            { label: "Recovery Starts", value: `${MONTHS[memo.recovery_start_month - 1]} ${memo.recovery_start_year}` },
                            { label: "Basic Salary", value: emp ? fmtINR(emp.basic_salary) : "—" },
                            { label: "EMI % of Basic", value: emp ? `${Math.round((memo.monthly_deduction / emp.basic_salary) * 100)}%` : "—" },
                        ].map((d) => (
                            <div key={d.label} className={styles.detailItem}>
                                <p className={styles.detailLabel}>{d.label}</p>
                                <p className={styles.detailValue}>{d.value}</p>
                            </div>
                        ))}
                        {memo.remarks && (
                            <div className={`${styles.detailItem} ${styles.detailFull}`}>
                                <p className={styles.detailLabel}>Remarks</p>
                                <p className={styles.detailValue}>{memo.remarks}</p>
                            </div>
                        )}
                    </div>

                    {/* Recovery schedule */}
                    <div>
                        <p className={styles.sectionLabel} style={{ marginBottom: "12px" }}>
                            Recovery Schedule
                        </p>
                        <div className={styles.scheduleTable}>
                            <div className={styles.scheduleHead}>
                                <span>Month</span>
                                <span>Deduction</span>
                                <span>Cumulative</span>
                                <span>Status</span>
                            </div>
                            {schedule.map((row, i) => (
                                <div
                                    key={i}
                                    className={`${styles.scheduleRow} ${row.status === "paid" ? styles.scheduleRowPaid : styles.scheduleRowUpcoming
                                        }`}
                                >
                                    <span>{row.month}</span>
                                    <span>{fmtINR(row.amount)}</span>
                                    <span>{fmtINR(row.cumulative)}</span>
                                    <span>
                                        <span className={`${styles.schedBadge} ${row.status === "paid" ? styles.schedBadgePaid : styles.schedBadgeUp
                                            }`}>
                                            {row.status === "paid" ? "Deducted" : "Upcoming"}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </aside>
        </div>
    );
}