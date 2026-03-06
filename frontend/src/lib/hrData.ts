// ─── HR Seed Data ─────────────────────────────────────────

export interface Employee {
    code: string; name: string; designation: string; dept: string;
    mobile: string; joining: string; basic: number; bank: string; status: string;
}
export interface SalaryHead {
    head: string; type: string; calcOn: string; value: string;
}
export interface SalaryStructure {
    emp: string; effDate: string; basic: number; hra: number; da: number;
    conv: number; pf: number; esic: number; pt: number; gross: number; net: number;
}
export interface SalaryRow {
    emp: string; name: string; total: number; present: number;
    gross: number; pf: number; esic: number; pt: number; tds: number; net: number;
}
export interface Advance {
    id: string; emp: string; date: string; amount: number;
    purpose: string; recovery: string; status: string;
}

export const EMPLOYEES: Employee[] = [
    { code: 'EMP-001', name: 'Rajan Mehta', designation: 'Sales Manager', dept: 'Sales', mobile: '98765-43210', joining: '01 Apr 2020', basic: 45000, bank: 'HDFC ···4521', status: 'Active' },
    { code: 'EMP-002', name: 'Priya Shah', designation: 'QC Inspector', dept: 'Quality', mobile: '98765-43211', joining: '15 Jun 2021', basic: 28000, bank: 'SBI ···7832', status: 'Active' },
    { code: 'EMP-003', name: 'Amit Kumar', designation: 'Production Supervisor', dept: 'Production', mobile: '98765-43212', joining: '10 Jan 2019', basic: 38000, bank: 'ICICI···2214', status: 'Active' },
    { code: 'EMP-004', name: 'Sunita Verma', designation: 'Accounts Executive', dept: 'Finance', mobile: '98765-43213', joining: '05 Mar 2022', basic: 32000, bank: 'HDFC ···8876', status: 'Active' },
    { code: 'EMP-005', name: 'Dinesh Lohia', designation: 'Store Keeper', dept: 'Stores', mobile: '98765-43214', joining: '20 Nov 2018', basic: 22000, bank: 'BOB ···3341', status: 'Active' },
    { code: 'EMP-006', name: 'Kavita Patel', designation: 'HR Executive', dept: 'HR', mobile: '98765-43215', joining: '01 Aug 2023', basic: 30000, bank: 'AXIS ···9901', status: 'Active' },
];

export const SALARY_HEADS: SalaryHead[] = [
    { head: 'Basic', type: 'Earning', calcOn: 'Fixed', value: 'As per structure' },
    { head: 'HRA', type: 'Earning', calcOn: '% of Basic', value: '40%' },
    { head: 'DA', type: 'Earning', calcOn: '% of Basic', value: '12%' },
    { head: 'Conveyance', type: 'Earning', calcOn: 'Fixed', value: '₹1,600' },
    { head: 'PF', type: 'Deduction', calcOn: '% of Basic', value: '12%' },
    { head: 'ESIC', type: 'Deduction', calcOn: '% of Gross', value: '0.75%' },
    { head: 'PT', type: 'Deduction', calcOn: 'Fixed', value: '₹200' },
    { head: 'TDS', type: 'Deduction', calcOn: 'As per slab', value: 'Variable' },
];

export const STRUCTURES: SalaryStructure[] = [
    { emp: 'Rajan Mehta', effDate: '01 Apr 2020', basic: 45000, hra: 18000, da: 5400, conv: 1600, pf: 5400, esic: 0, pt: 200, gross: 70000, net: 64400 },
    { emp: 'Priya Shah', effDate: '15 Jun 2021', basic: 28000, hra: 11200, da: 3360, conv: 1600, pf: 3360, esic: 210, pt: 200, gross: 44160, net: 40390 },
    { emp: 'Amit Kumar', effDate: '10 Jan 2019', basic: 38000, hra: 15200, da: 4560, conv: 1600, pf: 4560, esic: 0, pt: 200, gross: 59360, net: 54600 },
    { emp: 'Sunita Verma', effDate: '05 Mar 2022', basic: 32000, hra: 12800, da: 3840, conv: 1600, pf: 3840, esic: 240, pt: 200, gross: 50240, net: 45960 },
];

export const SALARY_SHEET: SalaryRow[] = [
    { emp: 'EMP-001', name: 'Rajan Mehta', total: 30, present: 30, gross: 70000, pf: 5400, esic: 0, pt: 200, tds: 3200, net: 61200 },
    { emp: 'EMP-002', name: 'Priya Shah', total: 30, present: 28, gross: 41216, pf: 3136, esic: 196, pt: 200, tds: 0, net: 37684 },
    { emp: 'EMP-003', name: 'Amit Kumar', total: 30, present: 30, gross: 59360, pf: 4560, esic: 0, pt: 200, tds: 1800, net: 52800 },
    { emp: 'EMP-004', name: 'Sunita Verma', total: 30, present: 29, gross: 48565, pf: 3712, esic: 232, pt: 200, tds: 0, net: 44421 },
    { emp: 'EMP-005', name: 'Dinesh Lohia', total: 30, present: 27, gross: 30360, pf: 2376, esic: 182, pt: 200, tds: 0, net: 27602 },
    { emp: 'EMP-006', name: 'Kavita Patel', total: 30, present: 30, gross: 47400, pf: 3600, esic: 0, pt: 200, tds: 0, net: 43600 },
];

export const ADVANCES: Advance[] = [
    { id: 'ADV-2024-012', emp: 'Amit Kumar', date: '02 Jun 2024', amount: 15000, purpose: 'Medical Emergency', recovery: 'Jul 2024', status: 'Pending' },
    { id: 'ADV-2024-011', emp: 'Dinesh Lohia', date: '15 May 2024', amount: 8000, purpose: 'Personal', recovery: 'Jun 2024', status: 'Recovered' },
    { id: 'ADV-2024-010', emp: 'Priya Shah', date: '01 Apr 2024', amount: 10000, purpose: 'Marriage', recovery: 'May 2024', status: 'Recovered' },
];
