import type { AdvanceMemo, Employee } from "@/types/advanceMemo";
import {
    fmtINR, fmtDate, outstanding, recoveryPct,
    monthsRemaining, getEmployee,
} from "@/types/advanceMemo";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import styles from "./AdvanceMemoTable.module.scss";

interface Props {
    memos: AdvanceMemo[];
    employees: Employee[];
    onView: (memo: AdvanceMemo) => void;
    onEdit: (memo: AdvanceMemo) => void;
}

// ── Recovery progress bar ─────────────────────────────────────────────────────
function RecoveryBar({ memo }: { memo: AdvanceMemo }) {
    const pct = recoveryPct(memo);
    const colorClass =
        pct === 100 ? styles.barGreen
            : pct >= 50 ? styles.barAmber
                : styles.barRed;

    return (
        <div className={styles.barWrap}>
            <div className={styles.barTrack}>
                <div
                    className={`${styles.barFill} ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={styles.barPct}>{pct}%</span>
        </div>
    );
}

export default function AdvanceMemoTable({ memos, employees, onView, onEdit }: Props) {
    if (memos.length === 0) {
        return (
            <Card>
                <div className={styles.empty}>
                    <p>No advance memos match your filters.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card noPad>
            <Table
                columns={[
                    { key: "memo_no", label: "Memo No" },
                    {
                        key: "employee_id", label: "Employee",
                        render: (v) => {
                            const emp = getEmployee(employees, v as number);
                            return (
                                <div className={styles.empCell}>
                                    <div>
                                        <p className={styles.empName}>{emp?.name ?? "—"}</p>
                                        <p className={styles.empCode}>{emp?.emp_code}</p>
                                    </div>
                                </div>
                            );
                        }
                    },
                    {
                        key: "department", label: "Dept",
                        render: (_, row) => {
                            const emp = getEmployee(employees, row.employee_id as number);
                            return <span className={styles.dept}>{emp?.department ?? "—"}</span>;
                        }
                    },
                    {
                        key: "memo_date", label: "Date",
                        render: (v) => <span className={styles.date}>{fmtDate(v as string)}</span>
                    },
                    {
                        key: "amount", label: "Amount", align: "r",
                        render: (v) => <span className={styles.amount}>{fmtINR(v as number)}</span>
                    },
                    { key: "purpose", label: "Purpose" },
                    {
                        key: "monthly_deduction", label: "Rec/Mo", align: "r",
                        render: (v) => <span className={styles.mono}>{fmtINR(v as number)}</span>
                    },
                    {
                        key: "progress", label: "Progress",
                        render: (_, row) => <RecoveryBar memo={row as unknown as AdvanceMemo} />
                    },
                    {
                        key: "outstanding", label: "Outstanding", align: "r",
                        render: (_, row) => {
                            const bal = outstanding(row as unknown as AdvanceMemo);
                            return <span className={bal === 0 ? styles.balZero : styles.balOut}>{fmtINR(bal)}</span>;
                        }
                    },
                    {
                        key: "status", label: "Status", align: "c",
                        render: (v) => {
                            const status = v as string;
                            let variant: any = "default";
                            if (status === "Active") variant = "warning";
                            if (status === "Fully Recovered") variant = "success";
                            if (status === "Written Off") variant = "danger";
                            return <Badge label={status} variant={variant} />;
                        }
                    },
                    {
                        key: "actions", label: "Actions", align: "c",
                        render: (_, row) => (
                            <div className={styles.actions}>
                                <button className={styles.actionBtn} onClick={() => onView(row as unknown as AdvanceMemo)}>View</button>
                                <button className={styles.actionBtn} onClick={() => onEdit(row as unknown as AdvanceMemo)}>Edit</button>
                            </div>
                        )
                    }
                ]}
                rows={memos as any}
            />
        </Card>
    );
}
