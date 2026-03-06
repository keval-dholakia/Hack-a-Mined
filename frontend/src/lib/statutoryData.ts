export interface GstReturn {
    returnType: string;
    period: string;
    dueDate: string;
    outputTax: number;
    inputCredit: number;
    payable: number;
    challan: string;
    status: 'Filed' | 'Pending' | 'Overdue';
}

export interface TdsTcsEntry {
    challan: string;
    section: string;
    period: string;
    dueDate: string;
    deductees: number;
    amount: number;
    kind: 'TDS' | 'TCS';
    status: 'Filed' | 'Pending' | 'Overdue';
}

export interface BalanceSheetLine {
    head: string;
    group: 'Assets' | 'Liabilities';
    amount: number;
}

export const GST_RETURNS: GstReturn[] = [
    {
        returnType: 'GSTR-1',
        period: 'May 2024',
        dueDate: '11 Jun 2024',
        outputTax: 286000,
        inputCredit: 0,
        payable: 0,
        challan: 'GSTN240611001',
        status: 'Filed',
    },
    {
        returnType: 'GSTR-3B',
        period: 'May 2024',
        dueDate: '20 Jun 2024',
        outputTax: 286000,
        inputCredit: 161500,
        payable: 124500,
        challan: 'GSTN240620112',
        status: 'Pending',
    },
    {
        returnType: 'GSTR-1',
        period: 'Apr 2024',
        dueDate: '11 May 2024',
        outputTax: 272400,
        inputCredit: 0,
        payable: 0,
        challan: 'GSTN240511730',
        status: 'Filed',
    },
];

export const TDS_TCS_ENTRIES: TdsTcsEntry[] = [
    {
        challan: 'TDS240607221',
        section: '194C - Contractor',
        period: 'May 2024',
        dueDate: '07 Jun 2024',
        deductees: 12,
        amount: 48200,
        kind: 'TDS',
        status: 'Pending',
    },
    {
        challan: 'TCS240607104',
        section: '206C(1H) - Sales',
        period: 'May 2024',
        dueDate: '07 Jun 2024',
        deductees: 3,
        amount: 15400,
        kind: 'TCS',
        status: 'Pending',
    },
    {
        challan: 'TDS240507884',
        section: '194J - Professional',
        period: 'Apr 2024',
        dueDate: '07 May 2024',
        deductees: 5,
        amount: 22100,
        kind: 'TDS',
        status: 'Filed',
    },
];

export const BALANCE_SHEET_LINES: BalanceSheetLine[] = [
    { head: 'Plant & Machinery', group: 'Assets', amount: 4250000 },
    { head: 'Inventory', group: 'Assets', amount: 2860000 },
    { head: 'Trade Receivables', group: 'Assets', amount: 2140000 },
    { head: 'Cash & Bank', group: 'Assets', amount: 2840000 },
    { head: 'Capital', group: 'Liabilities', amount: 6150000 },
    { head: 'Term Loan', group: 'Liabilities', amount: 2310000 },
    { head: 'Trade Payables', group: 'Liabilities', amount: 2040000 },
    { head: 'Statutory Dues Payable', group: 'Liabilities', amount: 1590000 },
];
