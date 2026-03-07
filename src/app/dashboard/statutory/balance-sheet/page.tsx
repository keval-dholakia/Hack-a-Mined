'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BalanceSheet, createBalanceSheet, fetchBalanceSheets } from '@/data/statutoryMock'

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

export default function StatutoryBalanceSheetPage() {
  const [rows, setRows] = useState<BalanceSheet[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [asOnDate, setAsOnDate] = useState(dateNow())
  const [assetsTotal, setAssetsTotal] = useState<NumberField>('')
  const [liabilitiesTotal, setLiabilitiesTotal] = useState<NumberField>('')
  const [capitalAccount, setCapitalAccount] = useState<NumberField>('')
  const [currentAssets, setCurrentAssets] = useState<NumberField>('')

  async function fetchRows() {
    const result = await fetchBalanceSheets()
    return [...result].sort((a, b) => new Date(b.asOnDate).getTime() - new Date(a.asOnDate).getTime())
  }

  function applyRows(sorted: BalanceSheet[]) {
    setRows(sorted)
  }

  async function loadData() {
    const sorted = await fetchRows()
    applyRows(sorted)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const sorted = await fetchRows()
      if (cancelled) return
      applyRows(sorted)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const latest = rows[0]
  const balanceGap = latest ? latest.assetsTotal - latest.liabilitiesTotal : 0
  const currentAssetRatio = latest && latest.assetsTotal > 0 ? (latest.currentAssets / latest.assetsTotal) * 100 : 0

  const totalCapital = useMemo(() => rows.reduce((sum, row) => sum + row.capitalAccount, 0), [rows])

  async function onCreateBalanceSheet(e: React.FormEvent) {
    e.preventDefault()
    if (asOnDate === '' || assetsTotal === '' || liabilitiesTotal === '' || capitalAccount === '' || currentAssets === '') return
    setSaving(true)
    await createBalanceSheet({
      asOnDate,
      assetsTotal: Number(assetsTotal),
      liabilitiesTotal: Number(liabilitiesTotal),
      capitalAccount: Number(capitalAccount),
      currentAssets: Number(currentAssets),
    })
    setSaving(false)
    setShowForm(false)
    setAsOnDate(dateNow())
    setAssetsTotal('')
    setLiabilitiesTotal('')
    setCapitalAccount('')
    setCurrentAssets('')
    loadData()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Statutory Management - Balance Sheet</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Capture period-wise balance sheet snapshots for statutory reporting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem', marginBottom: '1.4rem' }}>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Latest Assets</p>
          <p style={{ ...kpiValueStyle, color: '#22d3ee' }}>{latest ? formatCurrency(latest.assetsTotal) : 'INR 0'}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Latest Liabilities</p>
          <p style={{ ...kpiValueStyle, color: '#a78bfa' }}>{latest ? formatCurrency(latest.liabilitiesTotal) : 'INR 0'}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Balance Gap</p>
          <p style={{ ...kpiValueStyle, color: balanceGap === 0 ? '#34d399' : '#f43f5e' }}>{formatCurrency(balanceGap)}</p>
        </div>
        <div style={kpiCardStyle}>
          <p style={kpiLabelStyle}>Current Asset Ratio</p>
          <p style={{ ...kpiValueStyle, color: '#facc15' }}>{currentAssetRatio.toFixed(2)}%</p>
        </div>
      </div>

      <Card
        title="12.9 Balance Sheet"
        action={
          <div style={headerActionWrapStyle}>
            <span style={actionChipStyle}>Action: Financial Statement</span>
            <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New Statement'}</Button>
          </div>
        }
        noPad
        style={{ overflow: 'hidden' }}
      >
        {showForm && (
          <form onSubmit={onCreateBalanceSheet} style={formWrapStyle}>
            <div style={formGrid3Style}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>As On Date</label>
                <input type="date" value={asOnDate} onChange={(e) => setAsOnDate(e.target.value)} required style={inputStyle} />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Assets Total</label>
                <input
                  type="number"
                  min={0}
                  value={assetsTotal}
                  onChange={(e) => setAssetsTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Liabilities Total</label>
                <input
                  type="number"
                  min={0}
                  value={liabilitiesTotal}
                  onChange={(e) => setLiabilitiesTotal(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ ...formGrid2Style, marginTop: '0.85rem' }}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Capital Account</label>
                <input
                  type="number"
                  min={0}
                  value={capitalAccount}
                  onChange={(e) => setCapitalAccount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Current Assets</label>
                <input
                  type="number"
                  min={0}
                  value={currentAssets}
                  onChange={(e) => setCurrentAssets(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.95rem' }}>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Statement'}</Button>
            </div>
          </form>
        )}

        <table style={sectionTableStyle}>
          <thead style={{ background: '#0f1117', borderBottom: '1px solid #1f2235' }}>
            <tr>
              <th style={thStyle}>As On Date</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Assets Total</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Liabilities Total</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Capital Account</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Current Assets</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={tdStyle}>{row.asOnDate}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#22d3ee' }}>{formatCurrency(row.assetsTotal)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#a78bfa' }}>{formatCurrency(row.liabilitiesTotal)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#34d399' }}>{formatCurrency(row.capitalAccount)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.currentAssets)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={emptyStyle}>No balance sheet records available</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Total capital tracked across statements: <span style={{ color: '#34d399', fontFamily: 'var(--mono)' }}>{formatCurrency(totalCapital)}</span>
      </div>
    </div>
  )
}
