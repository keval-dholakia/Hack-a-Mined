import type { AdvanceMemo } from "@/types/advanceMemo";
import { fmtINR, outstanding } from "@/types/advanceMemo";
// import Card from "@/components/ui/Card"; // Removed because it doesn't support custom className easily here
import styles from "./AdvanceMemoStats.module.scss";

interface Props {
    memos: AdvanceMemo[];
}

export default function AdvanceMemoStats({ memos }: Props) {
    const totalDisbursed = memos.reduce((s, m) => s + m.amount, 0);
    const totalOutstanding = memos.reduce((s, m) => s + outstanding(m), 0);
    const totalRecovered = memos.reduce((s, m) => s + m.total_recovered, 0);
    const activeCount = memos.filter((m) => m.status === "Active").length;
    const recoveredCount = memos.filter((m) => m.status === "Fully Recovered").length;
    const writtenOffCount = memos.filter((m) => m.status === "Written Off").length;

    const stats = [
        {
            label: "Total Disbursed",
            value: fmtINR(totalDisbursed),
            sub: `${memos.length} memo${memos.length !== 1 ? "s" : ""} issued`,
            variant: "neutral",
        },
        {
            label: "Outstanding",
            value: fmtINR(totalOutstanding),
            sub: `${activeCount} active advance${activeCount !== 1 ? "s" : ""}`,
            variant: "amber",
        },
        {
            label: "Total Recovered",
            value: fmtINR(totalRecovered),
            sub: `${recoveredCount} fully cleared`,
            variant: "green",
        },
        {
            label: "Written Off",
            value: String(writtenOffCount),
            sub: "memo" + (writtenOffCount !== 1 ? "s" : "") + " waived",
            variant: "red",
        },
    ];

    return (
        <div className={styles.grid}>
            {stats.map((s) => (
                <div key={s.label} className={`${styles.statCard} ${styles[s.variant]}`}>
                    <div className={styles.topBar} />
                    <p className={styles.label}>{s.label}</p>
                    <p className={styles.value}>{s.value}</p>
                    <p className={styles.sub}>{s.sub}</p>
                </div>
            ))}
        </div>
    );
}
