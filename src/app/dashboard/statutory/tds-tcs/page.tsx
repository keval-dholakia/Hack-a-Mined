'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  ChequeBook,
  ChequeLeafStatus,
  createChequeBook,
  createChequeLeafStatus,
  createTCSDetail,
  createTDSTrace,
  fetchChequeBooks,
  fetchChequeLeafStatuses,
  fetchTCSDetails,
  fetchTDSTraces,
  TCSDetail,
  TDSTrace,
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

const formatCurrency = (value: number) => `INR ${value.toLocaleString('en-IN')}`
const dateNow = () => new Date().toISOString().slice(0, 10)

const statusBadge = (status: ChequeLeafStatus['status']): React.ReactNode => {
  if (status === 'Used') return <span style={{ color: '#34d399', background: '#34d39922', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem' }}>Used</span>
  if (status === 'Cancelled') return <span style={{ color: '#f43f5e', background: '#f43f5e22', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem' }}>Cancelled</span>
  return <span style={{ color: '#94a3b8', background: '#94a3b822', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem' }}>Blank</span>
}

export default function StatutoryTDSTCSPage() {
  const [tdsRows, setTdsRows] = useState<TDSTrace[]>([])
  const [tcsRows, setTcsRows] = useState<TCSDetail[]>([])
  const [chequeBooks, setChequeBooks] = useState<ChequeBook[]>([])
  const [leafStatuses, setLeafStatuses] = useState<ChequeLeafStatus[]>([])
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [showTdsForm, setShowTdsForm] = useState(false)
  const [showTcsForm, setShowTcsForm] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  const [showLeafForm, setShowLeafForm] = useState(false)

  const [section, setSection] = useState('194C')
  const [deducteeName, setDeducteeName] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<NumberField>('')
  const [tdsRate, setTdsRate] = useState<NumberField>('')
  const [tdsAmount, setTdsAmount] = useState<NumberField>('')
  const [certificateNo, setCertificateNo] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [saleValue, setSaleValue] = useState<NumberField>('')
  const [tcsRate, setTcsRate] = useState<NumberField>(0.1)
  const [tcsAmount, setTcsAmount] = useState<NumberField>('')

  const [bankAccount, setBankAccount] = useState('')
  const [startLeafNo, setStartLeafNo] = useState('')
  const [endLeafNo, setEndLeafNo] = useState('')

  const [leafNo, setLeafNo] = useState('')
  const [leafStatus, setLeafStatus] = useState<ChequeLeafStatus['status']>('Used')
  const [issuedTo, setIssuedTo] = useState('')
  const [issuedDate, setIssuedDate] = useState(dateNow())

  async function fetchBundle() {
    return Promise.all([
      fetchTDSTraces(),
      fetchTCSDetails(),
      fetchChequeBooks(),
      fetchChequeLeafStatuses(),
    ])
  }

  function applyBundle([tds, tcs, books, leaves]: [TDSTrace[], TCSDetail[], ChequeBook[], ChequeLeafStatus[]]) {
    setTdsRows(tds)
    setTcsRows(tcs)
    setChequeBooks(books)
    setLeafStatuses(leaves)
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

  const totalTDS = useMemo(() => tdsRows.reduce((sum, row) => sum + row.tdsAmount, 0), [tdsRows])
  const totalTCS = useMemo(() => tcsRows.reduce((sum, row) => sum + row.tcsAmount, 0), [tcsRows])
  const usedLeaves = useMemo(() => leafStatuses.filter((x) => x.status === 'Used').length, [leafStatuses])
  const cancelledLeaves = useMemo(() => leafStatuses.filter((x) => x.status === 'Cancelled').length, [leafStatuses])

  async function onCreateTds(e: React.FormEvent) {
    e.preventDefault()
    if (!section || !deducteeName || paymentAmount === '' || tdsRate === '' || tdsAmount === '' || !certificateNo) return
    setSavingKey('tds')
    await createTDSTrace({
      section: section.trim(),
      deducteeName: deducteeName.trim(),
      paymentAmount: Number(paymentAmount),
      tdsRate: Number(tdsRate),
      tdsAmount: Number(tdsAmount),
      certificateNo: certificateNo.trim(),
    })
    setSavingKey(null)
    setShowTdsForm(false)
    setSection('194C')
    setDeducteeName('')
    setPaymentAmount('')
    setTdsRate('')
    setTdsAmount('')
    setCertificateNo('')
    loadData()
  }

  async function onCreateTcs(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || saleValue === '' || tcsRate === '' || tcsAmount === '') return
    setSavingKey('tcs')
    await createTCSDetail({
      customerName: customerName.trim(),
      saleValue: Number(saleValue),
      tcsRate: Number(tcsRate),
      tcsAmount: Number(tcsAmount),
    })
    setSavingKey(null)
    setShowTcsForm(false)
    setCustomerName('')
    setSaleValue('')
    setTcsRate(0.1)
    setTcsAmount('')
    loadData()
  }

  async function onCreateChequeBook(e: React.FormEvent) {
    e.preventDefault()
    if (!bankAccount || !startLeafNo || !endLeafNo) return
    setSavingKey('book')
    await createChequeBook({
      bankAccount: bankAccount.trim(),
      startLeafNo: startLeafNo.trim(),
      endLeafNo: endLeafNo.trim(),
    })
    setSavingKey(null)
    setShowBookForm(false)
    setBankAccount('')
    setStartLeafNo('')
    setEndLeafNo('')
    loadData()
  }

  async function onCreateLeafStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!leafNo) return
    setSavingKey('leaf')
    await createChequeLeafStatus({
      leafNo: leafNo.trim(),
      status: leafStatus,
      issuedTo: leafStatus === 'Blank' ? '-' : (issuedTo.trim() || '-'),
      date: leafStatus === 'Blank' ? '-' : issuedDate,
    })
    setSavingKey(null)
    setShowLeafForm(false)
    setLeafNo('')
    setLeafStatus('Used')
    setIssuedTo('')
    setIssuedDate(dateNow())
    loadData()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Statutory Management - TDS/TCS</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Track deductions, collections, cheque books and leaf-level issue status with temporary in-memory persistence.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Total TDS</p>
          <p style={{ ...kpiValueStyle, color: '#facc15' }}>{formatCurrency(totalTDS)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Total TCS</p>
          <p style={{ ...kpiValueStyle, color: '#34d399' }}>{formatCurrency(totalTCS)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Used Leaves</p>
          <p style={{ ...kpiValueStyle, color: '#22d3ee' }}>{usedLeaves}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Cancelled Leaves</p>
          <p style={{ ...kpiValueStyle, color: '#f43f5e' }}>{cancelledLeaves}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <Card
          title="12.5 TDS Trace & Details"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Track Deduction</span>
              <Button onClick={() => setShowTdsForm((v) => !v)}>{showTdsForm ? 'Cancel' : '+ New TDS'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showTdsForm && (
            <form onSubmit={onCreateTds} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Section</label>
                  <input value={section} onChange={(e) => setSection(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ ...fieldWrapStyle, gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Deductee Name</label>
                  <input value={deducteeName} onChange={(e) => setDeducteeName(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid3Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Payment Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>TDS Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={tdsRate}
                    onChange={(e) => setTdsRate(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>TDS Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={tdsAmount}
                    onChange={(e) => setTdsAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Certificate No</label>
                  <input value={certificateNo} onChange={(e) => setCertificateNo(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'tds'}>
                  {savingKey === 'tds' ? 'Saving...' : 'Save TDS Entry'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Section</th>
                <th style={thStyle}>Deductee Name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Payment Amount</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>TDS Rate</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>TDS Amount</th>
                <th style={thStyle}>Certificate No</th>
              </tr>
            </thead>
            <tbody>
              {tdsRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.section}</td>
                  <td style={tdStyle}>{row.deducteeName}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.paymentAmount)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.tdsRate}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#facc15' }}>{formatCurrency(row.tdsAmount)}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)' }}>{row.certificateNo}</td>
                </tr>
              ))}
              {tdsRows.length === 0 && (
                <tr>
                  <td colSpan={6} style={emptyStyle}>No TDS entries available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.6 TCS Details"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Tax Collected at Source</span>
              <Button onClick={() => setShowTcsForm((v) => !v)}>{showTcsForm ? 'Cancel' : '+ New TCS'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showTcsForm && (
            <form onSubmit={onCreateTcs} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={{ ...fieldWrapStyle, gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Customer Name</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Sale Value</label>
                  <input
                    type="number"
                    min={0}
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>TCS Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={tcsRate}
                    onChange={(e) => setTcsRate(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>TCS Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={tcsAmount}
                    onChange={(e) => setTcsAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'tcs'}>
                  {savingKey === 'tcs' ? 'Saving...' : 'Save TCS Entry'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Customer Name</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Sale Value</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>TCS Rate</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>TCS Amount</th>
              </tr>
            </thead>
            <tbody>
              {tcsRows.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.customerName}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.saleValue)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{row.tcsRate}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.tcsAmount)}</td>
                </tr>
              ))}
              {tcsRows.length === 0 && (
                <tr>
                  <td colSpan={4} style={emptyStyle}>No TCS entries available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.8 Cheque Book Management"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Manage Leaves</span>
              <Button onClick={() => setShowBookForm((v) => !v)}>{showBookForm ? 'Cancel' : '+ New Book Range'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showBookForm && (
            <form onSubmit={onCreateChequeBook} style={formWrapStyle}>
              <div style={formGrid3Style}>
                <div style={{ ...fieldWrapStyle, gridColumn: 'span 3' }}>
                  <label style={labelStyle}>Bank Account</label>
                  <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Start Leaf No</label>
                  <input value={startLeafNo} onChange={(e) => setStartLeafNo(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>End Leaf No</label>
                  <input value={endLeafNo} onChange={(e) => setEndLeafNo(e.target.value)} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'book'}>
                  {savingKey === 'book' ? 'Saving...' : 'Save Cheque Range'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Bank Account</th>
                <th style={thStyle}>Start Leaf No</th>
                <th style={thStyle}>End Leaf No</th>
              </tr>
            </thead>
            <tbody>
              {chequeBooks.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>{row.bankAccount}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.startLeafNo}</td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.endLeafNo}</td>
                </tr>
              ))}
              {chequeBooks.length === 0 && (
                <tr>
                  <td colSpan={3} style={emptyStyle}>No cheque book ranges available</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card
          title="12.8 Status Tracker"
          action={
            <div style={headerActionWrapStyle}>
              <span style={actionChipStyle}>Action: Track Leaves</span>
              <Button onClick={() => setShowLeafForm((v) => !v)}>{showLeafForm ? 'Cancel' : '+ New Leaf Status'}</Button>
            </div>
          }
          noPad
          style={{ overflow: 'hidden' }}
        >
          {showLeafForm && (
            <form onSubmit={onCreateLeafStatus} style={formWrapStyle}>
              <div style={formGrid2Style}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Leaf No</label>
                  <input value={leafNo} onChange={(e) => setLeafNo(e.target.value)} required style={inputStyle} />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Status</label>
                  <select value={leafStatus} onChange={(e) => setLeafStatus(e.target.value as ChequeLeafStatus['status'])} style={inputStyle}>
                    <option value="Used">Used</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Blank">Blank</option>
                  </select>
                </div>
              </div>
              <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Issued To</label>
                  <input
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    disabled={leafStatus === 'Blank'}
                    required={leafStatus !== 'Blank'}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    disabled={leafStatus === 'Blank'}
                    required={leafStatus !== 'Blank'}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
                <Button type="submit" disabled={savingKey === 'leaf'}>
                  {savingKey === 'leaf' ? 'Saving...' : 'Save Leaf Status'}
                </Button>
              </div>
            </form>
          )}
          <table style={sectionTableStyle}>
            <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
              <tr>
                <th style={thStyle}>Leaf No</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Issued To</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {leafStatuses.map((row) => (
                <tr key={row.id}>
                  <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.leafNo}</td>
                  <td style={tdStyle}>{statusBadge(row.status)}</td>
                  <td style={tdStyle}>{row.issuedTo}</td>
                  <td style={tdStyle}>{row.date}</td>
                </tr>
              ))}
              {leafStatuses.length === 0 && (
                <tr>
                  <td colSpan={4} style={emptyStyle}>No leaf statuses tracked</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
