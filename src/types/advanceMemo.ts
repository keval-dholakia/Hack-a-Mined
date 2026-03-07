// src/app/dashboard/hr/advance-memo/advanceMemo.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared types, constants, dummy data, and helper utilities.
//
// DATA SOURCES:
//   REAL  → employees table  (id, emp_code, name, designation, department, basic_salary)
//   REAL  → salary_sheets    (month, year context for recovery scheduling)
//   DUMMY → advance_memos    ← table does not yet exist — needs migration (SQL below)
//
// PENDING MIGRATION — add to your Supabase schema:
// ─────────────────────────────────────────────────────────────────────────────
// CREATE TABLE public.advance_memos (
//   id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//   memo_no              varchar NOT NULL UNIQUE,
//   employee_id          bigint NOT NULL REFERENCES public.employees(id),
//   memo_date            date NOT NULL DEFAULT CURRENT_DATE,
//   amount               numeric NOT NULL,
//   purpose              varchar,
//   recovery_start_month integer CHECK (recovery_start_month BETWEEN 1 AND 12),
//   recovery_start_year  integer,
//   monthly_deduction    numeric DEFAULT 0,
//   total_recovered      numeric DEFAULT 0,
//   status               varchar DEFAULT 'Active'
//                        CHECK (status IN ('Active','Fully Recovered','Written Off')),
//   approved_by          bigint REFERENCES public.users(id),
//   remarks              text,
//   created_at           timestamp DEFAULT now(),
//   updated_at           timestamp DEFAULT now()
// );
// ─────────────────────────────────────────────────────────────────────────────

// ── Domain types ──────────────────────────────────────────────────────────────

export type AdvanceStatus = "Active" | "Fully Recovered" | "Written Off";

export interface Employee {
    id: number;
    emp_code: string;
    name: string;
    designation: string;
    department: string;
    basic_salary: number;
}

export interface AdvanceMemo {
    id: number;
    memo_no: string;
    employee_id: number;
    memo_date: string;           // ISO date string YYYY-MM-DD
    amount: number;
    purpose: string;
    recovery_start_month: number; // 1–12
    recovery_start_year: number;
    monthly_deduction: number;
    total_recovered: number;
    status: AdvanceStatus;
    remarks: string;
}

export interface NewMemoForm {
    employee_id: string;
    memo_date: string;
    amount: string;
    purpose: string;
    recovery_start_month: string;
    recovery_start_year: string;
    monthly_deduction: string;
    remarks: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
] as const;

export const PURPOSES = [
    "Medical Emergency",
    "House Repair",
    "Education Fees",
    "Wedding Expenses",
    "Vehicle Repair",
    "Personal Emergency",
    "Travel Expense",
    "Family Emergency",
    "Other",
] as const;

export const DEPARTMENTS = [
    "All", "Production", "Finance", "Stores",
    "HR", "Quality", "Sales", "Maintenance", "Purchase",
] as const;

export const STATUS_OPTIONS: AdvanceStatus[] = [
    "Active", "Fully Recovered", "Written Off",
];

// ── Dummy seed data (mirrors real employees table shape) ───────────────────────

export const DUMMY_EMPLOYEES: Employee[] = [
    { id: 1, emp_code: "EMP-001", name: "Rajesh Kumar", designation: "Production Supervisor", department: "Production", basic_salary: 32000 },
    { id: 2, emp_code: "EMP-002", name: "Meena Sharma", designation: "Accounts Executive", department: "Finance", basic_salary: 28000 },
    { id: 3, emp_code: "EMP-003", name: "Sunil Patil", designation: "Store Keeper", department: "Stores", basic_salary: 22000 },
    { id: 4, emp_code: "EMP-004", name: "Priya Nair", designation: "HR Executive", department: "HR", basic_salary: 30000 },
    { id: 5, emp_code: "EMP-005", name: "Vikram Desai", designation: "Quality Inspector", department: "Quality", basic_salary: 25000 },
    { id: 6, emp_code: "EMP-006", name: "Anita Joshi", designation: "Sales Executive", department: "Sales", basic_salary: 27000 },
    { id: 7, emp_code: "EMP-007", name: "Deepak Rao", designation: "Maintenance Tech", department: "Maintenance", basic_salary: 24000 },
    { id: 8, emp_code: "EMP-008", name: "Kavita Singh", designation: "Purchase Executive", department: "Purchase", basic_salary: 26000 },
];

export const DUMMY_MEMOS: AdvanceMemo[] = [
    {
        id: 1, memo_no: "ADV-2025-001", employee_id: 1,
        memo_date: "2025-01-10", amount: 20000, purpose: "Medical Emergency",
        recovery_start_month: 2, recovery_start_year: 2025,
        monthly_deduction: 4000, total_recovered: 16000,
        status: "Active", remarks: "Approved by HR Manager",
    },
    {
        id: 2, memo_no: "ADV-2025-002", employee_id: 3,
        memo_date: "2025-01-20", amount: 10000, purpose: "House Repair",
        recovery_start_month: 2, recovery_start_year: 2025,
        monthly_deduction: 2000, total_recovered: 10000,
        status: "Fully Recovered", remarks: "",
    },
    {
        id: 3, memo_no: "ADV-2025-003", employee_id: 6,
        memo_date: "2025-02-05", amount: 15000, purpose: "Education Fees",
        recovery_start_month: 3, recovery_start_year: 2025,
        monthly_deduction: 3000, total_recovered: 9000,
        status: "Active", remarks: "Approved by MD",
    },
    {
        id: 4, memo_no: "ADV-2025-004", employee_id: 2,
        memo_date: "2025-02-15", amount: 8000, purpose: "Personal Emergency",
        recovery_start_month: 3, recovery_start_year: 2025,
        monthly_deduction: 2000, total_recovered: 8000,
        status: "Fully Recovered", remarks: "",
    },
    {
        id: 5, memo_no: "ADV-2025-005", employee_id: 5,
        memo_date: "2025-03-01", amount: 25000, purpose: "Wedding Expenses",
        recovery_start_month: 4, recovery_start_year: 2025,
        monthly_deduction: 5000, total_recovered: 5000,
        status: "Active", remarks: "Director approved",
    },
    {
        id: 6, memo_no: "ADV-2025-006", employee_id: 8,
        memo_date: "2025-03-12", amount: 12000, purpose: "Vehicle Repair",
        recovery_start_month: 4, recovery_start_year: 2025,
        monthly_deduction: 3000, total_recovered: 0,
        status: "Active", remarks: "",
    },
    {
        id: 7, memo_no: "ADV-2025-007", employee_id: 4,
        memo_date: "2025-03-20", amount: 5000, purpose: "Travel Expense",
        recovery_start_month: 4, recovery_start_year: 2025,
        monthly_deduction: 5000, total_recovered: 0,
        status: "Written Off", remarks: "Waived by management",
    },
];

// ── Utility helpers ───────────────────────────────────────────────────────────

export const fmtINR = (n: number): string =>
    "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 });

export const fmtDate = (d: string): string => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day} ${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`;
};

export const outstanding = (m: AdvanceMemo): number =>
    Math.max(0, m.amount - m.total_recovered);

export const recoveryPct = (m: AdvanceMemo): number =>
    m.amount === 0 ? 0 : Math.min(100, Math.round((m.total_recovered / m.amount) * 100));

export const monthsRemaining = (m: AdvanceMemo): number => {
    const bal = outstanding(m);
    if (bal === 0 || m.monthly_deduction === 0) return 0;
    return Math.ceil(bal / m.monthly_deduction);
};

export const nextMemoNo = (memos: AdvanceMemo[]): string => {
    const year = new Date().getFullYear();
    const count = memos.filter((m) => m.memo_no.includes(String(year))).length;
    return `ADV-${year}-${String(count + 1).padStart(3, "0")}`;
};

export const getEmployee = (
    employees: Employee[],
    id: number,
): Employee | undefined => employees.find((e) => e.id === id);