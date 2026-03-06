// src/app/dashboard/simulation/_components/tabs/CostingTab.tsx
// Costing tab: donut breakdown, detailed cost boxes, per-unit cost table.

import { fmtL, fmtN } from '@/lib/simulationEngine';
import { BOM, ROUTING, MATERIALS, PRODUCTS } from '@/lib/simulationData';
import type { SimResult } from '@/types/simulation';
import type { MPSRow } from '@/types/simulation';
import styles from './tabs.module.scss';

interface CostingTabProps {
    result: SimResult;
    laborRate: number;
    energyRate: number;
    mpsArr: MPSRow[];
}

export default function CostingTab({
    result, laborRate, energyRate, mpsArr
}: CostingTabProps) {
    const { cost, routing } = result;
    const prodMap = Object.fromEntries(PRODUCTS.map(p => [p.product_id, p]));

    // Per-unit cost breakdown per product
    const perUnitRows = mpsArr
        .filter(r => r.pid && r.qty > 0)
        .map(row => {
            const laborHrsPerUnit =
                ROUTING.filter(s => s.pid === row.pid).reduce((s, r) => s + r.lm, 0) / 60;

            const matCostPerUnit =
                BOM.filter(b => b.pid === row.pid).reduce((s, b) => {
                    const mat = MATERIALS.find(m => m.mid === b.mid);
                    return s + (mat ? b.qpu * mat.price : 0);
                }, 0);

            const totalPerUnit = laborHrsPerUnit * laborRate + matCostPerUnit;

            return {
                product: prodMap[row.pid]?.name ?? row.pid,
                qty: row.qty,
                laborHrs: `${fmtN(laborHrsPerUnit)} hrs`,
                matCost: fmtL(matCostPerUnit),
                totalCost: fmtL(totalPerUnit),
            };
        });

    const costBreakdown = [
        { label: 'Material Cost', value: cost.mc, note: 'BOM × Latest Purchase Price' },
        { label: 'Labor Cost', value: cost.lc, note: `${fmtN(routing.lh)} hrs × ₹${laborRate}/hr` },
        { label: 'Electricity Cost', value: cost.ec, note: `${fmtN(cost.kwh)} kWh × ₹${energyRate}` },
    ];

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Provisional Cost Estimation</h3>

            {/* Cost breakdown */}
            <div className={styles.kpiStrip}>
                {costBreakdown.map(row => (
                    <div key={row.label} className={styles.kpiCard}>
                        <span>{row.label}</span>
                        <strong>{fmtL(row.value)}</strong>
                        <small>{row.note}</small>
                        <small>{((row.value / cost.total) * 100).toFixed(1)}%</small>
                    </div>
                ))}

                <div className={styles.kpiCard} style={{ background: 'rgba(108, 143, 255, 0.05)', borderColor: 'rgba(108, 143, 255, 0.2)' }}>
                    <span style={{ color: 'var(--accent)' }}>Total Estimated Cost</span>
                    <strong style={{ color: 'var(--accent)' }}>{fmtL(cost.total)}</strong>
                    <small>Provisional — actual may vary</small>
                </div>
            </div>

            {/* Per-unit table */}
            <div>
                <h4 className={styles.subHeading}>Per-Unit Cost by Product</h4>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Labor hrs/unit</th>
                                <th>Material Cost/unit</th>
                                <th>Est. Cost/unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {perUnitRows.map(row => (
                                <tr key={row.product}>
                                    <td><strong>{row.product}</strong></td>
                                    <td>{row.qty}</td>
                                    <td>{row.laborHrs}</td>
                                    <td>{row.matCost}</td>
                                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.totalCost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}