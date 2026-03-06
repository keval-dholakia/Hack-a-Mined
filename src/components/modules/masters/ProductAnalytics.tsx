'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/product'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './MasterAnalytics.module.scss'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    ScatterChart, Scatter, ZAxis,
    LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

type Props = { products: Product[] }

const C = ['#6366f1', '#22d3ee', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#60a5fa', '#4ade80', '#f87171']
const ACCENT = '#6366f1', GREEN = '#34d399', CYAN = '#22d3ee', AMBER = '#facc15', ROSE = '#f43f5e'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

function Tip({ active, payload, label, fmtVal }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className={styles.tooltip}>
            {label && <p className={styles.ttLabel}>{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color ?? ACCENT }}>
                    {p.name}: <strong>{fmtVal ? fmtVal(p.value) : p.value}</strong>
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
    { id: 'inventory', label: '▣ Inventory' },
    { id: 'pricing', label: '◈ Pricing' },
    { id: 'catalogue', label: '◉ Catalogue' },
] as const
type Tab = typeof TABS[number]['id']

export default function ProductAnalytics({ products }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('overview')

    const s = useMemo(() => {
        const total = products.length
        const active = products.filter(p => p.is_active === 1).length
        const inactive = total - active

        /* stock alerts */
        const outOfStock = products.filter(p => p.current_stock <= 0).length
        const belowMin = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock_level).length
        const healthy = total - outOfStock - belowMin

        /* category */
        const catMap: Record<string, number> = {}
        products.forEach(p => { if (p.category) catMap[p.category] = (catMap[p.category] ?? 0) + 1 })
        const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* unit */
        const unitMap: Record<string, number> = {}
        products.forEach(p => { unitMap[p.unit] = (unitMap[p.unit] ?? 0) + 1 })
        const unitData = Object.entries(unitMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

        /* GST slab */
        const gstMap: Record<string, number> = {}
        products.forEach(p => { const k = `${p.gst_percent}%`; gstMap[k] = (gstMap[k] ?? 0) + 1 })
        const gstData = Object.entries(gstMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([name, value]) => ({ name, value }))

        /* pricing ranges — purchase price buckets */
        const prBuckets: { label: string, min: number, max: number }[] = [
            { label: '< ₹100', min: 0, max: 100 }, { label: '₹100–500', min: 100, max: 500 },
            { label: '₹500–1K', min: 500, max: 1000 }, { label: '₹1K–5K', min: 1000, max: 5000 },
            { label: '₹5K–20K', min: 5000, max: 20000 }, { label: '> ₹20K', min: 20000, max: Infinity },
        ]
        const priceDistrib = prBuckets.map(b => ({
            name: b.label,
            value: products.filter(p => p.purchase_price >= b.min && p.purchase_price < b.max).length
        }))

        /* margin analysis — top 10 by margin% */
        const marginData = products
            .filter(p => p.purchase_price > 0)
            .map(p => ({
                name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
                margin: Math.round((p.sale_price - p.purchase_price) / p.purchase_price * 100),
                salePrice: p.sale_price,
                purchasePrice: p.purchase_price,
            }))
            .sort((a, b) => b.margin - a.margin).slice(0, 10)

        /* stock value by category */
        const catStockMap: Record<string, number> = {}
        products.forEach(p => {
            const cat = p.category ?? 'Unknown'
            catStockMap[cat] = (catStockMap[cat] ?? 0) + (p.current_stock * p.sale_price)
        })
        const stockValueData = Object.entries(catStockMap).sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value: Math.round(value) }))

        /* scatter: purchase_price vs sale_price for top 30 */
        const scatterData = products.slice(0, 30).map(p => ({
            x: p.purchase_price,
            y: p.sale_price,
            z: p.current_stock + 10,
            name: p.name.slice(0, 15),
        }))

        /* radar: category vs count */
        const radarData = catData.slice(0, 6).map(c => ({ subject: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name, value: c.value }))

        /* totals */
        const totalStockValue = products.reduce((s, p) => s + (p.current_stock * p.sale_price), 0)
        const avgMargin = products.filter(p => p.purchase_price > 0).reduce((s, p) => s + (p.sale_price - p.purchase_price) / p.purchase_price, 0)
            / (products.filter(p => p.purchase_price > 0).length || 1) * 100

        return {
            total, active, inactive, outOfStock, belowMin, healthy,
            catData, unitData, gstData, priceDistrib, marginData, stockValueData, scatterData, radarData,
            totalStockValue, avgMargin
        }
    }, [products])

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Product Analytics</h1>
                    <p className={styles.subtitle}>Catalogue & inventory intelligence · {s.total} products</p>
                </div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/masters/products')}>← Back to List</Button>
            </div>

            <div className={styles.kpiStrip}>
                <KPI icon="◈" label="Total Products" value={s.total} color={ACCENT} />
                <KPI icon="◉" label="Active" value={s.active} color={GREEN} />
                <KPI icon="▣" label="Out of Stock" value={s.outOfStock} color={ROSE} />
                <KPI icon="⬡" label="Below Min Stock" value={s.belowMin} color={AMBER} />
                <KPI icon="◎" label="Stock Value" value={`₹${(s.totalStockValue / 100000).toFixed(1)}L`} color={CYAN} />
                <KPI icon="◇" label="Avg Margin" value={`${s.avgMargin.toFixed(1)}%`} color="#a78bfa" />
            </div>

            <div className={styles.tabBar}>
                {TABS.map(t => (
                    <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className={styles.grid}>
                    <Card title="Products by Category">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={s.catData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                        outerRadius={100} paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {s.catData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Stock Health Status">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={[{ name: 'Healthy', value: s.healthy }, { name: 'Below Min', value: s.belowMin }, { name: 'Out of Stock', value: s.outOfStock }]}
                                        dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                        <Cell fill={GREEN} /><Cell fill={AMBER} /><Cell fill={ROSE} />
                                    </Pie>
                                    <Tooltip content={<Tip />} /><Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.78rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="GST Rate Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.gstData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]}>
                                        {s.gstData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Unit of Measure Distribution">
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={s.unitData} barSize={30}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]} fill={CYAN} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'inventory' && (
                <div className={styles.grid}>
                    <Card title="Stock Value by Category" action={<span className={styles.badge}>₹ sale price × stock</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.stockValueData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : `₹${v}`} />
                                    <Tooltip content={<Tip fmtVal={(v: number) => fmt(v)} />} />
                                    <Bar dataKey="value" name="Stock Value" radius={[6, 6, 0, 0]}>
                                        {s.stockValueData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Category Radar" action={<span className={styles.badge}>product count</span>}>
                        <div className={styles.chartWrap}>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={s.radarData} cx="50%" cy="50%" outerRadius={100}>
                                    <PolarGrid stroke="#1f2235" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#4b5563', fontSize: 10 }} />
                                    <Radar name="Products" dataKey="value" stroke={CYAN} fill={CYAN} fillOpacity={0.2} />
                                    <Tooltip content={<Tip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Stock Alert Summary" action={<span className={styles.badge}>critical items</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Product</th><th>Category</th><th>Unit</th><th>Min Stock</th><th>Current</th><th>Alert</th>
                            </tr></thead><tbody>
                                    {products.filter(p => p.current_stock <= p.min_stock_level)
                                        .sort((a, b) => a.current_stock - b.current_stock).slice(0, 15).map(p => {
                                            const alert = p.current_stock <= 0
                                                ? { label: 'Out of Stock', color: ROSE }
                                                : { label: 'Below Min', color: AMBER }
                                            return (
                                                <tr key={p.id}>
                                                    <td><strong>{p.name.slice(0, 22)}</strong><br /><small style={{ color: '#6b7280' }}>{p.code}</small></td>
                                                    <td>{p.category ?? '—'}</td><td>{p.unit}</td>
                                                    <td style={{ fontFamily: 'var(--mono)' }}>{p.min_stock_level}</td>
                                                    <td style={{ fontFamily: 'var(--mono)', color: p.current_stock <= 0 ? ROSE : AMBER }}>{p.current_stock}</td>
                                                    <td><span className={styles.riskPill} style={{ background: `${alert.color}22`, color: alert.color }}>{alert.label}</span></td>
                                                </tr>
                                            )
                                        })}
                                </tbody></table>
                        </div>
                    </Card>

                    <Card title="Healthy Products" action={<span className={styles.badge}>above min stock</span>}>
                        <div className={styles.healthPanel}>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Healthy Stock</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(s.healthy / s.total * 100).toFixed(0)}%`, background: GREEN }} /></div>
                                <span className={styles.healthPct} style={{ color: GREEN }}>{(s.healthy / s.total * 100).toFixed(1)}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Below Min Stock</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(s.belowMin / s.total * 100).toFixed(0)}%`, background: AMBER }} /></div>
                                <span className={styles.healthPct} style={{ color: AMBER }}>{(s.belowMin / s.total * 100).toFixed(1)}%</span>
                            </div>
                            <div className={styles.healthRow}>
                                <span className={styles.healthLabel}>Out of Stock</span>
                                <div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${(s.outOfStock / s.total * 100).toFixed(0)}%`, background: ROSE }} /></div>
                                <span className={styles.healthPct} style={{ color: ROSE }}>{(s.outOfStock / s.total * 100).toFixed(1)}%</span>
                            </div>
                            <div className={styles.insight}>
                                <span className={styles.insightIcon}>💡</span>
                                <span>{s.outOfStock} product{s.outOfStock !== 1 ? 's' : ''} out of stock &amp; {s.belowMin} below minimum threshold. Total inventory value: <strong>{fmt(Math.round(s.totalStockValue))}</strong>.</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'pricing' && (
                <div className={styles.grid}>
                    <Card title="Purchase Price Distribution">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={s.priceDistrib} barSize={38}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]}>
                                        {s.priceDistrib.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Top 10 Products by Gross Margin" action={<span className={styles.badge}>margin %</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={s.marginData} layout="vertical" barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" horizontal={false} />
                                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                                    <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip fmtVal={(v: number) => `${v}%`} />} />
                                    <Bar dataKey="margin" name="Margin %" radius={[0, 6, 6, 0]}>
                                        {s.marginData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Buy vs Sell Price — Scatter" action={<span className={styles.badge}>bubble = stock qty</span>}>
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={320}>
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" />
                                    <XAxis type="number" dataKey="x" name="Buy Price" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                                        label={{ value: 'Buy Price (₹)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
                                    <YAxis type="number" dataKey="y" name="Sell Price" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                                        label={{ value: 'Sell Price (₹)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
                                    <ZAxis type="number" dataKey="z" range={[40, 400]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        const d = payload[0]?.payload
                                        return <div className={styles.tooltip}><p className={styles.ttLabel}>{d?.name}</p><p>Buy: <strong>{fmt(d?.x)}</strong></p><p>Sell: <strong>{fmt(d?.y)}</strong></p><p>Stock: <strong>{d?.z - 10}</strong></p></div>
                                    }} />
                                    <Scatter name="Products" data={s.scatterData} fill={ACCENT} fillOpacity={0.7} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Pricing Summary">
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Product</th><th>Category</th><th>Buy Price</th><th>Sale Price</th><th>Margin</th>
                            </tr></thead><tbody>
                                    {[...products].filter(p => p.purchase_price > 0)
                                        .sort((a, b) => (b.sale_price - b.purchase_price) / b.purchase_price - (a.sale_price - a.purchase_price) / a.purchase_price)
                                        .slice(0, 12).map(p => {
                                            const margin = Math.round((p.sale_price - p.purchase_price) / p.purchase_price * 100)
                                            const color = margin > 30 ? GREEN : margin > 15 ? AMBER : ROSE
                                            return (
                                                <tr key={p.id}>
                                                    <td><strong>{p.name.slice(0, 22)}</strong></td>
                                                    <td>{p.category ?? '—'}</td>
                                                    <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.purchase_price)}</td>
                                                    <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.sale_price)}</td>
                                                    <td><span className={styles.riskPill} style={{ background: `${color}22`, color }}>{margin}%</span></td>
                                                </tr>
                                            )
                                        })}
                                </tbody></table>
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'catalogue' && (
                <div className={styles.grid}>
                    <Card title="Category Breakdown">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={s.catData} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2235" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]}>
                                        {s.catData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Category vs Stock Value — Pie">
                        <div className={styles.chartWrapTall}>
                            <ResponsiveContainer width="100%" height={360}>
                                <PieChart>
                                    <Pie data={s.stockValueData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={130} paddingAngle={2}>
                                        {s.stockValueData.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                                    </Pie>
                                    <Tooltip content={<Tip fmtVal={(v: number) => fmt(v)} />} />
                                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Full Catalogue" action={<span className={styles.badge}>{s.total} items</span>}>
                        <div className={styles.summaryTable}>
                            <table><thead><tr>
                                <th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>GST</th><th>Sale Price</th><th>Stock</th>
                            </tr></thead><tbody>
                                    {products.slice(0, 20).map(p => {
                                        const stockColor = p.current_stock <= 0 ? ROSE : p.current_stock <= p.min_stock_level ? AMBER : GREEN
                                        return (
                                            <tr key={p.id}>
                                                <td style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem' }}>{p.code}</td>
                                                <td><strong>{p.name.slice(0, 22)}</strong></td>
                                                <td>{p.category ?? '—'}</td><td>{p.unit}</td>
                                                <td>{p.gst_percent}%</td>
                                                <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.sale_price)}</td>
                                                <td style={{ fontFamily: 'var(--mono)', color: stockColor }}>{p.current_stock}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody></table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
