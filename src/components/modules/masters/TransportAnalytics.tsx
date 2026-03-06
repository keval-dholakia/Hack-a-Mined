'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TransportMaster } from '@/types/transport'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

type Props = { transporters: TransportMaster[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.ttLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>{p.name}: <strong>{p.value}</strong></p>
            ))}
        </div>
    )
}
function KPI({ icon, label, value, color }: any) {
    return (
        <div className={styles.kpi}>
            <div className={styles.kpiIcon} style={{ color, background: `${color}18` }}>{icon}</div>
            <div><p className={styles.kpiLabel}>{label}</p><p className={styles.kpiValue} style={{ color }}>{value}</p></div>
        </div>
    )
}

const TABS = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'coverage', label: '◎ Coverage' },
    { id: 'details', label: '◉ Details' },
] as const
type Tab = typeof TABS[number]['id']

/* extract state from address (last word of typical Indian address) */
function extractState(address: string | null): string {
    if (!address) return 'Unknown'
    const parts = address.split(',').map(s => s.trim())
    return parts[parts.length - 1] || 'Unknown'
}

export default function TransportAnalytics({ transporters }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = transporters.length
        const active = transporters.filter(t => t.is_active === 1).length
        const inactive = total - active
        const withGSTIN = transporters.filter(t => t.gstin && t.gstin.length === 15).length

        /* state distribution from address */
        const stateMap: Record<string, number> = {}
        transporters.forEach(t => {
            const st = extractState(t.address)
            stateMap[st] = (stateMap[st] ?? 0) + 1
        })
        const stateData = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* monthly registration */
        const mMap: Record<string, number> = {}
        transporters.forEach(t => {
            if (!t.created_at) return
            const d = new Date(t.created_at)
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            mMap[k] = (mMap[k] ?? 0) + 1
        })
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthTrend = Object.entries(mMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
            .map(([m, c]) => { const [y, mo] = m.split('-'); return { month: `${MONTHS[+mo - 1]} ${y.slice(2)}`, count: c } })

        /* with/without mobile */
        const withMobile = transporters.filter(t => t.mobile && t.mobile.length >= 10).length

        /* radar top 6 states */
        const radarData = stateData.slice(0, 6).map(s => ({
            state: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
            count: s.value,
        }))

        return { total, active, inactive, withGSTIN, withMobile, stateData, monthTrend, radarData }
    }, [transporters])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Transporter Analytics</h1>
                    <p className={styles.subtitle}>Logistics network overview · {s.total} transporters</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/masters/transport')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Transporters" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Active" value={s.active} color={GREEN} />
                <KPI icon="◎" label="Inactive" value={s.inactive} color={ROSE} />
                <KPI icon="▣" label="GST Registered" value={s.withGSTIN} color={CYAN} />
                <KPI icon="⬡" label="With Mobile" value={s.withMobile} color={AMBER} />
                <KPI icon="◇" label="States Covered" value={s.stateData.length} color="#a78bfa" />
            </div>

            <div className={styles.tabBar}>
                {TABS.map(t => (
                    <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className={styles.grid}>
                    <Card title="Active vs Inactive">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={[{ name: 'Active', value: s.active }, { name: 'Inactive', value: s.inactive }]}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                        <Cell fill={GREEN} /><Cell fill={ROSE} />
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="GST Compliance">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={[{ name: 'GST Registered', value: s.withGSTIN }, { name: 'Not Registered', value: s.total - s.withGSTIN }]}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                                        <Cell fill={CYAN} /><Cell fill="#2a2d3e" />
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Transporters by State">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.stateData.slice(0, 10)} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Transporters" radius={[6, 6, 0, 0]}>
                                        {s.stateData.slice(0, 10).map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Data Completeness">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Active Rate', val: s.active / s.total, color: GREEN, disp: `${(s.active / s.total * 100).toFixed(1)}%` },
                                { label: 'GST Registered', val: s.withGSTIN / s.total, color: CYAN, disp: `${(s.withGSTIN / s.total * 100).toFixed(1)}%` },
                                { label: 'Mobile on File', val: s.withMobile / s.total, color: AMBER, disp: `${(s.withMobile / s.total * 100).toFixed(1)}%` },
                            ].map(r => (
                                <div key={r.label} className={styles.healthRow}>
                                    <span className={styles.healthLabel}>{r.label}</span>
                                    <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(r.val * 100).toFixed(0)}%`, background: r.color }} /></div>
                                    <span className={styles.healthPct} style={{ color: r.color }}>{r.disp}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'coverage' && (
                <div className={styles.grid}>
                    <Card title="State Distribution — Bar">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.stateData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Transporters" radius={[6, 6, 0, 0]}>
                                        {s.stateData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Network Radar" action={<span className={styles.badge}>top 6 states</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={120}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Transporters" dataKey="count" stroke={ACCENT} fill={ACCENT} fillOpacity={0.2} />
                                    <Tooltip content={<Tip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Registration Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={s.monthTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Line type="monotone" dataKey="count" name="New Transporters" stroke={ACCENT} strokeWidth={2.5}
                                        dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'details' && (
                <div className={styles.grid}>
                    <Card title="All Transporters" action={<span className={styles.badge}>{s.total} records</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Name</th><th>Owner</th><th>Mobile</th><th>GSTIN</th><th>Status</th>
                            </tr></thead><tbody>
                                    {transporters.map(t => (
                                        <tr key={t.id}>
                                            <td><strong>{t.name}</strong></td>
                                            <td>{t.owner_name ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>{t.mobile ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem' }}>{t.gstin ?? '—'}</td>
                                            <td><span className={styles.riskPill} style={{ background: t.is_active === 1 ? `${GREEN}22` : `${ROSE}22`, color: t.is_active === 1 ? GREEN : ROSE }}>
                                                {t.is_active === 1 ? 'Active' : 'Inactive'}
                                            </span></td>
                                        </tr>
                                    ))}
                                </tbody></table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
