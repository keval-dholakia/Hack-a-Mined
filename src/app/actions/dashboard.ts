'use server'

import { createClient } from '@/lib/supabase/server'

function getLast3Months() {
  const months = []
  for (let i = 2; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push({
      label: d.toLocaleString('default', { month: 'short' }),
      from:  new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
      to:    new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString(),
    })
  }
  return months
}

// ── Super Admin ───────────────────────────────────────────────────────────────

export async function getSuperAdminDashboard() {
  const supabase = await createClient()
  const months   = getLast3Months()
  const from     = months[0].from
  const to       = months[2].to

  const [
    { count: activeOrders },
    { count: pendingInvoices },
    { count: overdueInvoices },
    { data: invoices },
    { data: purchaseBills },
    { data: productionReports },
  ] = await Promise.all([
    supabase.from('sale_orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).in('payment_status', ['Unpaid', 'Partial']),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid').lt('due_date', new Date().toISOString().split('T')[0]),
    supabase.from('invoices').select('invoice_date, grand_total, payment_status').gte('invoice_date', from).lte('invoice_date', to),
    supabase.from('purchase_bills').select('bill_date, total_amount').gte('bill_date', from).lte('bill_date', to),
    supabase.from('production_reports').select('report_date, good_qty').gte('report_date', from).lte('report_date', to),
  ])

  // Build monthly chart data
  const chartData = months.map(m => {
    const revenue  = (invoices ?? []).filter(i => i.invoice_date >= m.from && i.invoice_date <= m.to).reduce((s, i) => s + (i.grand_total ?? 0), 0)
    const purchase = (purchaseBills ?? []).filter(b => b.bill_date >= m.from && b.bill_date <= m.to).reduce((s, b) => s + (b.total_amount ?? 0), 0)
    const output   = (productionReports ?? []).filter(r => r.report_date >= m.from && r.report_date <= m.to).reduce((s, r) => s + (r.good_qty ?? 0), 0)
    return { month: m.label, revenue, purchase, output }
  })

  const invoiceStatusData = [
    { name: 'Paid',    value: (invoices ?? []).filter(i => i.payment_status === 'Paid').length },
    { name: 'Partial', value: (invoices ?? []).filter(i => i.payment_status === 'Partial').length },
    { name: 'Unpaid',  value: (invoices ?? []).filter(i => i.payment_status === 'Unpaid').length },
  ]

  const totalRevenue  = (invoices ?? []).reduce((s, i) => s + (i.grand_total ?? 0), 0)
  const totalPurchase = (purchaseBills ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0)

  return {
    kpis: {
      totalRevenue,
      totalPurchase,
      activeOrders:    activeOrders ?? 0,
      pendingInvoices: pendingInvoices ?? 0,
      overdueInvoices: overdueInvoices ?? 0,
    },
    chartData,
    invoiceStatusData,
  }
}

// ── Sales Manager ─────────────────────────────────────────────────────────────

export async function getSalesDashboard() {
  const supabase = await createClient()
  const months   = getLast3Months()
  const from     = months[0].from
  const to       = months[2].to
  const today    = new Date().toISOString().split('T')[0]

  const [
    { count: openInquiries },
    { count: activeSaleOrders },
    { count: overdueInvoices },
    { count: pendingReminders },
    { data: invoices },
    { data: receipts },
  ] = await Promise.all([
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Open'),
    supabase.from('sale_orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid').lt('due_date', today),
    supabase.from('reminder_logs').select('*', { count: 'exact', head: true }).gte('sent_at', today),
    supabase.from('invoices').select('invoice_date, grand_total, payment_status').gte('invoice_date', from).lte('invoice_date', to),
    supabase.from('receipt_vouchers').select('receipt_date, amount').gte('receipt_date', from).lte('receipt_date', to),
  ])

  const chartData = months.map(m => {
    const invoiced  = (invoices ?? []).filter(i => i.invoice_date >= m.from && i.invoice_date <= m.to).reduce((s, i) => s + (i.grand_total ?? 0), 0)
    const collected = (receipts ?? []).filter(r => r.receipt_date >= m.from && r.receipt_date <= m.to).reduce((s, r) => s + (r.amount ?? 0), 0)
    return { month: m.label, invoiced, collected }
  })

  const invoiceStatusData = [
    { name: 'Paid',    value: (invoices ?? []).filter(i => i.payment_status === 'Paid').length },
    { name: 'Partial', value: (invoices ?? []).filter(i => i.payment_status === 'Partial').length },
    { name: 'Unpaid',  value: (invoices ?? []).filter(i => i.payment_status === 'Unpaid').length },
  ]

  const totalInvoiced  = (invoices ?? []).reduce((s, i) => s + (i.grand_total ?? 0), 0)
  const totalCollected = (receipts ?? []).reduce((s, r) => s + (r.amount ?? 0), 0)

  return {
    kpis: {
      openInquiries:    openInquiries ?? 0,
      activeSaleOrders: activeSaleOrders ?? 0,
      overdueInvoices:  overdueInvoices ?? 0,
      pendingReminders: pendingReminders ?? 0,
      totalInvoiced,
      totalCollected,
    },
    chartData,
    invoiceStatusData,
  }
}

// ── Purchase Manager ──────────────────────────────────────────────────────────

export async function getPurchaseDashboard() {
  const supabase = await createClient()
  const months   = getLast3Months()
  const from     = months[0].from
  const to       = months[2].to

  const [
    { count: openPOs },
    { count: grnsAwaitingIQC },
    { count: pendingBills },
    { count: activeVendors },
    { data: bills },
  ] = await Promise.all([
    supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).in('status', ['Open', 'Partial']),
    supabase.from('grns').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('purchase_bills').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid'),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', 1),
    supabase.from('purchase_bills').select('bill_date, total_amount, payment_status').gte('bill_date', from).lte('bill_date', to),
  ])

  const chartData = months.map(m => {
    const total = (bills ?? []).filter(b => b.bill_date >= m.from && b.bill_date <= m.to).reduce((s, b) => s + (b.total_amount ?? 0), 0)
    return { month: m.label, total }
  })

  const billStatusData = [
    { name: 'Paid',    value: (bills ?? []).filter(b => b.payment_status === 'Paid').length },
    { name: 'Unpaid',  value: (bills ?? []).filter(b => b.payment_status === 'Unpaid').length },
  ]

  const totalPurchase = (bills ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0)

  return {
    kpis: {
      openPOs:         openPOs ?? 0,
      grnsAwaitingIQC: grnsAwaitingIQC ?? 0,
      pendingBills:    pendingBills ?? 0,
      activeVendors:   activeVendors ?? 0,
      totalPurchase,
    },
    chartData,
    billStatusData,
  }
}

// ── Production Manager ────────────────────────────────────────────────────────

export async function getProductionDashboard() {
  const supabase = await createClient()
  const months   = getLast3Months()
  const from     = months[0].from
  const to       = months[2].to

  const [
    { count: activeRouteCards },
    { count: openBOMs },
    { data: reports },
    { data: issues },
  ] = await Promise.all([
    supabase.from('route_cards').select('*', { count: 'exact', head: true }).in('status', ['Open', 'In Progress']),
    supabase.from('bom_headers').select('*', { count: 'exact', head: true }).eq('is_active', 1),
    supabase.from('production_reports').select('report_date, good_qty, rejection_qty').gte('report_date', from).lte('report_date', to),
    supabase.from('material_issues').select('issue_date').gte('issue_date', from).lte('issue_date', to),
  ])

  const completedThisMonth = (reports ?? []).filter(r => {
    const d = new Date(r.report_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const totalRejection = (reports ?? []).reduce((s, r) => s + (r.rejection_qty ?? 0), 0)
  const totalOutput    = (reports ?? []).reduce((s, r) => s + (r.good_qty ?? 0), 0)

  const chartData = months.map(m => {
    const output    = (reports ?? []).filter(r => r.report_date >= m.from && r.report_date <= m.to).reduce((s, r) => s + (r.good_qty ?? 0), 0)
    const rejection = (reports ?? []).filter(r => r.report_date >= m.from && r.report_date <= m.to).reduce((s, r) => s + (r.rejection_qty ?? 0), 0)
    return { month: m.label, output, rejection }
  })

  const routeStatusData = [
    { name: 'Open',        value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Closed',      value: 0 },
  ]

  return {
    kpis: {
      activeRouteCards:   activeRouteCards ?? 0,
      completedThisMonth,
      totalRejection,
      totalOutput,
      materialIssues:     (issues ?? []).length,
      openBOMs:           openBOMs ?? 0,
    },
    chartData,
    routeStatusData,
  }
}

// ── HR Manager ────────────────────────────────────────────────────────────────

export async function getHRDashboard() {
  const supabase = await createClient()

  const [
    { count: totalEmployees },
    { count: activeEmployees },
    { data: employees },
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }),
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('is_active', 1),
    supabase.from('employees').select('department, is_active'),
  ])

  // Department breakdown
  const deptMap: Record<string, number> = {}
  for (const emp of employees ?? []) {
    if (!emp.department) continue
    deptMap[emp.department] = (deptMap[emp.department] ?? 0) + 1
  }
  const deptChartData = Object.entries(deptMap).map(([dept, count]) => ({
    department: dept,
    count,
  }))

  return {
    kpis: {
      totalEmployees:  totalEmployees ?? 0,
      activeEmployees: activeEmployees ?? 0,
      inactiveEmployees: (totalEmployees ?? 0) - (activeEmployees ?? 0),
    },
    deptChartData,
  }
}

// ── Finance Manager ───────────────────────────────────────────────────────────

export async function getFinanceDashboard() {
  const supabase = await createClient()
  const months   = getLast3Months()
  const from     = months[0].from
  const to       = months[2].to
  const today    = new Date().toISOString().split('T')[0]

  const [
    { count: vouchersThisMonth },
    { count: pendingBills },
    { data: invoices },
    { data: receipts },
    { data: overdueData },
  ] = await Promise.all([
    supabase.from('vouchers').select('*', { count: 'exact', head: true }).gte('voucher_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('purchase_bills').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid'),
    supabase.from('invoices').select('invoice_date, grand_total, payment_status').gte('invoice_date', from).lte('invoice_date', to),
    supabase.from('receipt_vouchers').select('receipt_date, amount').gte('receipt_date', from).lte('receipt_date', to),
    supabase.from('invoices').select('grand_total, due_date, payment_status, customer:customers(name)').in('payment_status', ['Unpaid', 'Partial']).lt('due_date', today).limit(5),
  ])

  const chartData = months.map(m => {
    const invoiced  = (invoices ?? []).filter(i => i.invoice_date >= m.from && i.invoice_date <= m.to).reduce((s, i) => s + (i.grand_total ?? 0), 0)
    const collected = (receipts ?? []).filter(r => r.receipt_date >= m.from && r.receipt_date <= m.to).reduce((s, r) => s + (r.amount ?? 0), 0)
    return { month: m.label, invoiced, collected }
  })

  const overdueByCustomer = (overdueData ?? []).map(i => ({
    name:   (i.customer as any)?.name ?? 'Unknown',
    amount: i.grand_total ?? 0,
  }))

  const totalInvoiced  = (invoices ?? []).reduce((s, i) => s + (i.grand_total ?? 0), 0)
  const totalCollected = (receipts ?? []).reduce((s, r) => s + (r.amount ?? 0), 0)
  const overdueAmount  = (overdueData ?? []).reduce((s, i) => s + (i.grand_total ?? 0), 0)

  return {
    kpis: {
      totalInvoiced,
      totalCollected,
      overdueAmount,
      vouchersThisMonth: vouchersThisMonth ?? 0,
      pendingBills:      pendingBills ?? 0,
    },
    chartData,
    overdueByCustomer,
  }
}