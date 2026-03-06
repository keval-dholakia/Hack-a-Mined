// src/lib/simulationEngine.ts
// Pure calculation engine for Production Simulation & Forecasting (Module 13).
// No React dependencies — can be unit tested independently.
// Logic: MPS → BOM Explosion (MRP) → Routing Explosion (CRP) → Cost Estimation

import { BOM, ROUTING, MATERIALS, MACHINES } from './simulationData';

// ─── Result Types ─────────────────────────────────────────

export interface MRPLine {
    mid: string;
    name: string;
    unit: string;
    req: number;       // total required qty
    avail: number;     // current stock
    short: number;     // shortfall (0 if sufficient)
    price: number;     // unit purchase price
    cost: number;      // req * price
    ready: boolean;    // avail >= req
    covPct: number;    // coverage percentage (capped at 100)
}

export interface MRPResult {
    lines: MRPLine[];
    totalCost: number;
    readinessPct: number;  // % of materials that are fully available
    readyN: number;        // count of ready materials
}

export interface RoutingResult {
    lh: number;                    // total labor hours across all products
    mh: number;                    // total machine hours across all products
    mhm: Record<string, number>;   // machine-hours broken down per machine id
}

export interface CRPResult {
    req: number;          // required labor hours
    days: number;         // exact days required (decimal)
    full: number;         // ceiling days (whole days)
    comp: Date;           // estimated completion date
    monthEnd: Date;       // last day of the planning month
    monthAvail: number;   // available labor hours remaining in the month
    overload: boolean;    // true if req > monthAvail
}

export interface CostResult {
    lc: number;     // labor cost
    ec: number;     // electricity/overhead cost
    mc: number;     // material cost
    total: number;  // lc + ec + mc
    kwh: number;    // total kilowatt-hours consumed
}

export interface SimResult {
    mrp: MRPResult;
    crp: CRPResult;
    routing: RoutingResult;
    cost: CostResult;
    mps: Record<string, number>;  // the input MPS map for reference
}

// ─── Step 1: BOM Explosion → Material Requirements ────────
// For each finished good in MPS, multiply BOM qty-per-unit by target qty.
// Aggregate across all products to get total raw material requirements.

export function explodeBOM(mps: Record<string, number>): Record<string, number> {
    const req: Record<string, number> = {};
    for (const [pid, qty] of Object.entries(mps)) {
        BOM.filter(b => b.pid === pid).forEach(b => {
            req[b.mid] = (req[b.mid] || 0) + qty * b.qpu;
        });
    }
    return req;
}

// ─── Step 2: Routing Explosion → Hours Required ───────────
// For each finished good, sum up labor minutes and machine minutes
// across all routing steps, scaled by target quantity.

export function explodeRouting(mps: Record<string, number>): RoutingResult {
    let lh = 0, mh = 0;
    const mhm: Record<string, number> = {};
    for (const [pid, qty] of Object.entries(mps)) {
        ROUTING.filter(r => r.pid === pid).forEach(r => {
            lh += (qty * r.lm) / 60;   // convert minutes → hours
            mh += (qty * r.mm) / 60;
            mhm[r.mach] = (mhm[r.mach] || 0) + (qty * r.mm) / 60;
        });
    }
    return { lh, mh, mhm };
}

// ─── Step 3: MRP Calculation → Stock vs Requirement ──────
// Compare required quantities against current stock.
// Flags shortages and calculates coverage percentage.

export function calcMRP(req: Record<string, number>): MRPResult {
    const matMap = Object.fromEntries(MATERIALS.map(m => [m.mid, m]));
    const lines: MRPLine[] = [];

    for (const [mid, rq] of Object.entries(req)) {
        const m = matMap[mid];
        if (!m) continue;

        const short = Math.max(0, rq - m.stock);
        const ready = short <= 0;
        const covPct = rq > 0 ? Math.min(100, (m.stock / rq) * 100) : 100;

        lines.push({
            mid,
            name: m.name,
            unit: m.unit,
            req: rq,
            avail: m.stock,
            short,
            price: m.price,
            cost: rq * m.price,
            ready,
            covPct,
        });
    }

    const readyN = lines.filter(l => l.ready).length;

    return {
        lines,
        totalCost: lines.reduce((s, l) => s + l.cost, 0),
        readinessPct: lines.length ? (100 * readyN) / lines.length : 100,
        readyN,
    };
}

// ─── Step 4: CRP Calculation → Capacity & Timeline ───────
// Determines if target can be met within the month.
// Formula: Days Required = Total Labor Hours / (Workers × Shift Hours)

export function calcCRP(
    routing: RoutingResult,
    workers: number,
    shift: number,
    startDate: Date
): CRPResult {
    const daily = workers * shift;           // labor hours available per day
    const req = routing.lh;                  // total labor hours required
    const days = req > 0 ? req / daily : 0;
    const full = Math.ceil(days);

    // Estimated completion date
    const comp = new Date(startDate);
    comp.setDate(comp.getDate() + full - 1);

    // Remaining capacity in the planning month
    const y = startDate.getFullYear();
    const mo = startDate.getMonth();
    const lastD = new Date(y, mo + 1, 0).getDate();
    const monthEnd = new Date(y, mo, lastD);
    const remDays = Math.floor((monthEnd.getTime() - startDate.getTime()) / 86400000) + 1;
    const monthAvail = remDays * daily;

    return {
        req,
        days,
        full,
        comp,
        monthEnd,
        monthAvail,
        overload: req > monthAvail,
    };
}

// ─── Step 5: Cost Estimation → Provisional Costing ───────
// Labor Cost    = Total Labor Hours × Labor Rate
// Electricity   = Σ (Machine Hours per machine × kW per machine) × Energy Rate
// Material Cost = Σ (Required Qty × Latest Purchase Price)  [already in MRP]

export function calcCost(
    mrp: MRPResult,
    routing: RoutingResult,
    laborRate: number,
    energyRate: number
): CostResult {
    const lc = routing.lh * laborRate;

    const machMap = Object.fromEntries(MACHINES.map(m => [m.mid, m]));
    let kwh = 0;
    for (const [mid, mh] of Object.entries(routing.mhm)) {
        const m = machMap[mid];
        if (m) kwh += mh * m.kw;
    }
    const ec = kwh * energyRate;
    const mc = mrp.totalCost;

    return { lc, ec, mc, total: lc + ec + mc, kwh };
}

// ─── Master Run Function ──────────────────────────────────
// Single entry point — takes UI inputs, returns complete SimResult.
// Called by the Simulation page component on "Run Simulation" click.

export function runSimulation(params: {
    mps: Array<{ pid: string; qty: number }>;
    workers: number;
    shift: number;
    start: string;       // ISO date string "YYYY-MM-DD"
    laborRate: number;
    energyRate: number;
}): SimResult {
    // Build MPS map, filter empty rows
    const mpsMap: Record<string, number> = {};
    params.mps.forEach(r => {
        if (r.pid && Number(r.qty) > 0) mpsMap[r.pid] = Number(r.qty);
    });

    const startDate = new Date(params.start);

    // Run all 5 steps in sequence
    const req = explodeBOM(mpsMap);
    const routing = explodeRouting(mpsMap);
    const mrp = calcMRP(req);
    const crp = calcCRP(routing, params.workers, params.shift, startDate);
    const cost = calcCost(mrp, routing, params.laborRate, params.energyRate);

    return { mrp, crp, routing, cost, mps: mpsMap };
}

// ─── Formatters ───────────────────────────────────────────
// Indian number/currency formatting used across simulation UI components.

// Full currency: ₹1,23,456
export const fmtCur = (v: number): string =>
    `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// Lakhs format: ₹1.23L
export const fmtL = (v: number): string =>
    `₹${(v / 100000).toFixed(2)}L`;

// Indian number with 1 decimal: 1,23,456.5
export const fmtN = (v: number): string =>
    Number(v).toLocaleString('en-IN', { maximumFractionDigits: 1 });

// Date: 06 Mar 2026
export const fmtDt = (d: Date): string =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });