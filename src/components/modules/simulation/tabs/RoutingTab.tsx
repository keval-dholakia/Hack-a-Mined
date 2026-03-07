// src/app/dashboard/simulation/_components/tabs/RoutingTab.tsx
// Routing tab: operation breakdown per product, machine hours summary.

import { fmtN } from '@/lib/simulationEngine';
import { PRODUCTS, ROUTING, MACHINES } from '@/lib/simulationData';
import type { SimResult } from '@/types/simulation';
import type { MPSRow } from '@/types/simulation';
import styles from './tabs.module.scss';

interface RoutingTabProps {
    result: SimResult;
    mpsArr: MPSRow[];
}

export default function RoutingTab({ result, mpsArr }: RoutingTabProps) {
    const { routing, cost } = result;
    const prodMap = Object.fromEntries(PRODUCTS.map(p => [p.product_id, p]));
    const machMap = Object.fromEntries(MACHINES.map(m => [m.mid, m]));

    // Flatten routing steps for the table
    const rows: Array<{
        product: string;
        isFirstRow: boolean;
        operation: string;
        machine: string;
        laborMin: number;
        machineMin: number;
        totalLaborHrs: string;
        totalMachineHrs: string;
    }> = [];

    mpsArr
        .filter(r => r.pid && r.qty > 0)
        .forEach(row => {
            const steps = ROUTING.filter(s => s.pid === row.pid);
            steps.forEach((step, idx) => {
                rows.push({
                    product: idx === 0 ? (prodMap[row.pid]?.name ?? row.pid) : '',
                    isFirstRow: idx === 0,
                    operation: step.op,
                    machine: machMap[step.mach]?.name ?? step.mach,
                    laborMin: step.lm,
                    machineMin: step.mm,
                    totalLaborHrs: fmtN((row.qty * step.lm) / 60),
                    totalMachineHrs: fmtN((row.qty * step.mm) / 60),
                });
            });
        });

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Routing &amp; Operation Breakdown</h3>

            {/* KPI summary */}
            <div className={styles.kpiStrip}>
                <div className={styles.kpiCard}>
                    <span>Total Man-Hours</span>
                    <strong>{fmtN(routing.lh)}</strong>
                </div>
                <div className={styles.kpiCard}>
                    <span>Total Machine-Hours</span>
                    <strong>{fmtN(routing.mh)}</strong>
                </div>
                <div className={styles.kpiCard}>
                    <span>Energy Consumed</span>
                    <strong>{fmtN(cost.kwh)} kWh</strong>
                </div>
            </div>

            {/* Operations table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Operation</th>
                            <th>Machine</th>
                            <th>Labor Min/unit</th>
                            <th>Machine Min/unit</th>
                            <th>Total Labor Hrs</th>
                            <th>Total Machine Hrs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td>
                                    {row.isFirstRow
                                        ? <strong>{row.product}</strong>
                                        : <span className={styles.statusMuted}>{row.product}</span>
                                    }
                                </td>
                                <td><strong>{row.operation}</strong></td>
                                <td>{row.machine}</td>
                                <td>{row.laborMin}</td>
                                <td>{row.machineMin}</td>
                                <td>{row.totalLaborHrs}</td>
                                <td>{row.totalMachineHrs}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
