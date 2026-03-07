export type FreightBill = {
  id: string
  billNo: string
  date: string
  lrNo: string
  freightAmount: number
  gstAmount: number
  totalPayable: number
}

let freightBills: FreightBill[] = [
  {
    id: 'fb-1',
    billNo: 'FB-2603-001',
    date: '2026-03-02',
    lrNo: 'LR-991204',
    freightAmount: 26000,
    gstAmount: 4680,
    totalPayable: 30680,
  },
  {
    id: 'fb-2',
    billNo: 'FB-2603-002',
    date: '2026-03-04',
    lrNo: 'LR-991265',
    freightAmount: 18500,
    gstAmount: 3330,
    totalPayable: 21830,
  },
]

export const fetchFreightBills = async () => {
  const rows = [...freightBills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return Promise.resolve(rows)
}

export const createFreightBill = async (payload: Omit<FreightBill, 'id' | 'totalPayable'>) => {
  const row: FreightBill = {
    ...payload,
    id: `fb-${Math.random().toString(36).slice(2, 10)}`,
    totalPayable: payload.freightAmount + payload.gstAmount,
  }
  freightBills = [row, ...freightBills]
  return Promise.resolve(row)
}
