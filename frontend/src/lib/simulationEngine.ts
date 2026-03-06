import { BOM, ROUTING, MATERIALS, MACHINES } from './simulationData';

// ─── Types ────────────────────────────────────────────────

export interface MRPLine {
    mid: string; name: string; unit: string;
    req: number; avail: number; short: number;
    price: number; cost: number; ready: boolean;
    covPct: number;
}

export interface MRPResult {
    lines: MRPLine[];
    totalCost: number;
    readinessPct: number;
    readyN: number;
}

export interface RoutingResult {
    lh: number;   // total labor hours
    mh: number;   // total machine hours
    mhm: Record<string, number>; // machine-hours per machine
}

export interface CRPResult {
    req: number;       // required labor hours
    days: number;      // exact days
    full: number;      // ceiling days
    comp: Date;        // estimated completion date
    monthEnd: Date;
    monthAvail: number;
    overload: boolean;
}

export interface CostResult {
    lc: number;   // labor cost
    ec: number;   // electricity cost
    mc: number;   // material cost
    total: number;
    kwh: number;
}

export interface SimResult {
    mrp: MRPResult;
    crp: CRPResult;
    routing: RoutingResult;
    cost: CostResult;
    mps: Record<string, number>;
}

// ─── Engine Functions ─────────────────────────────────────

export function explodeBOM(mps: Record<string, number>): Record<string, number> {
    const req: Record<string, number> = {};
    for (const [pid, qty] of Object.entries(mps)) {
        BOM.filter(b => b.pid === pid).forEach(b => {
            req[b.mid] = (req[b.mid] || 0) + qty * b.qpu;
        });
    }
    return req;
}

export function explodeRouting(mps: Record<string, number>): RoutingResult {
    let lh = 0, mh = 0;
    const mhm: Record<string, number> = {};
    for (const [pid, qty] of Object.entries(mps)) {
        ROUTING.filter(r => r.pid === pid).forEach(r => {
            lh += (qty * r.lm) / 60;
            mh += (qty * r.mm) / 60;
            mhm[r.mach] = (mhm[r.mach] || 0) + (qty * r.mm) / 60;
        });
    }
    return { lh, mh, mhm };
}

export function calcMRP(req: Record<string, number>): MRPResult {
    const matMap = Object.fromEntries(MATERIALS.map(m => [m.mid, m]));
    const lines: MRPLine[] = [];
    for (const [mid, rq] of Object.entries(req)) {
        const m = matMap[mid];
        if (!m) continue;
        const short = Math.max(0, rq - m.stock);
        const ready = short <= 0;
        const covPct = rq > 0 ? Math.min(100, (m.stock / rq) * 100) : 100;
        lines.push({ mid, name: m.name, unit: m.unit, req: rq, avail: m.stock, short, price: m.price, cost: rq * m.price, ready, covPct });
    }
    const readyN = lines.filter(l => l.ready).length;
    return {
        lines,
        totalCost: lines.reduce((s, l) => s + l.cost, 0),
        readinessPct: lines.length ? (100 * readyN) / lines.length : 100,
        readyN,
    };
}

export function calcCRP(routing: RoutingResult, workers: number, shift: number, startDate: Date): CRPResult {
    const daily = workers * shift;
    const req = routing.lh;
    const days = req > 0 ? req / daily : 0;
    const full = Math.ceil(days);
    const comp = new Date(startDate);
    comp.setDate(comp.getDate() + full - 1);
    const y = startDate.getFullYear(), mo = startDate.getMonth();
    const lastD = new Date(y, mo + 1, 0).getDate();
    const monthEnd = new Date(y, mo, lastD);
    const remDays = Math.floor((monthEnd.getTime() - startDate.getTime()) / 86400000) + 1;
    const monthAvail = remDays * daily;
    return { req, days, full, comp, monthEnd, monthAvail, overload: req > monthAvail };
}

export function calcCost(
    mrp: MRPResult,
    routing: RoutingResult,
    laborRate: number,
    energyRate: number,
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

export function runSimulation(params: {
    mps: Array<{ pid: string; qty: number }>;
    workers: number;
    shift: number;
    start: string;
    laborRate: number;
    energyRate: number;
}): SimResult {
    const mpsMap: Record<string, number> = {};
    params.mps.forEach(r => { if (r.pid && Number(r.qty) > 0) mpsMap[r.pid] = Number(r.qty); });

    const startDate = new Date(params.start);
    const req = explodeBOM(mpsMap);
    const routing = explodeRouting(mpsMap);
    const mrp = calcMRP(req);
    const crp = calcCRP(routing, params.workers, params.shift, startDate);
    const cost = calcCost(mrp, routing, params.laborRate, params.energyRate);
    return { mrp, crp, routing, cost, mps: mpsMap };
}

// ─── Formatters ───────────────────────────────────────────

export const fmtCur = (v: number) =>
    `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const fmtL = (v: number) =>
    `₹${(v / 100000).toFixed(2)}L`;

export const fmtN = (v: number) =>
    Number(v).toLocaleString('en-IN', { maximumFractionDigits: 1 });

export const fmtDt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
