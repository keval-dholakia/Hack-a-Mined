// Frontend-only statutory mock repository.
// Replace these functions with API/server calls when backend tables are available.

export type GSTTaxRule = {
  id: string
  hsnCode: string
  description: string
  igstPercent: number
  cgstPercent: number
  sgstPercent: number
}

export type GSTR1Upload = {
  id: string
  month: string
  invoiceNo: string
  customerGstin: string
  taxableValue: number
  taxAmount: number
  state: string
}

export type GST2AReconciliation = {
  id: string
  month: string
  vendorGstin: string
  totalInputTaxCredit: number
  matchedAmount: number
  mismatchAmount: number
}

export type GSTDepositChallan = {
  id: string
  challanNo: string
  cpin: string
  date: string
  bank: string
  taxType: 'CGST' | 'SGST'
  amount: number
}

export type GSTRRegister = {
  id: string
  dateRange: string
  transactionType: 'B2B' | 'B2C'
  totalTaxLiability: number
}

export type TDSTrace = {
  id: string
  section: string
  deducteeName: string
  paymentAmount: number
  tdsRate: number
  tdsAmount: number
  certificateNo: string
}

export type TCSDetail = {
  id: string
  customerName: string
  saleValue: number
  tcsRate: number
  tcsAmount: number
}

export type ChequeBook = {
  id: string
  bankAccount: string
  startLeafNo: string
  endLeafNo: string
}

export type ChequeLeafStatus = {
  id: string
  leafNo: string
  status: 'Used' | 'Cancelled' | 'Blank'
  issuedTo: string
  date: string
}

export type BalanceSheet = {
  id: string
  asOnDate: string
  assetsTotal: number
  liabilitiesTotal: number
  capitalAccount: number
  currentAssets: number
}

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`
const copy = <T extends object>(rows: T[]) => rows.map((row) => ({ ...row }))

let gstTaxRules: GSTTaxRule[] = [
  { id: makeId('gtr'), hsnCode: '8483', description: 'Transmission Shafts and Parts', igstPercent: 18, cgstPercent: 9, sgstPercent: 9 },
  { id: makeId('gtr'), hsnCode: '7308', description: 'Structures and Parts of Structures', igstPercent: 18, cgstPercent: 9, sgstPercent: 9 },
  { id: makeId('gtr'), hsnCode: '8414', description: 'Air or Vacuum Pumps', igstPercent: 28, cgstPercent: 14, sgstPercent: 14 },
]

let gstr1Uploads: GSTR1Upload[] = [
  { id: makeId('g1'), month: '2026-02', invoiceNo: 'INV-2602-018', customerGstin: '27ABCDE1234F1Z5', taxableValue: 245000, taxAmount: 44100, state: 'Maharashtra' },
  { id: makeId('g1'), month: '2026-02', invoiceNo: 'INV-2602-024', customerGstin: '29PQRSX4321N1Z2', taxableValue: 182000, taxAmount: 32760, state: 'Karnataka' },
]

let gst2aReconciliations: GST2AReconciliation[] = [
  { id: makeId('g2a'), month: '2026-02', vendorGstin: '27AAACM1234A1Z4', totalInputTaxCredit: 126500, matchedAmount: 119300, mismatchAmount: 7200 },
  { id: makeId('g2a'), month: '2026-02', vendorGstin: '29AAEFR7788M1ZA', totalInputTaxCredit: 84200, matchedAmount: 84200, mismatchAmount: 0 },
]

let gstDepositChallans: GSTDepositChallan[] = [
  { id: makeId('ch'), challanNo: 'CH-2026-114', cpin: 'CPIN88931147', date: '2026-03-02', bank: 'HDFC Bank', taxType: 'CGST', amount: 78500 },
  { id: makeId('ch'), challanNo: 'CH-2026-115', cpin: 'CPIN88931148', date: '2026-03-02', bank: 'HDFC Bank', taxType: 'SGST', amount: 78500 },
]

let gstrRegisters: GSTRRegister[] = [
  { id: makeId('gr'), dateRange: '2026-02-01 to 2026-02-28', transactionType: 'B2B', totalTaxLiability: 142360 },
  { id: makeId('gr'), dateRange: '2026-02-01 to 2026-02-28', transactionType: 'B2C', totalTaxLiability: 64720 },
]

let tdsTraces: TDSTrace[] = [
  { id: makeId('tds'), section: '194C', deducteeName: 'R.K. Logistics Services', paymentAmount: 185000, tdsRate: 2, tdsAmount: 3700, certificateNo: 'CERT-TDS-2602-11' },
  { id: makeId('tds'), section: '194J', deducteeName: 'Arun Consultants', paymentAmount: 94000, tdsRate: 10, tdsAmount: 9400, certificateNo: 'CERT-TDS-2602-14' },
]

let tcsDetails: TCSDetail[] = [
  { id: makeId('tcs'), customerName: 'Zenith Metal Traders', saleValue: 450000, tcsRate: 0.1, tcsAmount: 450 },
  { id: makeId('tcs'), customerName: 'Pioneer Fabrication Works', saleValue: 680000, tcsRate: 0.1, tcsAmount: 680 },
]

let chequeBooks: ChequeBook[] = [
  { id: makeId('cb'), bankAccount: 'HDFC Current Account - 0021', startLeafNo: '550201', endLeafNo: '550250' },
  { id: makeId('cb'), bankAccount: 'SBI Current Account - 1188', startLeafNo: '880901', endLeafNo: '880940' },
]

let chequeLeafStatuses: ChequeLeafStatus[] = [
  { id: makeId('cbs'), leafNo: '550203', status: 'Used', issuedTo: 'R.K. Logistics Services', date: '2026-03-01' },
  { id: makeId('cbs'), leafNo: '550204', status: 'Cancelled', issuedTo: 'Arun Consultants', date: '2026-03-02' },
  { id: makeId('cbs'), leafNo: '550205', status: 'Blank', issuedTo: '-', date: '-' },
]

let balanceSheets: BalanceSheet[] = [
  { id: makeId('bs'), asOnDate: '2026-01-31', assetsTotal: 12450000, liabilitiesTotal: 12450000, capitalAccount: 6410000, currentAssets: 4680000 },
  { id: makeId('bs'), asOnDate: '2026-02-28', assetsTotal: 12870000, liabilitiesTotal: 12870000, capitalAccount: 6635000, currentAssets: 4915000 },
]

export const fetchGSTTaxRules = () => Promise.resolve(copy(gstTaxRules))
export const createGSTTaxRule = (payload: Omit<GSTTaxRule, 'id'>) => {
  const row: GSTTaxRule = { id: makeId('gtr'), ...payload }
  gstTaxRules = [row, ...gstTaxRules]
  return Promise.resolve({ ...row })
}

export const fetchGSTR1Uploads = () => Promise.resolve(copy(gstr1Uploads))
export const createGSTR1Upload = (payload: Omit<GSTR1Upload, 'id'>) => {
  const row: GSTR1Upload = { id: makeId('g1'), ...payload }
  gstr1Uploads = [row, ...gstr1Uploads]
  return Promise.resolve({ ...row })
}

export const fetchGST2AReconciliations = () => Promise.resolve(copy(gst2aReconciliations))
export const createGST2AReconciliation = (payload: Omit<GST2AReconciliation, 'id'>) => {
  const row: GST2AReconciliation = { id: makeId('g2a'), ...payload }
  gst2aReconciliations = [row, ...gst2aReconciliations]
  return Promise.resolve({ ...row })
}

export const fetchGSTDepositChallans = () => Promise.resolve(copy(gstDepositChallans))
export const createGSTDepositChallan = (payload: Omit<GSTDepositChallan, 'id'>) => {
  const row: GSTDepositChallan = { id: makeId('ch'), ...payload }
  gstDepositChallans = [row, ...gstDepositChallans]
  return Promise.resolve({ ...row })
}

export const fetchGSTRRegisters = () => Promise.resolve(copy(gstrRegisters))
export const createGSTRRegister = (payload: Omit<GSTRRegister, 'id'>) => {
  const row: GSTRRegister = { id: makeId('gr'), ...payload }
  gstrRegisters = [row, ...gstrRegisters]
  return Promise.resolve({ ...row })
}

export const fetchTDSTraces = () => Promise.resolve(copy(tdsTraces))
export const createTDSTrace = (payload: Omit<TDSTrace, 'id'>) => {
  const row: TDSTrace = { id: makeId('tds'), ...payload }
  tdsTraces = [row, ...tdsTraces]
  return Promise.resolve({ ...row })
}

export const fetchTCSDetails = () => Promise.resolve(copy(tcsDetails))
export const createTCSDetail = (payload: Omit<TCSDetail, 'id'>) => {
  const row: TCSDetail = { id: makeId('tcs'), ...payload }
  tcsDetails = [row, ...tcsDetails]
  return Promise.resolve({ ...row })
}

export const fetchChequeBooks = () => Promise.resolve(copy(chequeBooks))
export const createChequeBook = (payload: Omit<ChequeBook, 'id'>) => {
  const row: ChequeBook = { id: makeId('cb'), ...payload }
  chequeBooks = [row, ...chequeBooks]
  return Promise.resolve({ ...row })
}

export const fetchChequeLeafStatuses = () => Promise.resolve(copy(chequeLeafStatuses))
export const createChequeLeafStatus = (payload: Omit<ChequeLeafStatus, 'id'>) => {
  const row: ChequeLeafStatus = { id: makeId('cbs'), ...payload }
  chequeLeafStatuses = [row, ...chequeLeafStatuses]
  return Promise.resolve({ ...row })
}

export const fetchBalanceSheets = () => Promise.resolve(copy(balanceSheets))
export const createBalanceSheet = (payload: Omit<BalanceSheet, 'id'>) => {
  const row: BalanceSheet = { id: makeId('bs'), ...payload }
  balanceSheets = [row, ...balanceSheets]
  return Promise.resolve({ ...row })
}
