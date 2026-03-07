// src/app/dashboard/simulation/_components/tabs/MRPTab.tsx
// MRP tab: shows BOM explosion results — required vs available stock per material.

import { fmtN, fmtL } from '@/lib/simulationEngine';
import type { SimResult, MRPLine } from '@/types/simulation';
import styles from './tabs.module.scss';

interface MRPTabProps {
    result: SimResult;
}

export default function MRPTab({ result }: MRPTabProps) {
    const { mrp } = result;

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Material Requirements (BOM Explosion)</h3>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Unit</th>
                            <th>Required</th>
                            <th>Available</th>
                            <th>Shortage</th>
                            <th>Coverage %</th>
                            <th>Unit Price</th>
                            <th>Req. Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mrp.lines.map((line: MRPLine) => (
                            <tr key={line.mid}>
                                <td><strong>{line.name}</strong><small>{line.mid}</small></td>
                                <td>{line.unit}</td>
                                <td>{fmtN(line.req)}</td>
                                <td>{fmtN(line.avail)}</td>
                                <td>{line.short > 0 ? <span className={styles.statusErr}>{fmtN(line.short)}</span> : '—'}</td>
                                <td>{Math.round(line.covPct)}%</td>
                                <td>₹{fmtN(line.price)}</td>
                                <td>{fmtL(line.cost)}</td>
                                <td>
                                    {line.ready
                                        ? <span className={styles.statusOk}>READY</span>
                                        : <span className={styles.statusErr}>SHORT</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={7}>Total Material Cost</td>
                            <td>{fmtL(mrp.totalCost)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Readiness summary */}
            <div className={styles.progressRow}>
                <div className={styles.label}>Material Readiness</div>
                <div className={styles.barWrap}>
                    <div
                        className={styles.barFill}
                        style={{ width: `${mrp.readinessPct}%`, background: mrp.readinessPct === 100 ? 'var(--green)' : 'var(--amber)' }}
                    />
                </div>
                <div className={styles.value}>{mrp.readinessPct.toFixed(1)}%</div>
            </div>

            <div className={styles.kpiStrip}>
                <div className={styles.kpiCard}>
                    <span>Materials Ready</span>
                    <strong>{mrp.readyN}</strong>
                </div>
                <div className={styles.kpiCard}>
                    <span>Materials Short</span>
                    <strong className={mrp.lines.length - mrp.readyN > 0 ? styles.statusErr : ''}>
                        {mrp.lines.length - mrp.readyN}
                    </strong>
                </div>
            </div>
        </div>
    );
}