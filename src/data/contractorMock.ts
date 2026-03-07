// ─── Contractor Module Static Data Engine ────────────────────────────────────
// Entities: ContractorFirm → Worker → SalaryHead (Role) → SalaryStructure
//        → SalarySheet → AdvanceMemo → VoucherPayment
// All IDs are string-based for simplicity.

export type ContractorFirm = {
    id: string
    name: string
    gstin: string
    contact: string
    address: string
}

export type ContractorWorker = {
    id: string
    workerId: string       // e.g. CW-001
    firmId: string         // ref ContractorFirm
    name: string
    skillLevel: 'Skilled' | 'Semi-Skilled' | 'Unskilled'
    aadhar: string
    trade: string
}

export type ContractorRole = {
    id: string
    role: string           // Helper, Welder, Mason, Fitter …
    dailyRate: number
    otRate: number         // per hour
}

export type ContractorStructure = {
    id: string
    workerId: string       // ref ContractorWorker
    roleId: string         // ref ContractorRole
    dailyRate: number      // taken from role unless overridden
}

export type ContractorSheet = {
    id: string
    sheetNo: string
    firmId: string
    workerId: string
    month: string          // e.g. 'Feb 2026'
    daysWorked: number
    otHours: number
    dailyRate: number
    otRate: number
    grossPay: number       // (days × daily) + (ot × otRate)
    advanceDeducted: number
    tdsDeducted: number
    netPayable: number
    status: 'Draft' | 'Approved' | 'Paid'
}

export type ContractorAdvance = {
    id: string
    memoNo: string
    firmId: string
    workerId: string
    date: string
    amount: number
    remarks: string
    recovered: boolean
}

export type ContractorPayment = {
    id: string
    voucherNo: string
    firmId: string
    sheetId: string
    date: string
    netAmountPaid: number
    tdsDeducted: number
    paymentMode: 'NEFT' | 'RTGS' | 'Cheque' | 'Cash'
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const contractorFirms: ContractorFirm[] = [
    { id: 'f1', name: 'Aarav Labour Contractors Pvt Ltd', gstin: '24AABCA1234F1ZX', contact: '9876543300', address: 'Plot 12, GIDC Vatva, Ahmedabad' },
    { id: 'f2', name: 'Bharat Manpower Services', gstin: '24AABCB4567G2ZY', contact: '9876543311', address: 'Shed B4, Sachin Industrial Estate, Surat' },
    { id: 'f3', name: 'Kiran Civil Works', gstin: '24AABCK7890H3ZZ', contact: '9876543322', address: 'Opp. SIDCO Complex, Rajkot' },
]

export const contractorRoles: ContractorRole[] = [
    { id: 'r1', role: 'Welder', dailyRate: 800, otRate: 120 },
    { id: 'r2', role: 'Fitter', dailyRate: 750, otRate: 110 },
    { id: 'r3', role: 'Helper', dailyRate: 450, otRate: 70 },
    { id: 'r4', role: 'Mason', dailyRate: 700, otRate: 100 },
    { id: 'r5', role: 'Electrician', dailyRate: 900, otRate: 140 },
    { id: 'r6', role: 'Machine Operator', dailyRate: 850, otRate: 130 },
]

export const contractorWorkers: ContractorWorker[] = [
    { id: 'w1', workerId: 'CW-001', firmId: 'f1', name: 'Ramesh Patel', skillLevel: 'Skilled', aadhar: '2345 6789 0123', trade: 'Welding' },
    { id: 'w2', workerId: 'CW-002', firmId: 'f1', name: 'Suresh Solanki', skillLevel: 'Semi-Skilled', aadhar: '3456 7890 1234', trade: 'Fitting' },
    { id: 'w3', workerId: 'CW-003', firmId: 'f1', name: 'Mahesh Jat', skillLevel: 'Unskilled', aadhar: '4567 8901 2345', trade: 'Helping' },
    { id: 'w4', workerId: 'CW-004', firmId: 'f2', name: 'Dinesh Rathod', skillLevel: 'Skilled', aadhar: '5678 9012 3456', trade: 'Electrical' },
    { id: 'w5', workerId: 'CW-005', firmId: 'f2', name: 'Vinod Chauhan', skillLevel: 'Skilled', aadhar: '6789 0123 4567', trade: 'Machine Operation' },
    { id: 'w6', workerId: 'CW-006', firmId: 'f2', name: 'Bhagat Kumar', skillLevel: 'Unskilled', aadhar: '7890 1234 5678', trade: 'Helping' },
    { id: 'w7', workerId: 'CW-007', firmId: 'f3', name: 'Ankit Bhai', skillLevel: 'Skilled', aadhar: '8901 2345 6789', trade: 'Masonry' },
    { id: 'w8', workerId: 'CW-008', firmId: 'f3', name: 'Prakash Nayak', skillLevel: 'Semi-Skilled', aadhar: '9012 3456 7890', trade: 'Masonry' },
]

export const contractorStructures: ContractorStructure[] = [
    { id: 'cs1', workerId: 'w1', roleId: 'r1', dailyRate: 800 },
    { id: 'cs2', workerId: 'w2', roleId: 'r2', dailyRate: 750 },
    { id: 'cs3', workerId: 'w3', roleId: 'r3', dailyRate: 450 },
    { id: 'cs4', workerId: 'w4', roleId: 'r5', dailyRate: 900 },
    { id: 'cs5', workerId: 'w5', roleId: 'r6', dailyRate: 850 },
    { id: 'cs6', workerId: 'w6', roleId: 'r3', dailyRate: 450 },
    { id: 'cs7', workerId: 'w7', roleId: 'r4', dailyRate: 700 },
    { id: 'cs8', workerId: 'w8', roleId: 'r4', dailyRate: 700 },
]

function calcSheet(
    id: string, sheetNo: string, firmId: string, workerId: string,
    month: string, days: number, ot: number, dailyRate: number, otRate: number,
    advance: number, tds: number, status: ContractorSheet['status']
): ContractorSheet {
    const gross = Math.round(days * dailyRate + ot * otRate)
    const net = gross - advance - tds
    return { id, sheetNo, firmId, workerId, month, daysWorked: days, otHours: ot, dailyRate, otRate, grossPay: gross, advanceDeducted: advance, tdsDeducted: tds, netPayable: net, status }
}

export let contractorSheets: ContractorSheet[] = [
    calcSheet('ss1', 'CSH-26-001', 'f1', 'w1', 'Feb 2026', 24, 8, 800, 120, 2000, 0, 'Paid'),
    calcSheet('ss2', 'CSH-26-002', 'f1', 'w2', 'Feb 2026', 26, 4, 750, 110, 1000, 0, 'Paid'),
    calcSheet('ss3', 'CSH-26-003', 'f1', 'w3', 'Feb 2026', 25, 0, 450, 70, 0, 0, 'Paid'),
    calcSheet('ss4', 'CSH-26-004', 'f2', 'w4', 'Feb 2026', 23, 10, 900, 140, 3000, 0, 'Approved'),
    calcSheet('ss5', 'CSH-26-005', 'f2', 'w5', 'Feb 2026', 26, 6, 850, 130, 0, 0, 'Approved'),
    calcSheet('ss6', 'CSH-26-006', 'f2', 'w6', 'Feb 2026', 20, 0, 450, 70, 0, 0, 'Draft'),
    calcSheet('ss7', 'CSH-26-007', 'f3', 'w7', 'Feb 2026', 22, 12, 700, 100, 1500, 0, 'Draft'),
    calcSheet('ss8', 'CSH-26-008', 'f3', 'w8', 'Feb 2026', 28, 0, 700, 100, 0, 0, 'Draft'),
    // March 2026 in progress
    calcSheet('ss9', 'CSH-26-009', 'f1', 'w1', 'Mar 2026', 4, 2, 800, 120, 0, 0, 'Draft'),
]

export let contractorAdvances: ContractorAdvance[] = [
    { id: 'ca1', memoNo: 'ADV-26-001', firmId: 'f1', workerId: 'w1', date: '2026-02-05', amount: 2000, remarks: 'Personal medical emergency advance', recovered: true },
    { id: 'ca2', memoNo: 'ADV-26-002', firmId: 'f1', workerId: 'w2', date: '2026-02-10', amount: 1000, remarks: 'Festival advance Mahashivratri', recovered: true },
    { id: 'ca3', memoNo: 'ADV-26-003', firmId: 'f2', workerId: 'w4', date: '2026-02-08', amount: 3000, remarks: 'Advance against Feb salary – tools cost', recovered: false },
    { id: 'ca4', memoNo: 'ADV-26-004', firmId: 'f3', workerId: 'w7', date: '2026-02-14', amount: 1500, remarks: 'Travel advance', recovered: false },
    { id: 'ca5', memoNo: 'ADV-26-005', firmId: 'f1', workerId: 'w3', date: '2026-03-01', amount: 800, remarks: 'Advance for ongoing work in March', recovered: false },
]

export let contractorPayments: ContractorPayment[] = [
    { id: 'cp1', voucherNo: 'CPMT-26-001', firmId: 'f1', sheetId: 'ss1', date: '2026-03-01', netAmountPaid: 17360, tdsDeducted: 0, paymentMode: 'NEFT' },
    { id: 'cp2', voucherNo: 'CPMT-26-002', firmId: 'f1', sheetId: 'ss2', date: '2026-03-01', netAmountPaid: 18540, tdsDeducted: 0, paymentMode: 'NEFT' },
    { id: 'cp3', voucherNo: 'CPMT-26-003', firmId: 'f1', sheetId: 'ss3', date: '2026-03-01', netAmountPaid: 11250, tdsDeducted: 0, paymentMode: 'RTGS' },
]

// ─── Mutable API (client-side only) ──────────────────────────────────────────

export const getWorkerById = (id: string) => contractorWorkers.find(w => w.id === id)
export const getFirmById = (id: string) => contractorFirms.find(f => f.id === id)
export const getRoleById = (id: string) => contractorRoles.find(r => r.id === id)
export const getStructureFor = (workerId: string) => contractorStructures.find(s => s.workerId === workerId)

export function addWorker(w: Omit<ContractorWorker, 'id'>) {
    const n: ContractorWorker = { ...w, id: `w${Date.now()}` }
    contractorWorkers.push(n)
    return n
}

export function addStructure(s: Omit<ContractorStructure, 'id'>) {
    const existing = contractorStructures.findIndex(x => x.workerId === s.workerId)
    if (existing !== -1) { contractorStructures[existing] = { ...s, id: contractorStructures[existing].id }; return contractorStructures[existing] }
    const n: ContractorStructure = { ...s, id: `cs${Date.now()}` }
    contractorStructures.push(n)
    return n
}

export function addSheet(s: Omit<ContractorSheet, 'id' | 'sheetNo' | 'grossPay' | 'netPayable'>) {
    const gross = Math.round(s.daysWorked * s.dailyRate + s.otHours * s.otRate)
    const net = gross - s.advanceDeducted - s.tdsDeducted
    const n: ContractorSheet = { ...s, id: `ss${Date.now()}`, sheetNo: `CSH-26-${Math.floor(Math.random() * 900 + 100)}`, grossPay: gross, netPayable: net }
    contractorSheets.push(n)
    return n
}

export function updateSheetStatus(id: string, status: ContractorSheet['status']) {
    const sh = contractorSheets.find(s => s.id === id)
    if (sh) sh.status = status
}

export function addAdvance(a: Omit<ContractorAdvance, 'id' | 'memoNo'>) {
    const n: ContractorAdvance = { ...a, id: `ca${Date.now()}`, memoNo: `ADV-26-${Math.floor(Math.random() * 900 + 100)}` }
    contractorAdvances.push(n)
    return n
}

export function addPayment(p: Omit<ContractorPayment, 'id' | 'voucherNo'>) {
    const n: ContractorPayment = { ...p, id: `cp${Date.now()}`, voucherNo: `CPMT-26-${Math.floor(Math.random() * 900 + 100)}` }
    contractorPayments.push(n)
    // Mark the sheet as Paid
    updateSheetStatus(p.sheetId, 'Paid')
    return n
}
