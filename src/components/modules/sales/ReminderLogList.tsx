'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'

type Props = { logs: any[] }

const TRIGGER_VARIANT: Record<string, any> = {
  'T-7':    'default',
  'T-3':    'warning',
  'T-0':    'danger',
  'Overdue':'danger',
}

const CHANNEL_VARIANT: Record<string, any> = {
  Email:     'info',
  WhatsApp:  'success',
}

const STATUS_VARIANT: Record<string, any> = {
  Sent:      'info',
  Failed:    'danger',
  Delivered: 'success',
  Read:      'success',
}

export default function ReminderLogList({ logs }: Props) {
  const router = useRouter()
  const [search,  setSearch]  = useState('')
  const [trigger, setTrigger] = useState('')
  const [channel, setChannel] = useState('')

  const filtered = logs.filter(l => {
    const matchSearch =
      l.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.invoice?.invoice_no.toLowerCase().includes(search.toLowerCase())
    const matchTrigger = trigger ? l.trigger_type === trigger : true
    const matchChannel = channel ? l.channel      === channel : true
    return matchSearch && matchTrigger && matchChannel
  })

  // Summary stats
  const totalSent    = logs.length
  const totalFailed  = logs.filter(l => l.status === 'Failed').length
  const emailCount   = logs.filter(l => l.channel === 'Email').length
  const waCount      = logs.filter(l => l.channel === 'WhatsApp').length

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleManualRun() {
    try {
      const res = await fetch('/api/scheduler/reminders', {
        method:  'GET',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHEDULER_SECRET ?? 'dev'}` },
      })
      const data = await res.json()
      alert(`Scheduler run complete. ${data.sent ?? 0} reminders sent.`)
      router.refresh()
    } catch {
      alert('Scheduler run failed — check console')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Payment Reminders</h1>
          <p className={styles.subtitle}>
            {totalSent} sent • {totalFailed} failed • {emailCount} email • {waCount} WhatsApp
          </p>
        </div>
        <Button onClick={handleManualRun}>
          ▶ Run Scheduler Now
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span>Total Sent</span>
          <strong>{totalSent}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Failed</span>
          <strong style={{ color: totalFailed > 0 ? 'var(--red)' : 'inherit' }}>
            {totalFailed}
          </strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Via Email</span>
          <strong>{emailCount}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Via WhatsApp</span>
          <strong>{waCount}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by customer or invoice..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.filterSelect}
          value={trigger} onChange={e => setTrigger(e.target.value)}>
          <option value="">All Triggers</option>
          <option value="T-7">T-7 (7 days before)</option>
          <option value="T-3">T-3 (3 days before)</option>
          <option value="T-0">T-0 (due today)</option>
          <option value="Overdue">Overdue</option>
        </select>
        <select className={styles.filterSelect}
          value={channel} onChange={e => setChannel(e.target.value)}>
          <option value="">All Channels</option>
          <option value="Email">Email</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'sent_at',      label: 'Sent At',
              render: v => new Date(v as string).toLocaleString('en-IN')
            },
            { key: 'customer',     label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            { key: 'invoice',      label: 'Invoice',
              render: v => (v as any)?.invoice_no ?? '—'
            },
            { key: 'invoice',      label: 'Amount', align: 'r',
              render: v => v ? fmt((v as any).grand_total) : '—'
            },
            { key: 'invoice',      label: 'Due Date',
              render: v => (v as any)?.due_date ?? '—'
            },
            { key: 'trigger_type', label: 'Trigger', align: 'c',
              render: v => (
                <Badge label={v as string} variant={TRIGGER_VARIANT[v as string]} />
              )
            },
            { key: 'channel', label: 'Channel', align: 'c',
              render: v => (
                <Badge label={v as string} variant={CHANNEL_VARIANT[v as string]} />
              )
            },
            { key: 'status', label: 'Status', align: 'c',
              render: v => (
                <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
              )
            },
            { key: 'days_overdue', label: 'Days Overdue', align: 'c',
              render: v => Number(v) > 0 ? (
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{v as number}</span>
              ) : '—'
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}