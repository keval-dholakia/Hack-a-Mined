'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Warehouse } from '@/types/warehouse'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Treemap,
} from 'recharts'

type Props = { warehouses: Warehouse[] }

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

function TreemapCell(props: any) {
    const { x, y, width, height, name, fill, value } = props
    if (!width || !height || width < 30 || height < 20) return null
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} opacity={0.85} />
            <rect x={x} y={y} width={width} height={height} fill="transparent" stroke="#0f1117" strokeWidth={2} rx={6} />
            {width > 50 && height > 30 && <>
                <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
                <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>{value}</text>
            </>}
        </g>
    )
}

const TABS = [
    { id: 'overview', label: '⊞ Overview' },
    { id: 'geography', label: '◎ Geography' },
    { id: 'directory', label: '◉ Directory' },
] as const
type Tab = typeof TABS[number]['id']

/* derive warehouse type from name */
function warehouseType(name: string): string {
    if (/finished/i.test(name)) return 'Finished Goods'
    if (/raw/i.test(name)) return 'Raw Material'
    if (/dispatch/i.test(name)) return 'Dispatch'
    if (/bonded/i.test(name)) return 'Bonded'
    if (/cold/i.test(name)) return 'Cold Storage'
    if (/overflow/i.test(name)) return 'Overflow'
    if (/transit/i.test(name)) return 'Transit Hub'
    if (/regional/i.test(name)) return 'Regional DC'
    if (/quarantine/i.test(name)) return 'QC Quarantine'
    return 'General'
}

export default function WarehouseAnalytics({ warehouses }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = warehouses.length
        const active = warehouses.filter(w => w.is_active === 1).length
        const inactive = total - active
        const withManager = warehouses.filter(w => w.manager_name && w.manager_name.trim()).length

        /* state distribution */
        const stateMap: Record<string, number> = {}
        warehouses.forEach(w => { if (w.state) stateMap[w.state] = (stateMap[w.state] ?? 0) + 1 })
        const stateData = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* city */
        const cityMap: Record<string, number> = {}
        warehouses.forEach(w => { if (w.city) cityMap[w.city] = (cityMap[w.city] ?? 0) + 1 })
        const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* type distribution from name */
        const typeMap: Record<string, number> = {}
        warehouses.forEach(w => { const t = warehouseType(w.name); typeMap[t] = (typeMap[t] ?? 0) + 1 })
        const typeData = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* treemap */
        const treemapData = stateData.map((s, i) => ({ name: s.name, size: s.value, fill: C[i % C.length] }))

        /* radar */
        const radarData = stateData.slice(0, 6).map(s => ({
            state: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
            warehouses: s.value,
        }))

        return { total, active, inactive, withManager, stateData, cityData, typeData, treemapData, radarData }
    }, [warehouses])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Warehouse Analytics</h1>
                    <p className={styles.subtitle}>Storage network overview · {s.total} warehouses</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/masters/warehouses')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Warehouses" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Active" value={s.active} color={GREEN} />
                <KPI icon="◎" label="Inactive" value={s.inactive} color={ROSE} />
                <KPI icon="▣" label="States Covered" value={s.stateData.length} color={CYAN} />
                <KPI icon="⬡" label="Cities Covered" value={s.cityData.length} color={AMBER} />
                <KPI icon="◇" label="With Manager" value={s.withManager} color="#a78bfa" />
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

                    <Card title="Warehouse Type Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}
                                        label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {s.typeData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.72rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Warehouses by State">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.stateData} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Warehouses" radius={[6, 6, 0, 0]}>
                                        {s.stateData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Network Health">
                        <div className={styles.healthPanel}>
                            {[
                                { label: 'Active Rate', val: s.active / s.total, color: GREEN, disp: `${(s.active / s.total * 100).toFixed(1)}%` },
                                { label: 'Manager Assigned', val: s.withManager / s.total, color: CYAN, disp: `${(s.withManager / s.total * 100).toFixed(1)}%` },
                                { label: 'Inactive Warehouses', val: s.inactive / s.total, color: ROSE, disp: `${s.inactive} warehouses` },
                            ].map(r => (
                                <div key={r.label} className={styles.healthRow}>
                                    <span className={styles.healthLabel}>{r.label}</span>
                                    <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(r.val * 100).toFixed(0)}%`, background: r.color }} /></div>
                                    <span className={styles.healthPct} style={{ color: r.color }}>{r.disp}</span>
                                </div>
                            ))}
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>Network spans <strong>{s.stateData.length} states</strong> and <strong>{s.cityData.length} cities</strong>.</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'geography' && (
                <div className={styles.grid}>
                    <Card title="State Distribution — Treemap">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <Treemap data={s.treemapData} dataKey="size" nameKey="name" aspectRatio={4 / 3} content={<TreemapCell />} />
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Geographic Radar" action={<span className={styles.badge}>top 6 states</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={120}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="state" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Warehouses" dataKey="warehouses" stroke={ACCENT} fill={ACCENT} fillOpacity={0.25} />
                                    <Tooltip content={<Tip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Cities with Warehouses">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.cityData} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Warehouses" radius={[0, 6, 6, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Type Breakdown — Bar">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.typeData} barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Warehouses" radius={[6, 6, 0, 0]}>
                                        {s.typeData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'directory' && (
                <div className={styles.grid}>
                    <Card title="Warehouse Directory" action={<span className={styles.badge}>{s.total} locations</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Code</th><th>Name</th><th>City</th><th>State</th><th>Manager</th><th>Mobile</th><th>Status</th>
                            </tr></thead><tbody>
                                    {warehouses.map(w => (
                                        <tr key={w.id}>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>{w.code}</td>
                                            <td><strong>{w.name}</strong></td>
                                            <td>{w.city ?? '—'}</td><td>{w.state ?? '—'}</td>
                                            <td>{w.manager_name ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>{w.manager_mobile ?? '—'}</td>
                                            <td><span className={styles.riskPill} style={{ background: w.is_active === 1 ? `${GREEN}22` : `${ROSE}22`, color: w.is_active === 1 ? GREEN : ROSE }}>
                                                {w.is_active === 1 ? 'Active' : 'Inactive'}
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
