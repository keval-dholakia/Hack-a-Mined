// src/app/dashboard/simulation/_components/tabs/CRPTab.tsx
// CRP tab: capacity gauge, hours breakdown, timeline, machine load.

import { fmtN, fmtDt } from '@/lib/simulationEngine';
import { MACHINES } from '@/lib/simulationData';
import type { SimResult } from '@/types/simulation';
import styles from './tabs.module.scss';

interface CRPTabProps {
    result: SimResult;
    workers: number;
    shift: number;
    start: string;
}

export default function CRPTab({ result, workers, shift, start }: CRPTabProps) {
    const { crp, routing } = result;
    const machMap = Object.fromEntries(MACHINES.map(m => [m.mid, m]));
    const loadPct = crp.monthAvail > 0
        ? Math.min(110, (crp.req / crp.monthAvail) * 100)
        : 0;

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>Capacity Requirements Planning</h3>

            {/* Capacity status */}
            <div className={styles.progressRow}>
                <div className={styles.label}>Capacity Load</div>
                <div className={styles.barWrap}>
                    <div
                        className={`${styles.barFill} ${crp.overload ? styles.overload : ''}`}
                        style={{ width: `${loadPct}%` }}
                    />
                </div>
                <div className={`${styles.value} ${crp.overload ? styles.statusErr : ''}`}>
                    {Math.round(loadPct)}%
                </div>
            </div>

            {crp.overload && (
                <div style={{ color: 'var(--amber)', fontSize: '0.85rem' }}>
                    ⚠ Exceeds monthly capacity
                </div>
            )}

            {/* Hours */}
            <div className={styles.kpiStrip}>
                <div className={styles.kpiCard}>
                    <span>Required Man-Hours</span>
                    <strong className={crp.overload ? styles.statusErr : ''}>{fmtN(crp.req)}</strong>
                </div>
                <div className={styles.kpiCard}>
                    <span>Monthly Available</span>
                    <strong>{fmtN(crp.monthAvail)}</strong>
                </div>
                <div className={styles.kpiCard}>
                    <span>Total Machine-Hours</span>
                    <strong>{fmtN(routing.mh)}</strong>
                </div>
            </div>

            {/* Timeline */}
            <h4 className={styles.subHeading}>Timeline & Parameters</h4>
            <div className={styles.list}>
                <div className={styles.listItem}><span>Days Required</span><strong>{Math.ceil(crp.days)}</strong></div>
                <div className={styles.listItem}><span>Start Date</span><strong>{fmtDt(new Date(start))}</strong></div>
                <div className={styles.listItem}><span>Est. Completion</span><strong>{fmtDt(crp.comp)}</strong></div>
                <div className={styles.listItem}><span>Month End</span><strong>{fmtDt(crp.monthEnd)}</strong></div>
                <div className={styles.listItem}><span>Workers × Shift</span><strong>{workers} × {shift}h</strong></div>
                <div className={styles.listItem}><span>Daily Capacity</span><strong>{fmtN(workers * shift)} hrs/day</strong></div>
            </div>

            {/* Machine hours */}
            <div>
                <h4 className={styles.subHeading}>Machine Hours by Station</h4>
                <div className={styles.list} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {Object.entries(routing.mhm).map(([mid, mh]) => (
                        <div key={mid} className={styles.listItem} style={{ background: 'transparent' }}>
                            <span>{machMap[mid]?.name ?? mid} <small className={styles.statusMuted}>({mid})</small></span>
                            <strong>{fmtN(mh)} hrs</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}