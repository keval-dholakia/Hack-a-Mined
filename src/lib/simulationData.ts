// src/lib/simulationData.ts
// Static master data for the Production Simulation module.
// In production, these will be fetched from Supabase (products, bom_items, bom_headers tables).
// For now, this serves as the seed/mock data matching the DB schema.

export interface SimProduct {
    product_id: string;
    name: string;
}

export interface SimMaterial {
    mid: string;
    name: string;
    unit: string;
    stock: number;
    price: number; // latest purchase price (₹)
}

export interface SimMachine {
    mid: string;
    name: string;
    kw: number; // power consumption kWh per hour
}

export interface SimBOMItem {
    pid: string;   // finished good product_id
    mid: string;   // raw material id
    qpu: number;   // quantity per unit
}

export interface SimRoutingStep {
    pid: string;   // finished good product_id
    op: string;    // operation name e.g. "Cutting"
    mach: string;  // machine mid
    lm: number;    // labor minutes per unit
    mm: number;    // machine minutes per unit
}

// ── Products (Finished Goods) ─────────────────────────────
export const PRODUCTS: SimProduct[] = [
    { product_id: 'ALTO', name: 'Alto Component Set' },
    { product_id: 'SWIFT', name: 'Swift Component Set' },
    { product_id: 'BALENO', name: 'Baleno Component Set' },
];

// ── Raw Materials ─────────────────────────────────────────
export const MATERIALS: SimMaterial[] = [
    { mid: 'STEEL_SHT', name: 'Steel Sheet', unit: 'kg', stock: 8000, price: 85 },
    { mid: 'STEEL_ROD', name: 'Steel Rod', unit: 'kg', stock: 3500, price: 92 },
    { mid: 'RUBBER_GSK', name: 'Rubber Gasket', unit: 'pcs', stock: 5000, price: 12 },
    { mid: 'ALUM_CAST', name: 'Aluminium Casting', unit: 'kg', stock: 1200, price: 210 },
    { mid: 'COPPER_WIR', name: 'Copper Wire', unit: 'mtr', stock: 9000, price: 55 },
    { mid: 'PAINT_EPX', name: 'Epoxy Paint', unit: 'ltr', stock: 400, price: 320 },
    { mid: 'BOLT_M10', name: 'Bolt M10', unit: 'pcs', stock: 15000, price: 3.5 },
    { mid: 'BEAR_6205', name: 'Bearing 6205', unit: 'pcs', stock: 800, price: 185 },
];

// ── Machines ──────────────────────────────────────────────
export const MACHINES: SimMachine[] = [
    { mid: 'CNC_01', name: 'CNC Lathe #1', kw: 7.5 },
    { mid: 'PRESS_01', name: 'Hydraulic Press #1', kw: 11 },
    { mid: 'WELD_01', name: 'MIG Welder #1', kw: 5 },
    { mid: 'PAINT_01', name: 'Paint Booth #1', kw: 3.5 },
];

// ── Bill of Materials ─────────────────────────────────────
// qpu = quantity of raw material required per 1 unit of finished good
export const BOM: SimBOMItem[] = [
    // Alto
    { pid: 'ALTO', mid: 'STEEL_SHT', qpu: 12 },
    { pid: 'ALTO', mid: 'RUBBER_GSK', qpu: 8 },
    { pid: 'ALTO', mid: 'BOLT_M10', qpu: 24 },
    { pid: 'ALTO', mid: 'PAINT_EPX', qpu: 0.8 },
    { pid: 'ALTO', mid: 'BEAR_6205', qpu: 4 },

    // Swift
    { pid: 'SWIFT', mid: 'STEEL_SHT', qpu: 15 },
    { pid: 'SWIFT', mid: 'STEEL_ROD', qpu: 6 },
    { pid: 'SWIFT', mid: 'ALUM_CAST', qpu: 3.5 },
    { pid: 'SWIFT', mid: 'RUBBER_GSK', qpu: 10 },
    { pid: 'SWIFT', mid: 'BOLT_M10', qpu: 30 },
    { pid: 'SWIFT', mid: 'COPPER_WIR', qpu: 12 },
    { pid: 'SWIFT', mid: 'PAINT_EPX', qpu: 1.2 },

    // Baleno
    { pid: 'BALENO', mid: 'STEEL_SHT', qpu: 18 },
    { pid: 'BALENO', mid: 'STEEL_ROD', qpu: 8 },
    { pid: 'BALENO', mid: 'ALUM_CAST', qpu: 5 },
    { pid: 'BALENO', mid: 'COPPER_WIR', qpu: 18 },
    { pid: 'BALENO', mid: 'RUBBER_GSK', qpu: 12 },
    { pid: 'BALENO', mid: 'BOLT_M10', qpu: 36 },
    { pid: 'BALENO', mid: 'BEAR_6205', qpu: 6 },
    { pid: 'BALENO', mid: 'PAINT_EPX', qpu: 1.5 },
];

// ── Routing Steps ─────────────────────────────────────────
// lm = labor minutes per unit, mm = machine minutes per unit
export const ROUTING: SimRoutingStep[] = [
    // Alto
    { pid: 'ALTO', op: 'Cutting', mach: 'CNC_01', lm: 18, mm: 20 },
    { pid: 'ALTO', op: 'Pressing', mach: 'PRESS_01', lm: 12, mm: 15 },
    { pid: 'ALTO', op: 'Welding', mach: 'WELD_01', lm: 20, mm: 18 },
    { pid: 'ALTO', op: 'Painting', mach: 'PAINT_01', lm: 10, mm: 12 },

    // Swift
    { pid: 'SWIFT', op: 'Cutting', mach: 'CNC_01', lm: 22, mm: 25 },
    { pid: 'SWIFT', op: 'Pressing', mach: 'PRESS_01', lm: 15, mm: 18 },
    { pid: 'SWIFT', op: 'Welding', mach: 'WELD_01', lm: 25, mm: 22 },
    { pid: 'SWIFT', op: 'Painting', mach: 'PAINT_01', lm: 12, mm: 14 },

    // Baleno
    { pid: 'BALENO', op: 'Cutting', mach: 'CNC_01', lm: 28, mm: 30 },
    { pid: 'BALENO', op: 'Pressing', mach: 'PRESS_01', lm: 18, mm: 22 },
    { pid: 'BALENO', op: 'Welding', mach: 'WELD_01', lm: 30, mm: 28 },
    { pid: 'BALENO', op: 'Painting', mach: 'PAINT_01', lm: 15, mm: 16 },
];