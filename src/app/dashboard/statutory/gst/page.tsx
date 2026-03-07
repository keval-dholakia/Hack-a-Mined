'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  createGST2AReconciliation,
  createGSTDepositChallan,
  createGSTR1Upload,
  createGSTRRegister,
  createGSTTaxRule,
  fetchGST2AReconciliations,
  fetchGSTDepositChallans,
  fetchGSTR1Uploads,
  fetchGSTRRegisters,
  fetchGSTTaxRules,
  GST2AReconciliation,
  GSTDepositChallan,
  GSTR1Upload,
  GSTRRegister,
  GSTTaxRule,
} from '@/data/statutoryMock'

type NumberField = number | ''

const actionChipStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  background: '#0f1117',
  border: '1px solid #2a2d3e',
  borderRadius: '999px',
  padding: '0.3rem 0.7rem',
}

const headerActionWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}

const formWrapStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #1f2235',
  background: '#121623',
}

const formGrid3Style: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0.85rem',
}

const formGrid2Style: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.85rem',
}

const fieldWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
}

const inputStyle: React.CSSProperties = {
  padding: '0.72rem',
  background: '#0f1117',
  border: '1px solid #1f2235',
  borderRadius: '6px',
  color: '#fff',
}

const sectionTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.85rem',
}

const thStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  borderBottom: '1px solid #1a1d27',
}

const emptyStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '1.6rem',
}

const kpiCardStyle: React.CSSProperties = {
  background: '#13151f',
  border: '1px solid #1f2235',
  borderRadius: '10px',
  padding: '0.9rem 1rem',
}

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '0.67rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: 0,
  marginBottom: '0.25rem',
}

const kpiValueStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 700,
  fontFamily: 'var(--mono)',
  margin: 0,
}

const pill = (text: string, color: string): React.ReactNode => (
  <span style={{ background: `${color}22`, color, borderRadius: '999px', fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
    {text}
  </span>
)

const formatCurrency = (value: number) => `INR ${value.toLocaleString('en-IN')}`
const monthNow = () => new Date().toISOString().slice(0, 7)
const dateNow = () => new Date().toISOString().slice(0, 10)

export default function StatutoryGSTPage() {
  const [taxRules, setTaxRules] = useState<GSTTaxRule[]>([])
  const [gstr1Uploads, setGstr1Uploads] = useState<GSTR1Upload[]>([])
  const [gst2aRows, setGst2aRows] = useState<GST2AReconciliation[]>([])
  const [challans, setChallans] = useState<GSTDepositChallan[]>([])
  const [registerRows, setRegisterRows] = useState<GSTRRegister[]>([])
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [showRuleForm, setShowRuleForm] = useState(false)
  const [showGstr1Form, setShowGstr1Form] = useState(false)
  const [showReconForm, setShowReconForm] = useState(false)
  const [showChallanForm, setShowChallanForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  const [hsnCode, setHsnCode] = useState('')
  const [description, setDescription] = useState('')
  const [igstPercent, setIgstPercent] = useState<NumberField>('')
  const [cgstPercent, setCgstPercent] = useState<NumberField>('')
  const [sgstPercent, setSgstPercent] = useState<NumberField>('')

  const [gstrMonth, setGstrMonth] = useState(monthNow())
  const [invoiceNo, setInvoiceNo] = useState('')
  const [customerGstin, setCustomerGstin] = useState('')
  const [taxableValue, setTaxableValue] = useState<NumberField>('')
  const [taxAmount, setTaxAmount] = useState<NumberField>('')
  const [state, setState] = useState('')

  const [reconMonth, setReconMonth] = useState(monthNow())
  const [vendorGstin, setVendorGstin] = useState('')
  const [totalItc, setTotalItc] = useState<NumberField>('')
  const [matchedAmount, setMatchedAmount] = useState<NumberField>('')
  const [mismatchAmount, setMismatchAmount] = useState<NumberField>('')

  const [challanNo, setChallanNo] = useState('')
  const [cpin, setCpin] = useState('')
  const [challanDate, setChallanDate] = useState(dateNow())
  const [bank, setBank] = useState('')
  const [taxType, setTaxType] = useState<'CGST' | 'SGST'>('CGST')
  const [challanAmount, setChallanAmount] = useState<NumberField>('')

  const [dateRange, setDateRange] = useState('')
  const [transactionType, setTransactionType] = useState<'B2B' | 'B2C'>('B2B')
  const [totalTaxLiability, setTotalTaxLiability] = useState<NumberField>('')

  async function fetchBundle() {
    return Promise.all([
      fetchGSTTaxRules(),
      fetchGSTR1Uploads(),
      fetchGST2AReconciliations(),
      fetchGSTDepositChallans(),
      fetchGSTRRegisters(),
    ])
  }

  function applyBundle(
    [rules, gstr1, recon, paid, register]: [GSTTaxRule[], GSTR1Upload[], GST2AReconciliation[], GSTDepositChallan[], GSTRRegister[]]
  ) {
    setTaxRules(rules)
    setGstr1Uploads(gstr1)
    setGst2aRows(recon)
    setChallans(paid)
    setRegisterRows(register)
  }

  async function loadData() {
    const bundle = await fetchBundle()
    applyBundle(bundle)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const bundle = await fetchBundle()
      if (cancelled) return
      applyBundle(bundle)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalOutputTax = useMemo(
    () => gstr1Uploads.reduce((sum, row) => sum + row.taxAmount, 0),
    [gstr1Uploads]
  )

  const totalMismatch = useMemo(
    () => gst2aRows.reduce((sum, row) => sum + row.mismatchAmount, 0),
    [gst2aRows]
  )

  const totalChallan = useMemo(
    () => challans.reduce((sum, row) => sum + row.amount, 0),
    [challans]
  )

  async function onCreateTaxRule(e: React.FormEvent) {
    e.preventDefault()
    if (!hsnCode || !description || igstPercent === '' || cgstPercent === '' || sgstPercent === '') return
    setSavingKey('tax-rule')
    await createGSTTaxRule({
      hsnCode: hsnCode.trim(),
      description: description.trim(),
      igstPercent: Number(igstPercent),
      cgstPercent: Number(cgstPercent),
      sgstPercent: Number(sgstPercent),
    })
    setSavingKey(null)
    setShowRuleForm(false)
    setHsnCode('')
    setDescription('')
    setIgstPercent('')
    setCgstPercent('')
    setSgstPercent('')
    loadData()
  }

  async function onCreateGstr1Upload(e: React.FormEvent) {
    e.preventDefault()
    if (!gstrMonth || !invoiceNo || !customerGstin || taxableValue === '' || taxAmount === '' || !state) return
    setSavingKey('gstr1')
    await createGSTR1Upload({
      month: gstrMonth,
      invoiceNo: invoiceNo.trim(),
      customerGstin: customerGstin.trim(),
      taxableValue: Number(taxableValue),
      taxAmount: Number(taxAmount),
      state: state.trim(),
    })
    setSavingKey(null)
    setShowGstr1Form(false)
    setGstrMonth(monthNow())
    setInvoiceNo('')
    setCustomerGstin('')
    setTaxableValue('')
    setTaxAmount('')
    setState('')
    loadData()
  }

  async function onCreateRecon(e: React.FormEvent) {
    e.preventDefault()
    if (!reconMonth || !vendorGstin || totalItc === '' || matchedAmount === '' || mismatchAmount === '') return
    setSavingKey('recon')
    await createGST2AReconciliation({
      month: reconMonth,
      vendorGstin: vendorGstin.trim(),
      totalInputTaxCredit: Number(totalItc),
      matchedAmount: Number(matchedAmount),
      mismatchAmount: Number(mismatchAmount),
    })
    setSavingKey(null)
    setShowReconForm(false)
    setReconMonth(monthNow())
    setVendorGstin('')
    setTotalItc('')
    setMatchedAmount('')
    setMismatchAmount('')
    loadData()
  }

  async function onCreateChallan(e: React.FormEvent) {
    e.preventDefault()
    if (!challanNo || !cpin || !challanDate || !bank || challanAmount === '') return
    setSavingKey('challan')
    await createGSTDepositChallan({
      challanNo: challanNo.trim(),
      cpin: cpin.trim(),
      date: challanDate,
      bank: bank.trim(),
      taxType,
      amount: Number(challanAmount),
    })
    setSavingKey(null)
    setShowChallanForm(false)
    setChallanNo('')
    setCpin('')
    setChallanDate(dateNow())
    setBank('')
    setTaxType('CGST')
    setChallanAmount('')
    loadData()
  }

  async function onCreateRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!dateRange || totalTaxLiability === '') return
    setSavingKey('register')
    await createGSTRRegister({
      dateRange: dateRange.trim(),
      transactionType,
      totalTaxLiability: Number(totalTaxLiability),
    })
    setSavingKey(null)
    setShowRegisterForm(false)
    setDateRange('')
    setTransactionType('B2B')
    setTotalTaxLiability('')
    loadData()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Statutory Management - GST</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          GST taxation, filing prep, reconciliation, challan tracking and register snapshots.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Tax Rules</p>
          <p style={{ ...kpiValueStyle, color: '#22d3ee' }}>{taxRules.length}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>GSTR-1 Output Tax</p>
          <p style={{ ...kpiValueStyle, color: '#34d399' }}>{formatCurrency(totalOutputTax)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>2A Mismatch</p>
          <p style={{ ...kpiValueStyle, color: totalMismatch > 0 ? '#facc15' : '#34d399' }}>{formatCurrency(totalMismatch)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Challan Payments</p>
          <p style={{ ...kpiValueStyle, color: '#a78bfa' }}>{formatCurrency(totalChallan)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <Card
          title="12.1 GST Taxation Master"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Set Tax Rules</span>
              <Button onClick={() => setShowRuleForm((v) => !v)}>{showRuleForm ? 'Cancel' : '+ New Tax Rule'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showRuleForm && (
            <form onSubmit={onCreateTaxRule} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>HSN Code</label>
                  <input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ ...fieldWrapStyle, gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Description</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid3Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>IGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={igstPercent}
                    onChange={(e) => setIgstPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>CGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cgstPercent}
                    onChange={(e) => setCgstPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>SGST %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sgstPercent}
                    onChange={(e) => setSgstPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'tax-rule'}>
                  {savingKey === 'tax-rule' ? 'Saving...' : 'Save Rule'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>HSN Code</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>IGST %</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>CGST %</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>SGST %</th>
              </tr>
            </thead>
            <tbody>
              {taxRules.map((rule) => (
                <tr key={rule.id}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{rule.hsnCode}</td>
                  <td style={tdStyle}>{rule.description}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{rule.igstPercent}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{rule.cgstPercent}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{rule.sgstPercent}%</td>
                </tr>
              ))}
              {taxRules.length === 0 && (
                <tr>
                  <td colSpan={5} style={emptyStyle}>No tax rules available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.2 GSTR-1 Upload (Sales)"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Export for Filing</span>
              <Button onClick={() => setShowGstr1Form((v) => !v)}>{showGstr1Form ? 'Cancel' : '+ New GSTR-1 Row'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showGstr1Form && (
            <form onSubmit={onCreateGstr1Upload} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Month</label>
                  <input type="month" value={gstrMonth} onChange={(e) => setGstrMonth(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Invoice No</label>
                  <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Customer GSTIN</label>
                  <input value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid3Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Taxable Value</label>
                  <input
                    type="number"
                    min={0}
                    value={taxableValue}
                    onChange={(e) => setTaxableValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Tax Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>State</label>
                  <input value={state} onChange={(e) => setState(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'gstr1'}>
                  {savingKey === 'gstr1' ? 'Saving...' : 'Save GSTR-1 Row'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Month</th>
                <th style={thStyle}>Invoice No</th>
                <th style={thStyle}>Customer GSTIN</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Taxable Value</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tax Amount</th>
                <th style={thStyle}>State</th>
              </tr>
            </thead>
            <tbody>
              {gstr1Uploads.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.month}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.invoiceNo}</td>
                  <td style={tdStyle}>{row.customerGstin}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.taxableValue)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.taxAmount)}</td>
                  <td style={tdStyle}>{row.state}</td>
                </tr>
              ))}
              {gstr1Uploads.length === 0 && (
                <tr>
                  <td colSpan={6} style={emptyStyle}>No GSTR-1 rows available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.3 GST2A Reconciliation (Purchase)"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Compare Books vs Portal</span>
              <Button onClick={() => setShowReconForm((v) => !v)}>{showReconForm ? 'Cancel' : '+ New Reconciliation'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showReconForm && (
            <form onSubmit={onCreateRecon} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Month</label>
                  <input type="month" value={reconMonth} onChange={(e) => setReconMonth(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ ...fieldWrapStyle, gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Vendor GSTIN</label>
                  <input value={vendorGstin} onChange={(e) => setVendorGstin(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid3Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Total ITC</label>
                  <input
                    type="number"
                    min={0}
                    value={totalItc}
                    onChange={(e) => setTotalItc(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Matched Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={matchedAmount}
                    onChange={(e) => setMatchedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Mismatch Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={mismatchAmount}
                    onChange={(e) => setMismatchAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'recon'}>
                  {savingKey === 'recon' ? 'Saving...' : 'Save Reconciliation'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Month</th>
                <th style={thStyle}>Vendor GSTIN</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total ITC</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Matched</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Mismatch</th>
              </tr>
            </thead>
            <tbody>
              {gst2aRows.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.month}</td>
                  <td style={tdStyle}>{row.vendorGstin}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.totalInputTaxCredit)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.matchedAmount)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: row.mismatchAmount > 0 ? '#facc15' : '#34d399' }}>
                    {formatCurrency(row.mismatchAmount)}
                  </td>
                </tr>
              ))}
              {gst2aRows.length === 0 && (
                <tr>
                  <td colSpan={5} style={emptyStyle}>No reconciliation rows available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.4 GST Deposit Challan"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Tax Payment Record</span>
              <Button onClick={() => setShowChallanForm((v) => !v)}>{showChallanForm ? 'Cancel' : '+ New Challan'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showChallanForm && (
            <form onSubmit={onCreateChallan} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Challan No</label>
                  <input value={challanNo} onChange={(e) => setChallanNo(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>CPIN</label>
                  <input value={cpin} onChange={(e) => setCpin(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid3Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Bank</label>
                  <input value={bank} onChange={(e) => setBank(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Tax Type</label>
                  <select value={taxType} onChange={(e) => setTaxType(e.target.value as 'CGST' | 'SGST')} required style={inputStyle}>
                    <option value="CGST">CGST</option>
                    <option value="SGST">SGST</option>
                  </select>
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={challanAmount}
                    onChange={(e) => setChallanAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'challan'}>
                  {savingKey === 'challan' ? 'Saving...' : 'Save Challan'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Challan No</th>
                <th style={thStyle}>CPIN</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Bank</th>
                <th style={thStyle}>Tax Type</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((row) => (
                <tr key={row.id}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.challanNo}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)' }}>{row.cpin}</td>
                  <td style={tdStyle}>{row.date}</td>
                  <td style={tdStyle}>{row.bank}</td>
                  <td style={tdStyle}>{row.taxType === 'CGST' ? pill('CGST', '#60a5fa') : pill('SGST', '#34d399')}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.amount)}</td>
                </tr>
              ))}
              {challans.length === 0 && (
                <tr>
                  <td colSpan={6} style={emptyStyle}>No challans posted</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.7 GSTR1 & GSTR2 Register"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Detailed Tax Ledger</span>
              <Button onClick={() => setShowRegisterForm((v) => !v)}>{showRegisterForm ? 'Cancel' : '+ New Register Row'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showRegisterForm && (
            <form onSubmit={onCreateRegister} style={formWrapStyle}>
              <div style={formGrid2Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Date Range</label>
                  <input value={dateRange} onChange={(e) => setDateRange(e.target.value)} required style={inputStyle} placeholder="2026-03-01 to 2026-03-31" />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Transaction Type</label>
                  <select value={transactionType} onChange={(e) => setTransactionType(e.target.value as 'B2B' | 'B2C')} required style={inputStyle}>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </select>
                </div>
              </div>
              <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Total Tax Liability</label>
                  <input
                    type="number"
                    min={0}
                    value={totalTaxLiability}
                    onChange={(e) => setTotalTaxLiability(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'register'}>
                  {savingKey === 'register' ? 'Saving...' : 'Save Register Row'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Date Range</th>
                <th style={thStyle}>Transaction Type</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total Tax Liability</th>
              </tr>
            </thead>
            <tbody>
              {registerRows.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.dateRange}</td>
                  <td style={tdStyle}>{row.transactionType === 'B2B' ? pill('B2B', '#60a5fa') : pill('B2C', '#f59e0b')}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.totalTaxLiability)}</td>
                </tr>
              ))}
              {registerRows.length === 0 && (
                <tr>
                  <td colSpan={3} style={emptyStyle}>No register rows available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
