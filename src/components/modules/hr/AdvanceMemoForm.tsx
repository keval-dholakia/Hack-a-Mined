// src/app/dashboard/hr/advance-memo/_components/AdvanceMemoForm.tsx
"use client";

import { useState, useEffect } from "react";
import type { AdvanceMemo, Employee, NewMemoForm } from "@/types/advanceMemo";
import { MONTHS, PURPOSES, nextMemoNo, fmtINR } from "@/types/advanceMemo";
import styles from "./AdvanceMemoForm.module.scss";

interface Props {
    employees: Employee[];
    allMemos: AdvanceMemo[];
    editing: AdvanceMemo | null;   // null = new memo
    onSave: (memo: AdvanceMemo) => void;
    onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const BLANK: NewMemoForm = {
    employee_id: "",
    memo_date: new Date().toISOString().slice(0, 10),
    amount: "",
    purpose: "",
    recovery_start_month: String(CURRENT_MONTH),
    recovery_start_year: String(CURRENT_YEAR),
    monthly_deduction: "",
    remarks: "",
};

export default function AdvanceMemoForm({ employees, allMemos, editing, onSave, onClose }: Props) {
    const [form, setForm] = useState<NewMemoForm>(BLANK);
    const [errors, setErrors] = useState<Partial<NewMemoForm>>({});

    // Populate form when editing
    useEffect(() => {
        if (editing) {
            setForm({
                employee_id: String(editing.employee_id),
                memo_date: editing.memo_date,
                amount: String(editing.amount),
                purpose: editing.purpose,
                recovery_start_month: String(editing.recovery_start_month),
                recovery_start_year: String(editing.recovery_start_year),
                monthly_deduction: String(editing.monthly_deduction),
                remarks: editing.remarks,
            });
        } else {
            setForm(BLANK);
        }
        setErrors({});
    }, [editing]);

    const set = (key: keyof NewMemoForm, val: string) => {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => ({ ...e, [key]: "" }));
    };

    // Derived: selected employee
    const selectedEmp = employees.find((e) => e.id === Number(form.employee_id));

    // Derived: months to recover
    const monthsToRecover =
        form.amount && form.monthly_deduction && Number(form.monthly_deduction) > 0
            ? Math.ceil(Number(form.amount) / Number(form.monthly_deduction))
            : null;

    // Validate
    const validate = (): boolean => {
        const e: Partial<NewMemoForm> = {};
        if (!form.employee_id) e.employee_id = "Required";
        if (!form.memo_date) e.memo_date = "Required";
        if (!form.amount || Number(form.amount) <= 0)
            e.amount = "Must be > 0";
        if (!form.purpose) e.purpose = "Required";
        if (!form.monthly_deduction || Number(form.monthly_deduction) <= 0)
            e.monthly_deduction = "Must be > 0";
        if (Number(form.monthly_deduction) > Number(form.amount))
            e.monthly_deduction = "Cannot exceed advance amount";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const memo: AdvanceMemo = editing
            ? {
                ...editing,
                employee_id: Number(form.employee_id),
                memo_date: form.memo_date,
                amount: Number(form.amount),
                purpose: form.purpose,
                recovery_start_month: Number(form.recovery_start_month),
                recovery_start_year: Number(form.recovery_start_year),
                monthly_deduction: Number(form.monthly_deduction),
                remarks: form.remarks,
            }
            : {
                id: Date.now(),
                memo_no: nextMemoNo(allMemos),
                employee_id: Number(form.employee_id),
                memo_date: form.memo_date,
                amount: Number(form.amount),
                purpose: form.purpose,
                recovery_start_month: Number(form.recovery_start_month),
                recovery_start_year: Number(form.recovery_start_year),
                monthly_deduction: Number(form.monthly_deduction),
                total_recovered: 0,
                status: "Active",
                remarks: form.remarks,
            };

        onSave(memo);
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <aside className={styles.drawer}>
                {/* Header */}
                <div className={styles.drawerHeader}>
                    <div>
                        <p className={styles.drawerEye}>HR Module</p>
                        <h2 className={styles.drawerTitle}>
                            {editing ? "Edit Advance Memo" : "New Advance Memo"}
                        </h2>
                        {editing && (
                            <p className={styles.drawerSub}>{editing.memo_no}</p>
                        )}
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className={styles.drawerBody}>

                    {/* Employee */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Employee <span className={styles.req}>*</span>
                        </label>
                        <select
                            className={`${styles.select} ${errors.employee_id ? styles.inputErr : ""}`}
                            value={form.employee_id}
                            onChange={(e) => set("employee_id", e.target.value)}
                        >
                            <option value="">— Select Employee —</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.emp_code} · {emp.name} ({emp.department})
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <p className={styles.err}>{errors.employee_id}</p>}
                    </div>

                    {/* Employee info strip */}
                    {selectedEmp && (
                        <div className={styles.empStrip}>
                            <div className={styles.empStripAvatar}>
                                {selectedEmp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <p className={styles.empStripName}>{selectedEmp.name}</p>
                                <p className={styles.empStripSub}>
                                    {selectedEmp.designation} · Basic {fmtINR(selectedEmp.basic_salary)}/mo
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Date + Amount row */}
                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                Memo Date <span className={styles.req}>*</span>
                            </label>
                            <input
                                type="date"
                                className={`${styles.input} ${errors.memo_date ? styles.inputErr : ""}`}
                                value={form.memo_date}
                                onChange={(e) => set("memo_date", e.target.value)}
                            />
                            {errors.memo_date && <p className={styles.err}>{errors.memo_date}</p>}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                Advance Amount (₹) <span className={styles.req}>*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                className={`${styles.input} ${errors.amount ? styles.inputErr : ""}`}
                                placeholder="e.g. 15000"
                                value={form.amount}
                                onChange={(e) => set("amount", e.target.value)}
                            />
                            {errors.amount && <p className={styles.err}>{errors.amount}</p>}
                        </div>
                    </div>

                    {/* Purpose */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Purpose <span className={styles.req}>*</span>
                        </label>
                        <select
                            className={`${styles.select} ${errors.purpose ? styles.inputErr : ""}`}
                            value={form.purpose}
                            onChange={(e) => set("purpose", e.target.value)}
                        >
                            <option value="">— Select Purpose —</option>
                            {PURPOSES.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        {errors.purpose && <p className={styles.err}>{errors.purpose}</p>}
                    </div>

                    <div className={styles.divider} />

                    {/* Recovery section */}
                    <p className={styles.sectionLabel}>Recovery Configuration</p>

                    {/* Recovery start month + year */}
                    <div className={styles.row2}>
                        <div className={styles.field}>
                            <label className={styles.label}>Recovery Start Month</label>
                            <select
                                className={styles.select}
                                value={form.recovery_start_month}
                                onChange={(e) => set("recovery_start_month", e.target.value)}
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Recovery Year</label>
                            <select
                                className={styles.select}
                                value={form.recovery_start_year}
                                onChange={(e) => set("recovery_start_year", e.target.value)}
                            >
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Monthly deduction */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Monthly Deduction (₹) <span className={styles.req}>*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            className={`${styles.input} ${errors.monthly_deduction ? styles.inputErr : ""}`}
                            placeholder="e.g. 3000"
                            value={form.monthly_deduction}
                            onChange={(e) => set("monthly_deduction", e.target.value)}
                        />
                        {errors.monthly_deduction && <p className={styles.err}>{errors.monthly_deduction}</p>}
                    </div>

                    {/* Recovery estimate callout */}
                    {monthsToRecover && (
                        <div className={styles.callout}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M7 5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            <p>
                                Recovery complete in <strong>{monthsToRecover} month{monthsToRecover !== 1 ? "s" : ""}</strong> starting{" "}
                                <strong>{MONTHS[Number(form.recovery_start_month) - 1]} {form.recovery_start_year}</strong>
                            </p>
                        </div>
                    )}

                    {/* Remarks */}
                    <div className={styles.field}>
                        <label className={styles.label}>Remarks / Approval Note</label>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder="Approved by…"
                            value={form.remarks}
                            onChange={(e) => set("remarks", e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.drawerFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSubmit}>
                        {editing ? "Save Changes" : "Create Memo"}
                    </button>
                </div>
            </aside>
        </div>
    );
}