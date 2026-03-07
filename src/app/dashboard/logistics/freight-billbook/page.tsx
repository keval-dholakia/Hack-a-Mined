'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { createFreightBill, fetchFreightBills, FreightBill } from '@/data/logisticsMock'

type NumberField = number | ''

const formatCurrency = (value: number) => `INR ${value.toLocaleString('en-IN')}`
const today = () => new Date().toISOString().slice(0, 10)

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

const sectionTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.85rem',
}

const thStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  borderBottom: '1px solid #1a1d27',
}

const emptyStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '1.8rem',
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0.9rem',
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

export default function FreightBillbookPage() {
  const [rows, setRows] = useState<FreightBill[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [billNo, setBillNo] = useState('')
  const [date, setDate] = useState(today())
  const [lrNo, setLrNo] = useState('')
  const [freightAmount, setFreightAmount] = useState<NumberField>('')
  const [gstAmount, setGstAmount] = useState<NumberField>('')

  const totalPayableDraft = (freightAmount === '' ? 0 : freightAmount) + (gstAmount === '' ? 0 : gstAmount)

  async function loadRows() {
    const next = await fetchFreightBills()
    setRows(next)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const next = await fetchFreightBills()
      if (cancelled) return
      setRows(next)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalFreight = useMemo(() => rows.reduce((sum, row) => sum + row.freightAmount, 0), [rows])
  const totalGST = useMemo(() => rows.reduce((sum, row) => sum + row.gstAmount, 0), [rows])
  const grandTotalPayable = useMemo(() => rows.reduce((sum, row) => sum + row.totalPayable, 0), [rows])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!billNo || !date || !lrNo || freightAmount === '' || gstAmount === '') return
    setSaving(true)
    await createFreightBill({
      billNo: billNo.trim(),
      date,
      lrNo: lrNo.trim(),
      freightAmount: Number(freightAmount),
      gstAmount: Number(gstAmount),
    })
    setSaving(false)
    setShowForm(false)
    setBillNo('')
    setDate(today())
    setLrNo('')
    setFreightAmount('')
    setGstAmount('')
    loadRows()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Freight Billbook</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            6.4 Transporter Invoice register with mock persistence and finance-style workflow.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Freight Bill'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Bills</p>
          <p style={{ ...kpiValueStyle, color: '#22d3ee' }}>{rows.length}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Freight Amount</p>
          <p style={{ ...kpiValueStyle, color: '#34d399' }}>{formatCurrency(totalFreight)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>GST</p>
          <p style={{ ...kpiValueStyle, color: '#facc15' }}>{formatCurrency(totalGST)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Total Payable</p>
          <p style={{ ...kpiValueStyle, color: '#a78bfa' }}>{formatCurrency(grandTotalPayable)}</p>
        </div>
      </div>

      {showForm && (
        <Card title="Create Freight Bill" style={{ marginBottom: '1rem' }}>
          <form onSubmit={onCreate}>
            <div style={formGridStyle}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Bill No</label>
                <input value={billNo} onChange={(e) => setBillNo(e.target.value)} required style={inputStyle} />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputStyle} />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>LR No</label>
                <input value={lrNo} onChange={(e) => setLrNo(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div style={{ ...formGridStyle, marginTop: '0.9rem' }}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Freight Amount</label>
                <input
                  type="number"
                  min={0}
                  value={freightAmount}
                  onChange={(e) => setFreightAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>GST</label>
                <input
                  type="number"
                  min={0}
                  value={gstAmount}
                  onChange={(e) => setGstAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Total Payable</label>
                <input value={formatCurrency(totalPayableDraft)} readOnly style={{ ...inputStyle, color: '#a78bfa', fontFamily: 'var(--mono)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Bill'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div style={{ background: '#13151f', border: '1px solid #1f2235', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={sectionTableStyle}>
          <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
            <tr>
              <th style={thStyle}>Bill No</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>LR No</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Freight Amount</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>GST</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total Payable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ ...tdStyle, fontFamily: 'var(--mono)', color: '#22d3ee' }}>{row.billNo}</td>
                <td style={tdStyle}>{row.date}</td>
                <td style={{ ...tdStyle, fontFamily: 'var(--mono)' }}>{row.lrNo}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.freightAmount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.gstAmount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#a78bfa', fontWeight: 700 }}>{formatCurrency(row.totalPayable)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={emptyStyle}>No freight bills available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
