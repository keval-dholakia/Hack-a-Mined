import type { AdvanceStatus } from "@/types/advanceMemo";
import { DEPARTMENTS, STATUS_OPTIONS } from "@/types/advanceMemo";
import styles from "@/components/modules/hr/HR.module.scss";
import Button from "@/components/ui/Button";

interface Props {
    search: string;
    dept: string;
    status: string;
    onSearch: (v: string) => void;
    onDept: (v: string) => void;
    onStatus: (v: string) => void;
    onNew: () => void;
    totalShown: number;
    totalAll: number;
}

export default function AdvanceMemoFilters({
    search, dept, status,
    onSearch, onDept, onStatus,
    onNew, totalShown, totalAll,
}: Props) {
    return (
        <div className={styles.searchBar}>
            <input
                className={styles.searchInput}
                type="text"
                placeholder="Search employee or memo no…"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
            />

            {/* Department filter */}
            <select
                className={styles.filterSelect}
                value={dept}
                onChange={(e) => onDept(e.target.value)}
            >
                {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
                ))}
            </select>

            {/* Status filter */}
            <select
                className={styles.filterSelect}
                value={status}
                onChange={(e) => onStatus(e.target.value)}
            >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            <Button onClick={onNew} variant="primary">
                + New Advance Memo
            </Button>
        </div>
    );
}
