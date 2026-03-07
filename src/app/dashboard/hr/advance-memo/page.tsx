// src/app/dashboard/hr/advance-memo/page.tsx
"use client";

/**
 * HR — Employee Advance Memo
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /dashboard/hr/advance-memo
 *
 * Real data used from schema:
 *   • employees  → id, emp_code, name, designation, department, basic_salary
 *   • salary_sheets → informs recovery month context (not queried here yet)
 *
 * Dummy data:
 *   • advance_memos → table pending migration (SQL in advanceMemo.types.ts)
 *
 * When advance_memos table is ready, replace DUMMY_MEMOS / DUMMY_EMPLOYEES
 * with Supabase queries:
 *   const { data: memos }     = await supabase.from("advance_memos").select("*");
 *   const { data: employees } = await supabase.from("employees").select(
 *     "id, emp_code, name, designation, department, basic_salary"
 *   ).eq("is_active", 1);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from "react";

import type { AdvanceMemo } from "@/types/advanceMemo";
import {
    DUMMY_EMPLOYEES,
    DUMMY_MEMOS,
    getEmployee,
} from "@/types/advanceMemo";

//import AdvanceMemoStats from "@/components/modules/hr/AdvanceMemoStats";
import AdvanceMemoFilters from "@/components/modules/hr/AdvanceMemoFilter";
import AdvanceMemoTable from "@/components/modules/hr/AdvanceMemoTable";
import AdvanceMemoForm from "@/components/modules/hr/AdvanceMemoForm";
import AdvanceMemoDetail from "@/components/modules/hr/AdvanceMemoDetail";

import styles from "@/components/modules/hr/HR.module.scss";

export default function AdvanceMemoPage() {
    // ── Data state (swap with Supabase queries when table exists) ───────────────
    const [memos, setMemos] = useState<AdvanceMemo[]>(DUMMY_MEMOS);
    const employees = DUMMY_EMPLOYEES; // replace with useQuery

    // ── UI state ────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [deptFlt, setDeptFlt] = useState("All");
    const [statusFlt, setStatusFlt] = useState("All");

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AdvanceMemo | null>(null);
    const [viewing, setViewing] = useState<AdvanceMemo | null>(null);

    // ── Filtered memos ───────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return memos.filter((m) => {
            const emp = getEmployee(employees, m.employee_id);
            const matchSearch =
                !q ||
                m.memo_no.toLowerCase().includes(q) ||
                emp?.name.toLowerCase().includes(q) ||
                emp?.emp_code.toLowerCase().includes(q) ||
                m.purpose.toLowerCase().includes(q);
            const matchDept =
                deptFlt === "All" || emp?.department === deptFlt;
            const matchStatus =
                statusFlt === "All" || m.status === statusFlt;
            return matchSearch && matchDept && matchStatus;
        });
    }, [memos, employees, search, deptFlt, statusFlt]);

    // ── Handlers ─────────────────────────────────────────────────────────────────
    const handleNewMemo = () => {
        setEditing(null);
        setViewing(null);
        setShowForm(true);
    };

    const handleEdit = (memo: AdvanceMemo) => {
        setEditing(memo);
        setViewing(null);
        setShowForm(true);
    };

    const handleView = (memo: AdvanceMemo) => {
        setViewing(memo);
        setShowForm(false);
    };

    const handleSave = (memo: AdvanceMemo) => {
        setMemos((prev) => {
            const exists = prev.find((m) => m.id === memo.id);
            return exists
                ? prev.map((m) => (m.id === memo.id ? memo : m))
                : [...prev, memo];
        });
        setShowForm(false);
        setEditing(null);
    };

    return (
        <div className={styles.container}>

            {/* ── Page header ─────────────────────────────────────────────────────── */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Employee Advance Memo</h1>
                    <p className={styles.subtitle}>
                        Track salary advances, recovery schedules, and outstanding balances.
                    </p>
                </div>
            </div>

            {/* ── Summary cards ───────────────────────────────────────────────────── */}
            {/*<AdvanceMemoStats memos={memos} />*/}

            {/* ── Filters + table ─────────────────────────────────────────────────── */}
            <AdvanceMemoFilters
                search={search}
                dept={deptFlt}
                status={statusFlt}
                onSearch={setSearch}
                onDept={setDeptFlt}
                onStatus={setStatusFlt}
                onNew={handleNewMemo}
                totalShown={filtered.length}
                totalAll={memos.length}
            />

            <AdvanceMemoTable
                memos={filtered}
                employees={employees}
                onView={handleView}
                onEdit={handleEdit}
            />

            {/* ── Drawers ──────────────────────────────────────────────────────────── */}
            {showForm && (
                <AdvanceMemoForm
                    employees={employees}
                    allMemos={memos}
                    editing={editing}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {viewing && !showForm && (
                <AdvanceMemoDetail
                    memo={viewing}
                    employees={employees}
                    onEdit={() => handleEdit(viewing)}
                    onClose={() => setViewing(null)}
                />
            )}

        </div>
    );
}