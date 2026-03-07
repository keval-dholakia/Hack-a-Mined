// src/app/dashboard/simulation/page.tsx
// Production Simulation & Forecasting — Module 13
// Route: /dashboard/simulation
// Orchestrates all simulation sub-components and holds all state.
// UI styling is intentionally minimal — to be handled separately.

"use client";

import { useState, useRef } from "react";
import { runSimulation } from "@/lib/simulationEngine";
import type { SimResult } from "@/types/simulation";
import type { MPSRow } from "@/types/simulation";

import SimInputPanel from "@/components/modules/simulation/SimInputPanel";
import SimSummaryBar from "@/components/modules/simulation/SimSummaryBar";
import SimResultTabs from "@/components/modules/simulation/SimResultTabs";
import styles from "./page.module.scss";
import { usePermission } from "@/hooks/usePermission";
import { MODULES, PAGES } from "@/constants/permissions";

const DEFAULT_MPS: MPSRow[] = [
  { pid: "ALTO", qty: 20 },
  { pid: "SWIFT", qty: 30 },
  { pid: "BALENO", qty: 25 },
];

export default function SimulationPage() {
  const { allowed, loading } = usePermission(
    MODULES.FORECASTING,
    PAGES.FORECASTING.SIMULATION,
    "can_view",
  );

  // ── Input state ──────────────────────────────────────────
  const [mps, setMps] = useState<MPSRow[]>(DEFAULT_MPS);
  const [shift, setShift] = useState<number>(10);
  const [workers, setWorkers] = useState<number>(50);
  const [start, setStart] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [laborRate, setLaborRate] = useState<number>(550);
  const [energyRate, setEnergyRate] = useState<number>(9);

  // ── Output state ─────────────────────────────────────────
  const [result, setResult] = useState<SimResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("MRP");
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Handlers ─────────────────────────────────────────────

  const handleRun = () => {
    const validRows = mps.filter((r) => r.pid && r.qty > 0);
    if (validRows.length === 0) return;

    const res = runSimulation({
      mps,
      workers,
      shift,
      start,
      laborRate,
      energyRate,
    });
    setResult(res);
    setActiveTab("MRP");

    // Scroll to results after render
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleReset = () => setResult(null);

  // MPS row operations
  const addRow = () => setMps((prev) => [...prev, { pid: "", qty: 0 }]);
  const removeRow = (i: number) =>
    setMps((prev) => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof MPSRow, val: string | number) =>
    setMps((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    );

  // CSV upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const newRows: MPSRow[] = [];
      let startIndex = 0;

      // Skip header row if second column is not a number
      const firstCols = lines[0]?.split(",").map((c) => c.trim());
      if (firstCols && isNaN(Number(firstCols[1]))) startIndex = 1;

      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i]
          .split(",")
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 2) {
          const pid = cols[0];
          const qty = Number(cols[1]);
          if (!isNaN(qty) && qty > 0) newRows.push({ pid, qty });
        }
      }

      if (newRows.length > 0) {
        setMps((prev) => [
          ...prev.filter((r) => r.pid || r.qty > 0),
          ...newRows,
        ]);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  // ── Render ───────────────────────────────────────────────

  if (loading) return <div className={styles.page}>Loading permissions...</div>;
  if (!allowed)
    return (
      <div className={styles.page}>
        Access Denied. You do not have permission to view this module.
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            Production <span>Simulation</span> &amp; Forecasting
          </h1>
          <p className={styles.subtitle}>
            MPS → BOM Explosion → Capacity Planning → Cost Estimation
          </p>
        </div>
        {result && (
          <button className={styles.resetBtn} onClick={handleReset}>
            ↺ Reset
          </button>
        )}
      </div>

      {/* Input Section */}
      <SimInputPanel
        mps={mps}
        shift={shift}
        workers={workers}
        start={start}
        laborRate={laborRate}
        energyRate={energyRate}
        fileInputRef={fileInputRef}
        onAddRow={addRow}
        onRemoveRow={removeRow}
        onUpdateRow={updateRow}
        onShiftChange={setShift}
        onWorkersChange={setWorkers}
        onStartChange={setStart}
        onLaborRateChange={setLaborRate}
        onEnergyRateChange={setEnergyRate}
        onFileUpload={handleFileUpload}
        onRun={handleRun}
      />

      {/* Results Section — only rendered after simulation runs */}
      {result && (
        <div ref={resultsRef}>
          <SimSummaryBar result={result} />
          <SimResultTabs
            result={result}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            workers={workers}
            shift={shift}
            start={start}
            laborRate={laborRate}
            energyRate={energyRate}
            mpsArr={mps}
          />
        </div>
      )}
    </div>
  );
}
