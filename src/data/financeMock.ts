export type Account = {
    id: string
    name: string
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
    subType: 'Cash' | 'Bank' | 'Party' | 'Tax' | 'General' | 'CreditCard'
    balance: number
}

export type VoucherType = 'Journal' | 'Payment' | 'Receipt' | 'Contra' | 'GST'

export type VoucherEntry = {
    accountId: string
    debit: number
    credit: number
}

export type Voucher = {
    id: string
    voucherNo: string
    type: VoucherType
    date: string
    narration: string
    entries: VoucherEntry[]
    totalAmount: number
    // Specific fields
    partyName?: string // for payment/receipt
    mode?: 'Cash' | 'Bank Transfer' | 'Cheque' // for payment/receipt
    gstAdjustmentType?: string // for GST
    fromAccount?: string // for contra helper view
    toAccount?: string // for contra helper view
}

export type BankReconLine = {
    id: string
    bankAccountId: string
    statementDate: string
    systemBalance: number
    bankBalance: number
    unreconciledAmount: number
    status: 'Reconciled' | 'Pending'
}

export type CreditCardTx = {
    id: string
    cardNo: string
    statementMonth: string
    transactionDate: string
    merchant: string
    amount: number
    expenseHeadId: string
}

let accounts: Account[] = [
    { id: 'a1', name: 'HDFC Bank C/A', type: 'Asset', subType: 'Bank', balance: 500000 },
    { id: 'a2', name: 'Petty Cash', type: 'Asset', subType: 'Cash', balance: 25000 },
    { id: 'a3', name: 'Input CGST', type: 'Asset', subType: 'Tax', balance: 10000 },
    { id: 'a4', name: 'Output CGST', type: 'Liability', subType: 'Tax', balance: -15000 },
    { id: 'a5', name: 'TechMicra Client A', type: 'Asset', subType: 'Party', balance: 55000 },
    { id: 'a6', name: 'Vendor B', type: 'Liability', subType: 'Party', balance: -20000 },
    { id: 'a7', name: 'Office Supplies Expense', type: 'Expense', subType: 'General', balance: 0 },
    { id: 'a8', name: 'Corporate Credit Card', type: 'Liability', subType: 'CreditCard', balance: 0 }
]

let vouchers: Voucher[] = [
    {
        id: 'v1', voucherNo: 'JV-26-001', type: 'Journal', date: '2026-03-01', narration: 'Adjustment for short payment', totalAmount: 500,
        entries: [{ accountId: 'a7', debit: 500, credit: 0 }, { accountId: 'a5', debit: 0, credit: 500 }]
    },
    {
        id: 'v2', voucherNo: 'RCPT-26-001', type: 'Receipt', date: '2026-03-02', narration: 'Received from client A', totalAmount: 25000,
        partyName: 'TechMicra Client A', mode: 'Bank Transfer',
        entries: [{ accountId: 'a1', debit: 25000, credit: 0 }, { accountId: 'a5', debit: 0, credit: 25000 }]
    },
    {
        id: 'v3', voucherNo: 'PMT-26-001', type: 'Payment', date: '2026-03-03', narration: 'Paid vendor B', totalAmount: 10000,
        partyName: 'Vendor B', mode: 'Cheque',
        entries: [{ accountId: 'a6', debit: 10000, credit: 0 }, { accountId: 'a1', debit: 0, credit: 10000 }]
    },
    {
        id: 'v4', voucherNo: 'CONT-26-001', type: 'Contra', date: '2026-03-04', narration: 'Cash withdrawal for petty expenses', totalAmount: 5000,
        fromAccount: 'HDFC Bank C/A', toAccount: 'Petty Cash',
        entries: [{ accountId: 'a2', debit: 5000, credit: 0 }, { accountId: 'a1', debit: 0, credit: 5000 }]
    },
    {
        id: 'v5', voucherNo: 'GST-26-001', type: 'GST', date: '2026-03-05', narration: 'ITC Reversal', totalAmount: 1000,
        gstAdjustmentType: 'Reversal',
        entries: [{ accountId: 'a7', debit: 1000, credit: 0 }, { accountId: 'a3', debit: 0, credit: 1000 }]
    }
]

let bankRecon: BankReconLine[] = [
    { id: 'br1', bankAccountId: 'a1', statementDate: '2026-02-28', systemBalance: 490000, bankBalance: 500000, unreconciledAmount: 10000, status: 'Pending' }
]

let ccStatements: CreditCardTx[] = [
    { id: 'cc1', cardNo: '**** 1234', statementMonth: 'Feb 2026', transactionDate: '2026-02-15', merchant: 'AWS Services', amount: 8000, expenseHeadId: 'a7' }
]

// Mock APIs
export const fetchAccounts = () => Promise.resolve([...accounts])
export const fetchVouchers = (type?: VoucherType) => Promise.resolve(type ? vouchers.filter(v => v.type === type) : [...vouchers])
export const createVoucher = (v: Omit<Voucher, 'id' | 'voucherNo'>) => {
    const newVoucher: Voucher = {
        ...v,
        id: Math.random().toString(),
        voucherNo: `${v.type.substring(0, 2).toUpperCase()}-26-${Math.floor(Math.random() * 1000)}`
    }
    vouchers.push(newVoucher)
    // Process ledger balances
    newVoucher.entries.forEach(ent => {
        const acc = accounts.find(a => a.id === ent.accountId)
        if (acc) {
            if (acc.type === 'Asset' || acc.type === 'Expense') {
                acc.balance += (ent.debit - ent.credit)
            } else {
                acc.balance += (ent.credit - ent.debit)
            }
        }
    })
    return Promise.resolve(newVoucher)
}
export const fetchBankRecon = () => Promise.resolve([...bankRecon])
export const updateBankRecon = (id: string, bankBal: number) => {
    const r = bankRecon.find(x => x.id === id)
    if (r) {
        r.bankBalance = bankBal
        r.unreconciledAmount = Math.abs(r.systemBalance - bankBal)
        if (r.unreconciledAmount === 0) r.status = 'Reconciled'
        else r.status = 'Pending'
    }
    return Promise.resolve()
}
export const fetchCcStatements = () => Promise.resolve([...ccStatements])
export const createCcStatement = (tx: Omit<CreditCardTx, 'id'>) => {
    const n = { ...tx, id: Math.random().toString() }
    ccStatements.push(n)

    // also create an implicit journal voucher for CC expense
    createVoucher({
        type: 'Journal',
        date: tx.transactionDate,
        narration: `CC Purchase @ ${tx.merchant}`,
        totalAmount: tx.amount,
        entries: [
            { accountId: tx.expenseHeadId, debit: tx.amount, credit: 0 },
            { accountId: 'a8', debit: 0, credit: tx.amount }
        ]
    })
    return Promise.resolve(n)
}
