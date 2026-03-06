'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Vendor } from '@/types/vendor'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

type Props = { vendors: Vendor[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'

const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.ttLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    )
}

function KPI({ icon, label, value, color }: any) {
    return (
        <div className={styles.kpi}>
            <div className={styles.kpiIcon} style={{ color, background: `${color}18` }}>{icon}</div>
            <div>
                <p className={styles.kpiLabel}>{label}</p>
                <p className={styles.kpiValue} style={{ color }}>{value}</p>
            </div>
        </div>
    )
}

const TABS = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'geography', label: '◎ Geography' },
    { id: 'financial', label: '◈ Financial' },
    { id: 'trend', label: '◉ Trend' },
] as const
type Tab = typeof TABS[number]['id']

export default function VendorAnalytics({ vendors }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = vendors.length
        const active = vendors.filter(v => v.is_active === 1).length
        const inactive = total - active

        /* state */
        const stateMap: Record<string, number> = {}
        vendors.forEach(v => { if (v.state) stateMap[v.state] = (stateMap[v.state] ?? 0) + 1 })
        const stateData = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* city top-10 */
        const cityMap: Record<string, number> = {}
        vendors.forEach(v => { if (v.city) cityMap[v.city] = (cityMap[v.city] ?? 0) + 1 })
        const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))

        /* payment terms */
        const ptMap: Record<string, number> = {}
        vendors.forEach(v => { const k = `${v.payment_terms}d`; ptMap[k] = (ptMap[k] ?? 0) + 1 })
        const ptData = Object.entries(ptMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([name, value]) => ({ name, value }))

        /* bank distribution */
        const bankMap: Record<string, number> = {}
        vendors.forEach(v => { if (v.bank_name) bankMap[v.bank_name] = (bankMap[v.bank_name] ?? 0) + 1 })
        const bankData = Object.entries(bankMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* monthly registration */
        const mMap: Record<string, number> = {}
        vendors.forEach(v => {
            if (!v.created_at) return
            const d = new Date(v.created_at)
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            mMap[k] = (mMap[k] ?? 0) + 1
        })
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthTrend = Object.entries(mMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
            .map(([m, count]) => { const [y, mo] = m.split('-'); return { month: `${MONTHS[+mo - 1]} ${y.slice(2)}`, count } })

        /* radar top-6 states */
        const radarData = stateData.slice(0, 6).map(s => ({
            state: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
            vendors: s.value,
        }))

        /* avg payment term */
        const avgPT = total ? Math.round(vendors.reduce((a, v) => a + (v.payment_terms ?? 0), 0) / total) : 0

        return { total, active, inactive, stateData, cityData, ptData, bankData, monthTrend, radarData, avgPT }
    }, [vendors])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Vendor Analytics</h1>
                    <p className={styles.subtitle}>Supply-side intelligence · {s.total} vendors</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/masters/vendors')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Vendors" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Active" value={s.active} color={GREEN} />
                <KPI icon="◎" label="Inactive" value={s.inactive} color={ROSE} />
                <KPI icon="▣" label="States Covered" value={s.stateData.length} color={CYAN} />
                <KPI icon="⬡" label="Cities Covered" value={s.cityData.length} color={AMBER} />
                <KPI icon="◇" label="Avg Pay. Terms" value={`${s.avgPT}d`} color="#a78bfa" />
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

                    <Card title="Payment Terms Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.ptData} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[6, 6, 0, 0]}>
                                        {s.ptData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top 10 Cities">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.cityData} layout="vertical" barSize={14}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[0, 6, 6, 0]}>
                                        {s.cityData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Bank Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2}>
                                        {s.bankData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.72rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'geography' && (
                <div className={styles.grid}>
                    <Card title="Vendors by State" action={<span className={styles.badge}>all states</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.stateData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} height={55} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[6, 6, 0, 0]}>
                                        {s.stateData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="State Share — Pie" action={<span className={styles.badge}>top 10</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <PieChart>
                                    <Pie data={s.stateData.slice(0, 10)} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={120} paddingAngle={2}>
                                        {s.stateData.slice(0, 10).map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top 10 Cities — Horizontal Bar">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.cityData} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[0, 6, 6, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Geographic Coverage Radar" action={<span className={styles.badge}>top 6 states</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Vendors" dataKey="vendors" stroke={ACCENT} fill={ACCENT} fillOpacity={0.25} />
                                    <Tooltip content={<Tip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'financial' && (
                <div className={styles.grid}>
                    <Card title="Payment Terms Mix">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.ptData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[6, 6, 0, 0]}>
                                        {s.ptData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Bank Partner Distribution">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.bankData} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Vendors" radius={[0, 6, 6, 0]}>
                                        {s.bankData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Payment Terms Summary" action={<span className={styles.badge}>all vendors</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Payment Terms</th><th>Vendors</th><th>Share</th>
                            </tr></thead><tbody>
                                    {s.ptData.map((r, i) => (
                                        <tr key={r.name}>
                                            <td><span className={styles.dot} style={{ background: C[i % C.length] }} />{r.name}</td>
                                            <td>{r.value}</td>
                                            <td>
                                                <div className={styles.barCell}>
                                                    <div className={styles.barFill} style={{ width: `${(r.value / s.total * 100).toFixed(0)}%`, background: C[i % C.length] }} />
                                                    <span>{(r.value / s.total * 100).toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody></table>
                        </div>
                    </Card>

                    <Card title="Health Overview">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Active Rate', val: s.active / s.total, color: GREEN, disp: `${(s.active / s.total * 100).toFixed(1)}%` },
                                { label: 'Inactive Rate', val: s.inactive / s.total, color: ROSE, disp: `${(s.inactive / s.total * 100).toFixed(1)}%` },
                                {
                                    label: 'Long Pay (60+d)', val: vendors.filter(v => v.payment_terms >= 60).length / s.total, color: AMBER,
                                    disp: `${vendors.filter(v => v.payment_terms >= 60).length} vendors`
                                },
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

            {tab === 'trend' && (
                <div className={styles.grid}>
                    <Card title="Vendor Registration Trend" action={<span className={styles.badge}>last 12 months</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={s.monthTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Line type="monotone" dataKey="count" name="New Vendors" stroke={ACCENT} strokeWidth={2.5}
                                        dot={{ fill: ACCENT, r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top Vendors by State — Radar">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Vendors" dataKey="vendors" stroke={CYAN} fill={CYAN} fillOpacity={0.2} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} /><Tooltip content={<Tip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top 20 Vendors" action={<span className={styles.badge}>alphabetical</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Vendor</th><th>City</th><th>State</th><th>Pay Terms</th><th>Bank</th><th>Status</th>
                            </tr></thead><tbody>
                                    {[...vendors].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 20).map(v => (
                                        <tr key={v.id}>
                                            <td><strong>{v.name}</strong><br /><small style={{ color: '#6b7280' }}>{v.code}</small></td>
                                            <td>{v.city ?? '—'}</td><td>{v.state ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--mono)' }}>{v.payment_terms}d</td>
                                            <td>{v.bank_name ?? '—'}</td>
                                            <td><span className={styles.riskPill} style={{ background: v.is_active === 1 ? `${GREEN}22` : `${ROSE}22`, color: v.is_active === 1 ? GREEN : ROSE }}>
                                                {v.is_active === 1 ? 'Active' : 'Inactive'}
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
