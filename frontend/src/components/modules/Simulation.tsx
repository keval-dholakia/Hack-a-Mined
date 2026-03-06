'use client';

import { useState, ReactNode } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { PRODUCTS, MATERIALS, MACHINES, ROUTING, BOM } from '@/lib/simulationData';
import { runSimulation, fmtL, fmtN, fmtDt, SimResult } from '@/lib/simulationEngine';
import styles from './Simulation.module.css';

// ─── Tiny SVG Charts ──────────────────────────────────────

function RingChart({ pct, color }: { pct: number; color: string }) {
    const r = 48, cx = 60, cy = 60;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={120} height={120}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-active)" strokeWidth={8} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
                style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text)" fontSize={18} fontWeight={700} fontFamily="DM Mono,monospace">{Math.round(pct)}%</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>READY</text>
        </svg>
    );
}

function GaugeChart({ pct, color }: { pct: number; color: string }) {
    const r = 60, cx = 80, cy = 78;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const fill = Math.min(1, pct / 100);
    const angle = fill * 180;
    const endX = cx + r * Math.cos(toRad(180 - angle));
    const endY = cy - r * Math.sin(toRad(180 - angle));
    const largeArc = angle > 180 ? 1 : 0;
    return (
        <svg width={160} height={96}>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="var(--bg-active)" strokeWidth={10} strokeLinecap="round" />
            {pct > 0 && (
                <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
                    fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
                    style={{ transition: 'd 0.7s ease' }} />
            )}
            <text x={cx - r - 4} y={cy + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="DM Mono,monospace">0</text>
            <text x={cx + r + 4} y={cy + 18} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="DM Mono,monospace">100%</text>
            <text x={cx} y={cy - 10} textAnchor="middle" fill={color} fontSize={18} fontFamily="DM Mono,monospace" fontWeight={700}>{Math.round(pct)}%</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--text-muted)" fontSize={9} fontFamily="DM Mono,monospace">LOAD</text>
        </svg>
    );
}

function DonutChart({ slices }: { slices: Array<{ label: string; v: number; color: string }> }) {
    const total = slices.reduce((s, sl) => s + sl.v, 0);
    if (!total) return null;
    const r = 52, cx = 64, cy = 64;
    const circ = 2 * Math.PI * r;
    let cum = 0;
    return (
        <svg width={128} height={128}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-active)" strokeWidth={14} />
            {slices.map((sl, i) => {
                const pct = sl.v / total;
                const offset = circ * (0.25 - cum);
                cum += pct;
                return (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={sl.color} strokeWidth={14}
                        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                );
            })}
        </svg>
    );
}

// ─── Sub-components ───────────────────────────────────────

function SumCard({ label, val, sub, accent }: { label: string; val: string; sub?: string; accent: string }) {
    return (
        <div className={styles.sumCard} style={{ borderTop: `2px solid ${accent}` }}>
            <div className={styles.sumLabel}>{label}</div>
            <div className={styles.sumVal}>{val}</div>
            {sub && <div className={styles.sumSub}>{sub}</div>}
        </div>
    );
}

function HBar({ label, val, max, color, sub }: { label: string; val: number; max: number; color: string; sub: string }) {
    const pct = max > 0 ? Math.min(100, (val / max) * 100) : 0;
    return (
        <div className={styles.hbar}>
            <div className={styles.hbarRow}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)' }}>{sub}</span>
            </div>
            <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

function DetailRow({ label, val }: { label: string; val: ReactNode }) {
    return (
        <div className={styles.detailRow}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{val}</span>
        </div>
    );
}

// ─── Result Tabs ──────────────────────────────────────────

function MRPTab({ r }: { r: SimResult }) {
    const ring = r.mrp.readinessPct;
    const ringColor = ring === 100 ? 'var(--green)' : 'var(--amber)';
    return (
        <div className={styles.mrpGrid}>
            {/* Big table */}
            <Card title="Material Requirements (BOM Explosion)" noPad>
                <Table
                    columns={[
                        { key: 'name', label: 'Material' },
                        { key: 'unit', label: 'Unit', align: 'r' },
                        { key: 'req', label: 'Required', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtN(v as number)}</span> },
                        { key: 'avail', label: 'Available', align: 'r', render: (v, row) => <span style={{ fontFamily: 'var(--mono)', color: (row as { ready: boolean }).ready ? 'var(--green)' : 'inherit' }}>{fmtN(v as number)}</span> },
                        { key: 'short', label: 'Shortage', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: (v as number) > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{(v as number) > 0 ? fmtN(v as number) : '—'}</span> },
                        {
                            key: 'covPct', label: 'Coverage', align: 'r', render: (v, row) => (
                                <div className={styles.coverageCell}>
                                    <div className={styles.barTrack} style={{ flex: 1 }}>
                                        <div className={styles.barFill} style={{ width: `${v as number}%`, background: (row as { ready: boolean }).ready ? 'var(--green)' : 'var(--amber)' }} />
                                    </div>
                                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text-muted)', width: 32 }}>{Math.round(v as number)}%</span>
                                </div>
                            )
                        },
                        { key: 'price', label: 'Unit Price', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)' }}>₹{fmtN(v as number)}</span> },
                        { key: 'cost', label: 'Req. Cost', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtL(v as number)}</span> },
                        { key: 'ready', label: 'Status', align: 'r', render: v => <Badge label={v ? 'READY' : 'SHORT'} variant={v ? 'success' : 'danger'} /> },
                    ]}
                    rows={r.mrp.lines}
                />
                <div className={styles.tblFooter}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Material Cost</span>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmtL(r.mrp.totalCost)}</span>
                </div>
            </Card>

            {/* Readiness sidebar */}
            <Card title="Readiness">
                <div className={styles.readinessSidebar}>
                    <RingChart pct={ring} color={ringColor} />
                    <DetailRow label="Ready" val={<span style={{ color: 'var(--green)', fontWeight: 600 }}>{r.mrp.readyN}</span>} />
                    <DetailRow label="Short" val={<span style={{ color: 'var(--red)', fontWeight: 600 }}>{r.mrp.lines.length - r.mrp.readyN}</span>} />
                    <DetailRow label="Mat. Cost" val={fmtL(r.mrp.totalCost)} />
                </div>
            </Card>
        </div>
    );
}

function CRPTab({ r, workers, shift, start }: { r: SimResult; workers: number; shift: number; start: string }) {
    const gaugeLoad = r.crp.req > 0 ? Math.min(110, (r.crp.req / r.crp.monthAvail) * 100) : 0;
    const gaugeColor = r.crp.overload ? 'var(--red)' : gaugeLoad > 80 ? 'var(--amber)' : 'var(--green)';
    const COLS = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--red)'];
    const machMap = Object.fromEntries(MACHINES.map(m => [m.mid, m]));
    const mhmEntries = Object.entries(r.routing.mhm);
    const maxMH = Math.max(...Object.values(r.routing.mhm));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.crpTop}>
                {/* Gauge */}
                <Card title="Capacity Gauge">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <GaugeChart pct={gaugeLoad} color={gaugeColor} />
                        <Badge label={r.crp.overload ? '⚠ OVERLOAD — Exceeds monthly capacity' : 'Within capacity'} variant={r.crp.overload ? 'danger' : 'success'} />
                    </div>
                </Card>

                {/* Hours */}
                <Card title="Hours Breakdown">
                    {[
                        ['Required Man-Hours', fmtN(r.crp.req), 'var(--accent)'],
                        ['Monthly Available', fmtN(r.crp.monthAvail), 'var(--green)'],
                        ['Total Machine-Hours', fmtN(r.routing.mh), 'var(--amber)'],
                    ].map(([lbl, val, col]) => (
                        <div key={lbl} className={styles.hoursBox} style={{ borderLeft: `3px solid ${col}` }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lbl}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{val}</span>
                        </div>
                    ))}
                </Card>

                {/* Timeline */}
                <Card title="Timeline">
                    {[
                        ['Days Required', `${Math.ceil(r.crp.days)} days`],
                        ['Start Date', fmtDt(new Date(start))],
                        ['Est. Completion', fmtDt(r.crp.comp)],
                        ['Month End', fmtDt(r.crp.monthEnd)],
                        ['Workers × Shift', `${workers} × ${shift}h`],
                        ['Daily Capacity', `${fmtN(workers * shift)} hrs/day`],
                    ].map(([lbl, val]) => <DetailRow key={lbl} label={lbl} val={val} />)}
                </Card>
            </div>

            {/* Machine load bars */}
            <Card title="Machine Hours by Station">
                <div className={styles.machBars}>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Station hours (absolute)</div>
                        {mhmEntries.map(([mid, mh], i) => (
                            <HBar key={mid} label={machMap[mid]?.name || mid} val={mh} max={maxMH} color={COLS[i % 4]} sub={`${fmtN(mh)} hrs`} />
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Utilisation vs monthly capacity</div>
                        {mhmEntries.map(([mid, mh], i) => (
                            <HBar key={mid} label={machMap[mid]?.name || mid} val={mh} max={r.crp.monthAvail} color={COLS[i % 4]} sub={`${fmtN(mh)}h / ${fmtN(r.crp.monthAvail)}h avail`} />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}

function CostingTab({ r, laborRate, energyRate, mpsArr }: { r: SimResult; laborRate: number; energyRate: number; mpsArr: Array<{ pid: string; qty: number }> }) {
    const slices = [
        { label: 'Material', v: r.cost.mc, color: 'var(--accent)' },
        { label: 'Labor', v: r.cost.lc, color: 'var(--green)' },
        { label: 'Electricity', v: r.cost.ec, color: 'var(--amber)' },
    ];
    const prodMap = Object.fromEntries(PRODUCTS.map(p => [p.product_id, p]));

    const puRows = mpsArr.filter(r => r.pid && r.qty > 0).map(row => {
        const lm = ROUTING.filter(r => r.pid === row.pid).reduce((s, r) => s + r.lm, 0) / 60;
        const mc = BOM.filter(b => b.pid === row.pid).reduce((s, b) => {
            const m = MATERIALS.find(m => m.mid === b.mid);
            return s + (m ? b.qpu * m.price : 0);
        }, 0);
        const tot = lm * laborRate + mc;
        return { product: prodMap[row.pid]?.name || row.pid, qty: row.qty, lm: `${fmtN(lm)} hrs`, mc: fmtL(mc), tot: fmtL(tot) };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.costTop}>
                {/* Donut */}
                <Card title="Cost Breakdown">
                    <div className={styles.donutWrap}>
                        <DonutChart slices={slices} />
                        <div className={styles.donutLegend}>
                            {slices.map(sl => (
                                <div key={sl.label} className={styles.legendRow}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: sl.color, flexShrink: 0, display: 'inline-block' }} />
                                    <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{sl.label}</span>
                                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{fmtL(sl.v)}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 38, textAlign: 'right' }}>{((sl.v / r.cost.total) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Detail */}
                <Card title="Cost Detail">
                    {[
                        { label: 'Material Cost', val: r.cost.mc, color: 'var(--accent)', note: 'BOM × Latest Purchase Price' },
                        { label: 'Labor Cost', val: r.cost.lc, color: 'var(--green)', note: `${fmtN(r.routing.lh)} hrs × ₹${laborRate}/hr` },
                        { label: 'Electricity Cost', val: r.cost.ec, color: 'var(--amber)', note: `${fmtN(r.cost.kwh)} kWh × ₹${energyRate}` },
                    ].map(row => (
                        <div key={row.label} className={styles.costBox} style={{ borderLeft: `3px solid ${row.color}` }}>
                            <div className={styles.costBoxTop}>
                                <span style={{ fontWeight: 500 }}>{row.label}</span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600 }}>{fmtL(row.val)}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.note}</div>
                        </div>
                    ))}
                    <div className={styles.costTotal}>
                        <div className={styles.costBoxTop}>
                            <span style={{ fontWeight: 600 }}>Total Estimated Cost</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{fmtL(r.cost.total)}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Provisional — actual may vary</div>
                    </div>
                </Card>
            </div>

            {/* Per-unit table */}
            <Card title="Per-Unit Cost by Product" noPad>
                <Table
                    columns={[
                        { key: 'product', label: 'Product' },
                        { key: 'qty', label: 'Qty', align: 'r' },
                        { key: 'lm', label: 'Labor hrs/unit', align: 'r' },
                        { key: 'mc', label: 'Material Cost/unit', align: 'r' },
                        { key: 'tot', label: 'Est. Cost/unit', align: 'r' },
                    ]}
                    rows={puRows}
                />
            </Card>
        </div>
    );
}

function RoutingTab({ r, mpsArr }: { r: SimResult; mpsArr: Array<{ pid: string; qty: number }> }) {
    const COLS = ['var(--accent)', 'var(--green)', 'var(--amber)'];
    const prodMap = Object.fromEntries(PRODUCTS.map(p => [p.product_id, p]));
    const machMap = Object.fromEntries(MACHINES.map(m => [m.mid, m]));

    const rows: Record<string, unknown>[] = [];
    mpsArr.filter(r => r.pid && r.qty > 0).forEach(row => {
        const steps = ROUTING.filter(s => s.pid === row.pid);
        steps.forEach((step, si) => {
            rows.push({
                product: si === 0 ? (prodMap[row.pid]?.name || row.pid) : '',
                isFirst: si === 0,
                op: step.op,
                machine: machMap[step.mach]?.name || step.mach,
                lm: step.lm,
                mm: step.mm,
                totalLH: fmtN((row.qty * step.lm) / 60),
                totalMH: fmtN((row.qty * step.mm) / 60),
            });
        });
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.routingTop}>
                {[
                    ['Total Man-Hours', fmtN(r.routing.lh), COLS[0]],
                    ['Total Machine-Hours', fmtN(r.routing.mh), COLS[1]],
                    ['Energy Consumed', `${fmtN(r.cost.kwh)} kWh`, COLS[2]],
                ].map(([lbl, val, col]) => (
                    <div key={lbl} className={styles.routingKpi} style={{ borderTop: `2px solid ${col}` }}>
                        <div className={styles.sumLabel}>{lbl}</div>
                        <div className={styles.sumVal}>{val}</div>
                    </div>
                ))}
            </div>

            <Card title="Operation Breakdown by Product" noPad>
                <Table
                    columns={[
                        { key: 'product', label: 'Product', render: (v, row) => <span style={{ fontWeight: (row as { isFirst: boolean }).isFirst ? 500 : 400, color: (row as { isFirst: boolean }).isFirst ? 'var(--text-primary)' : 'var(--text-muted)' }}>{v as string}</span> },
                        { key: 'op', label: 'Operation' },
                        { key: 'machine', label: 'Machine', render: v => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v as string}</span> },
                        { key: 'lm', label: 'Labor Min/unit', align: 'r' },
                        { key: 'mm', label: 'Machine Min/unit', align: 'r' },
                        { key: 'totalLH', label: 'Total Labor Hrs', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{v as string}</span> },
                        { key: 'totalMH', label: 'Total Machine Hrs', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{v as string}</span> },
                    ]}
                    rows={rows}
                />
            </Card>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────

interface MPSRow { pid: string; qty: number; }

export default function Simulation() {
    const [mps, setMps] = useState<MPSRow[]>([
        { pid: 'ALTO', qty: 20 }, { pid: 'SWIFT', qty: 30 }, { pid: 'BALENO', qty: 25 },
    ]);
    const [shift, setShift] = useState(10);
    const [workers, setWorkers] = useState(50);
    const [start, setStart] = useState(() => new Date().toISOString().split('T')[0]);
    const [laborRate, setLaborRate] = useState(550);
    const [energyRate, setEnergyRate] = useState(9);
    const [showAdv, setShowAdv] = useState(false);
    const [result, setResult] = useState<SimResult | null>(null);
    const [activeTab, setActiveTab] = useState('MRP');

    const RESULT_TABS = ['MRP', 'CRP', 'Costing', 'Routing'];

    const handleRun = () => {
        if (!mps.some(r => r.pid && r.qty > 0)) return;
        const res = runSimulation({ mps, workers, shift, start, laborRate, energyRate });
        setResult(res);
        setActiveTab('MRP');
        setTimeout(() => document.getElementById('sim-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    const addRow = () => setMps(prev => [...prev, { pid: '', qty: 0 }]);
    const removeRow = (i: number) => setMps(prev => prev.filter((_, idx) => idx !== i));
    const updateRow = (i: number, field: keyof MPSRow, val: string | number) =>
        setMps(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

    return (
        <>
            <PageHeader
                title="Production Simulation & Forecasting"
                description="MPS → BOM Explosion → Capacity Planning → Cost Estimation"
                actions={result ? <Button variant="secondary" onClick={() => setResult(null)}>↺ Reset</Button> : undefined}
            />

            {/* Two-col: Input | Reference */}
            <div className={styles.layout}>
                {/* Left: Input */}
                <div className={styles.inputCol}>
                    {/* MPS Card */}
                    <Card title="Master Production Schedule (MPS)">
                        <div className={styles.mpsHeader}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Product</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Target Qty</span>
                            <span />
                        </div>
                        {mps.map((row, i) => (
                            <div key={i} className={styles.mpsRow}>
                                <select className="inp" value={row.pid} onChange={e => updateRow(i, 'pid', e.target.value)}>
                                    <option value="">Select product…</option>
                                    {PRODUCTS.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                                </select>
                                <input className="inp mono" type="number" value={row.qty} min={0}
                                    onChange={e => updateRow(i, 'qty', Number(e.target.value))} />
                                <button className={styles.removeBtn} onClick={() => removeRow(i)}>×</button>
                            </div>
                        ))}
                        <button className={styles.addRowBtn} onClick={addRow}>+ Add Product</button>
                    </Card>

                    {/* Params Card */}
                    <Card title="Parameters">
                        <div className={styles.paramGrid}>
                            <div>
                                <label className={styles.fieldLabel}>Shift Hours</label>
                                <input className="inp mono" type="number" value={shift} onChange={e => setShift(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className={styles.fieldLabel}>Workers</label>
                                <input className="inp mono" type="number" value={workers} onChange={e => setWorkers(Number(e.target.value))} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label className={styles.fieldLabel}>Planning Start Date</label>
                            <input className="inp" type="date" value={start} onChange={e => setStart(e.target.value)} />
                        </div>
                        <button className={styles.advToggle} onClick={() => setShowAdv(v => !v)}>
                            <span style={{ display: 'inline-block', transition: 'transform 0.15s', transform: showAdv ? 'rotate(90deg)' : 'none' }}>▶</span>
                            <span style={{ marginLeft: 4 }}>Advanced Rates</span>
                        </button>
                        {showAdv && (
                            <div className={`${styles.paramGrid} ${styles.advPanel}`}>
                                <div>
                                    <label className={styles.fieldLabel}>Labor Rate (₹/hr)</label>
                                    <input className="inp mono" type="number" value={laborRate} onChange={e => setLaborRate(Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className={styles.fieldLabel}>Energy Rate (₹/kWh)</label>
                                    <input className="inp mono" type="number" value={energyRate} onChange={e => setEnergyRate(Number(e.target.value))} />
                                </div>
                            </div>
                        )}
                    </Card>

                    <Button variant="primary" style={{ width: '100%', justifyContent: 'center' } as React.CSSProperties} onClick={handleRun}>
                        ▶ Run Simulation
                    </Button>
                </div>

                {/* Right: Reference panel */}
                <div className={styles.refCol}>
                    {/* Material Master */}
                    <Card title="Material Master" noPad>
                        <Table
                            columns={[
                                { key: 'name', label: 'Material' },
                                { key: 'unit', label: 'Unit', align: 'r' },
                                { key: 'stock', label: 'Stock', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)' }}>{fmtN(v as number)}</span> },
                                { key: 'price', label: 'Price', align: 'r', render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>₹{fmtN(v as number)}</span> },
                            ]}
                            rows={MATERIALS}
                        />
                    </Card>

                    {/* Machine Master */}
                    <Card title="Machine Master">
                        <div className={styles.machGrid}>
                            {MACHINES.map((m, i) => {
                                const colors = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--red)'];
                                return (
                                    <div key={m.mid} className={styles.machCard} style={{ borderLeft: `3px solid ${colors[i % 4]}` }}>
                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--mono)' }}>{m.mid} · {m.kw} kW</div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div id="sim-results">
                    {/* Section separator */}
                    <div className={styles.secSep}>
                        <span className={styles.secSepLine} />
                        <span>Simulation Results</span>
                        <span className={styles.secSepLine} />
                    </div>

                    {/* Summary bar */}
                    <div className={styles.sumGrid}>
                        <SumCard label="Total Estimated Cost" val={fmtL(result.cost.total)} sub="Labor + Material + Overhead" accent="var(--accent)" />
                        <SumCard label="Days Required" val={`${Math.ceil(result.crp.days)} days`} sub={`Completion: ${fmtDt(result.crp.comp)}`} accent={result.crp.overload ? 'var(--red)' : 'var(--green)'} />
                        <SumCard label="Material Readiness" val={`${result.mrp.readinessPct.toFixed(1)}%`} sub={`${result.mrp.readyN} / ${result.mrp.lines.length} materials OK`} accent={result.mrp.readinessPct === 100 ? 'var(--green)' : 'var(--amber)'} />
                        <SumCard label="Total Man-Hours" val={fmtN(result.routing.lh)} sub={`${fmtN(result.routing.mh)} machine-hrs`} accent="var(--text-muted)" />
                        <SumCard label="Capacity Status" val={result.crp.overload ? 'OVERLOAD' : 'OK'} sub={result.crp.overload ? 'Exceeds monthly capacity' : 'Within monthly capacity'} accent={result.crp.overload ? 'var(--red)' : 'var(--green)'} />
                    </div>

                    {/* Overload alert */}
                    {result.crp.overload && (
                        <div className={styles.overloadAlert}>
                            <span style={{ fontSize: 16 }}>⚠</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>Capacity Overload Detected</div>
                                <div style={{ fontSize: 12, color: 'var(--red)', opacity: 0.85, marginTop: 3 }}>
                                    Required {fmtN(result.crp.req)} man-hours exceeds monthly available {fmtN(result.crp.monthAvail)} hours. Consider adding workers or extending shift hours.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        {RESULT_TABS.map(t => (
                            <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'MRP' && <MRPTab r={result} />}
                    {activeTab === 'CRP' && <CRPTab r={result} workers={workers} shift={shift} start={start} />}
                    {activeTab === 'Costing' && <CostingTab r={result} laborRate={laborRate} energyRate={energyRate} mpsArr={mps} />}
                    {activeTab === 'Routing' && <RoutingTab r={result} mpsArr={mps} />}
                </div>
            )}
        </>
    );
}
