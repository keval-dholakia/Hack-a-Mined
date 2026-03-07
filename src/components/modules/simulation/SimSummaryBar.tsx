// src/app/dashboard/simulation/_components/SimSummaryBar.tsx
// Summary cards shown immediately after simulation runs.
// Shows: Total Cost, Days Required, Material Readiness, Man-Hours, Capacity Status.

import { fmtL, fmtN, fmtDt } from '@/lib/simulationEngine';
import type { SimResult } from '@/types/simulation';
import styles from './SimSummaryBar.module.scss';

interface SimSummaryBarProps {
    result: SimResult;
}

export default function SimSummaryBar({ result }: SimSummaryBarProps) {
    const { cost, crp, mrp, routing } = result;

    const cards = [
        {
            label: 'Total Estimated Cost',
            value: fmtL(cost.total),
            sub: 'Labor + Material + Overhead',
            alert: false,
        },
        {
            label: 'Days Required',
            value: `${Math.ceil(crp.days)} days`,
            sub: `Completion: ${fmtDt(crp.comp)}`,
            alert: crp.overload,
        },
        {
            label: 'Material Readiness',
            value: `${mrp.readinessPct.toFixed(1)}%`,
            sub: `${mrp.readyN} / ${mrp.lines.length} materials OK`,
            alert: mrp.readinessPct < 100,
        },
        {
            label: 'Total Man-Hours',
            value: fmtN(routing.lh),
            sub: `${fmtN(routing.mh)} machine-hrs`,
            alert: false,
        },
        {
            label: 'Capacity Status',
            value: crp.overload ? 'OVERLOAD' : 'OK',
            sub: crp.overload ? 'Exceeds monthly capacity' : 'Within monthly capacity',
            alert: crp.overload,
        },
    ];

    return (
        <div className={styles.container}>
            {/* Overload alert banner */}
            {crp.overload && (
                <div role="alert" className={styles.alert}>
                    <span className={styles.icon}>⚠</span>
                    <div className={styles.content}>
                        <strong>Capacity Overload Detected</strong>
                        <p>
                            Required {fmtN(crp.req)} man-hours exceeds monthly available{' '}
                            {fmtN(crp.monthAvail)} hours. Consider adding workers or extending shift hours.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary cards */}
            <div className={styles.grid}>
                {cards.map(card => (
                    <div key={card.label} data-alert={card.alert} className={styles.card}>
                        <div className={styles.label}>{card.label}</div>
                        <div className={styles.value}>{card.value}</div>
                        <div className={styles.sub}>{card.sub}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}