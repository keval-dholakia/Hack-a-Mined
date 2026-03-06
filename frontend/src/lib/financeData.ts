// ─── Finance Seed Data ────────────────────────────────────

export interface Journal {
    no: string; date: string; debit: string; credit: string; amount: number; narration: string;
}
export interface Voucher {
    no: string; type: string; date: string; party: string;
    amount: number; mode: string; ref: string; bank: string;
}
export interface Contra {
    no: string; date: string; from: string; to: string; amount: number; purpose: string;
}
export interface GSTVoucher {
    no: string; date: string; ledger: string; adjType: string; amount: number; remark: string;
}
export interface BankReconItem {
    date: string; desc: string; bankAmt: number | null; bookAmt: number | null; status: string;
}
export interface CreditCardTx {
    card: string; date: string; merchant: string; amount: number; head: string;
}

export const JOURNALS: Journal[] = [
    { no: 'JV-2024-041', date: '05 Jun 2024', debit: 'Sales Account', credit: 'Party — Maruti Suzuki', amount: 482000, narration: 'SO-2024-112 Invoice' },
    { no: 'JV-2024-040', date: '04 Jun 2024', debit: 'Party — Tata Motors', credit: 'Sales Account', amount: 210500, narration: 'SO-2024-111 Invoice' },
    { no: 'JV-2024-039', date: '03 Jun 2024', debit: 'Purchase Account', credit: 'Party — Steel India', amount: 240000, narration: 'PO-2024-067 Bill' },
    { no: 'JV-2024-038', date: '01 Jun 2024', debit: 'Salary Account', credit: 'Bank Account — HDFC', amount: 306000, narration: 'May 2024 Payroll' },
];

export const VOUCHERS: Voucher[] = [
    { no: 'PV-2024-089', type: 'Payment', date: '04 Jun 2024', party: 'Steel India Ltd', amount: 240000, mode: 'NEFT', ref: 'NEFT24060412345', bank: 'HDFC Current' },
    { no: 'RV-2024-067', type: 'Receipt', date: '03 Jun 2024', party: 'Maruti Suzuki Ltd', amount: 482000, mode: 'NEFT', ref: 'NEFT24060398765', bank: 'HDFC Current' },
    { no: 'PV-2024-088', type: 'Payment', date: '01 Jun 2024', party: 'Rubber Works', amount: 45000, mode: 'Cheque', ref: 'CHQ-004521', bank: 'HDFC Current' },
    { no: 'RV-2024-066', type: 'Receipt', date: '31 May 2024', party: 'Hero MotoCorp', amount: 88000, mode: 'NEFT', ref: 'NEFT24053188001', bank: 'HDFC Current' },
];

export const CONTRAS: Contra[] = [
    { no: 'CV-2024-012', date: '05 Jun 2024', from: 'Cash in Hand', to: 'HDFC Current A/c', amount: 50000, purpose: 'Cash Deposit' },
    { no: 'CV-2024-011', date: '28 May 2024', from: 'HDFC Current A/c', to: 'Cash in Hand', amount: 20000, purpose: 'Cash Withdrawal' },
    { no: 'CV-2024-010', date: '20 May 2024', from: 'HDFC Current A/c', to: 'SBI Savings A/c', amount: 100000, purpose: 'Fund Transfer' },
];

export const GST_VOUCHERS: GSTVoucher[] = [
    { no: 'GJV-2024-008', date: '05 Jun 2024', ledger: 'Output GST 18%', adjType: 'Reversal', amount: 86760, remark: 'Credit note CN-2024-003' },
    { no: 'GJV-2024-007', date: '01 Jun 2024', ledger: 'Input GST 18%', adjType: 'Claim', amount: 43200, remark: 'PO-2024-067 ITC' },
    { no: 'GJV-2024-006', date: '25 May 2024', ledger: 'IGST Payable', adjType: 'Adjustment', amount: 12000, remark: 'Interstate purchase reclass' },
];

export const BANK_RECON: BankReconItem[] = [
    { date: '02 Jun', desc: 'Cheque issued — CHQ-004521', bankAmt: null, bookAmt: -45000, status: 'In Transit' },
    { date: '04 Jun', desc: 'NEFT Received — Maruti Suzuki', bankAmt: 482000, bookAmt: 482000, status: 'Matched' },
    { date: '04 Jun', desc: 'Bank charges — Jun 2024', bankAmt: -500, bookAmt: null, status: 'Unrecorded' },
    { date: '01 Jun', desc: 'NEFT Payment — Steel India', bankAmt: -240000, bookAmt: -240000, status: 'Matched' },
    { date: '03 Jun', desc: 'Interest credit', bankAmt: 1200, bookAmt: null, status: 'Unrecorded' },
];

export const CREDIT_CARDS: CreditCardTx[] = [
    { card: 'HDFC Biz ···8812', date: '12 May 2024', merchant: 'Amazon Business', amount: 18500, head: 'Office Supplies' },
    { card: 'HDFC Biz ···8812', date: '15 May 2024', merchant: 'Indigo Airlines', amount: 12200, head: 'Travel' },
    { card: 'HDFC Biz ···8812', date: '18 May 2024', merchant: 'Swiggy Business', amount: 4800, head: 'Staff Welfare' },
    { card: 'HDFC Biz ···8812', date: '22 May 2024', merchant: 'Flipkart Wholesale', amount: 32000, head: 'Equipment' },
    { card: 'SBI Corp ···3301', date: '05 May 2024', merchant: 'HP India', amount: 65000, head: 'Equipment' },
    { card: 'SBI Corp ···3301', date: '28 May 2024', merchant: 'MakeMyTrip', amount: 8900, head: 'Travel' },
];
