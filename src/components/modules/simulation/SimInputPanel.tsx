// src/app/dashboard/simulation/_components/SimInputPanel.tsx
// Handles all user inputs: MPS grid, parameters, CSV upload, run button.
// Receives all state and handlers from the parent page via props.
// Prefixed with underscore (_components) = Next.js convention for
// co-located components that are NOT routes.

'use client';

import { useState, RefObject } from 'react';
import { PRODUCTS } from '@/lib/simulationData';
import type { MPSRow } from '@/types/simulation';
import styles from './SimInputPanel.module.scss';

interface SimInputPanelProps {
    mps: MPSRow[];
    shift: number;
    workers: number;
    start: string;
    laborRate: number;
    energyRate: number;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onAddRow: () => void;
    onRemoveRow: (i: number) => void;
    onUpdateRow: (i: number, field: keyof MPSRow, val: string | number) => void;
    onShiftChange: (v: number) => void;
    onWorkersChange: (v: number) => void;
    onStartChange: (v: string) => void;
    onLaborRateChange: (v: number) => void;
    onEnergyRateChange: (v: number) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRun: () => void;
}

export default function SimInputPanel({
    mps, shift, workers, start, laborRate, energyRate,
    fileInputRef,
    onAddRow, onRemoveRow, onUpdateRow,
    onShiftChange, onWorkersChange, onStartChange,
    onLaborRateChange, onEnergyRateChange,
    onFileUpload, onRun,
}: SimInputPanelProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const hasValidRows = mps.some(r => r.pid && r.qty > 0);

    return (
        <div className={styles.panel}>
            {/* ── MPS Grid ─────────────────────────────────────── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Master Production Schedule (MPS)</h2>

                <div className={styles.gridHeader}>
                    <span>Product ID</span>
                    <span>Target Qty</span>
                    <span></span>
                </div>

                {mps.map((row, i) => (
                    <div key={i} className={styles.gridRow}>
                        {/* Product ID — free text or select from known products */}
                        <input
                            type="text"
                            value={row.pid}
                            placeholder="e.g. ALTO"
                            list="product-options"
                            onChange={e => onUpdateRow(i, 'pid', e.target.value)}
                        />
                        {/* Datalist provides autocomplete from known products */}
                        <datalist id="product-options">
                            {PRODUCTS.map(p => (
                                <option key={p.product_id} value={p.product_id}>{p.name}</option>
                            ))}
                        </datalist>

                        <input
                            type="number"
                            value={row.qty}
                            min={0}
                            onChange={e => onUpdateRow(i, 'qty', Number(e.target.value))}
                        />

                        <button
                            className={styles.removeBtn}
                            onClick={() => onRemoveRow(i)}
                            disabled={mps.length === 1}
                            aria-label="Remove row"
                        >
                            ×
                        </button>
                    </div>
                ))}

                <div className={styles.actions}>
                    <button className={styles.btnSec} onClick={onAddRow}>+ Add Product</button>
                    <button className={styles.btnSec} onClick={() => fileInputRef.current?.click()}>
                        📂 Upload CSV
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={onFileUpload}
                    />
                </div>

                <p style={{ fontSize: 12, color: 'gray', marginTop: 8 }}>
                    CSV format: product_id, quantity (one per line, optional header row)
                </p>
            </section>

            {/* ── Parameters ───────────────────────────────────── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Parameters</h2>

                <div className={styles.paramsGrid}>
                    <div className={styles.field}>
                        <label htmlFor="shift-hours">Shift Hours / Day</label>
                        <input
                            id="shift-hours"
                            type="number"
                            value={shift}
                            min={1}
                            max={24}
                            onChange={e => onShiftChange(Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="workers">Number of Workers</label>
                        <input
                            id="workers"
                            type="number"
                            value={workers}
                            min={1}
                            onChange={e => onWorkersChange(Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="start-date">Planning Start Date</label>
                        <input
                            id="start-date"
                            type="date"
                            value={start}
                            onChange={e => onStartChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Advanced rates — collapsed by default */}
                <button className={styles.advToggle} onClick={() => setShowAdvanced(v => !v)}>
                    {showAdvanced ? '▾' : '▶'} Advanced Rates
                </button>

                {showAdvanced && (
                    <div className={styles.paramsGrid} style={{ marginTop: '0.5rem' }}>
                        <div className={styles.field}>
                            <label htmlFor="labor-rate">Labor Rate (₹/hr)</label>
                            <input
                                id="labor-rate"
                                type="number"
                                value={laborRate}
                                min={0}
                                onChange={e => onLaborRateChange(Number(e.target.value))}
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="energy-rate">Energy Rate (₹/kWh)</label>
                            <input
                                id="energy-rate"
                                type="number"
                                value={energyRate}
                                min={0}
                                onChange={e => onEnergyRateChange(Number(e.target.value))}
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* ── Run Button ───────────────────────────────────── */}
            <button
                className={styles.runBtn}
                onClick={onRun}
                disabled={!hasValidRows}
            >
                ▶ Run Simulation
            </button>
        </div>
    );
}