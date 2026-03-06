// ─── Simulation Reference Data ────────────────────────────

export interface Product { product_id: string; name: string; }
export interface BOMLine { pid: string; mid: string; qpu: number; }
export interface RoutingLine { pid: string; op: string; lm: number; mm: number; mach: string; }
export interface Material { mid: string; name: string; unit: string; stock: number; price: number; }
export interface Machine { mid: string; name: string; kw: number; }

export const PRODUCTS: Product[] = [
    { product_id: 'ALTO', name: 'Alto' },
    { product_id: 'SWIFT', name: 'Swift' },
    { product_id: 'BALENO', name: 'Baleno' },
];

export const BOM: BOMLine[] = [
    { pid: 'ALTO', mid: 'STEEL_KG', qpu: 480 }, { pid: 'ALTO', mid: 'RUBBER_KG', qpu: 52 },
    { pid: 'ALTO', mid: 'GLASS_SQM', qpu: 12 }, { pid: 'ALTO', mid: 'PLASTIC_KG', qpu: 38 },
    { pid: 'ALTO', mid: 'ALUMINUM_KG', qpu: 45 }, { pid: 'ALTO', mid: 'ELECTRONICS_SET', qpu: 1 },
    { pid: 'ALTO', mid: 'FABRIC_M', qpu: 18 },
    { pid: 'SWIFT', mid: 'STEEL_KG', qpu: 620 }, { pid: 'SWIFT', mid: 'RUBBER_KG', qpu: 64 },
    { pid: 'SWIFT', mid: 'GLASS_SQM', qpu: 14 }, { pid: 'SWIFT', mid: 'PLASTIC_KG', qpu: 45 },
    { pid: 'SWIFT', mid: 'ALUMINUM_KG', qpu: 60 }, { pid: 'SWIFT', mid: 'ELECTRONICS_SET', qpu: 1 },
    { pid: 'SWIFT', mid: 'FABRIC_M', qpu: 22 },
    { pid: 'BALENO', mid: 'STEEL_KG', qpu: 710 }, { pid: 'BALENO', mid: 'RUBBER_KG', qpu: 70 },
    { pid: 'BALENO', mid: 'GLASS_SQM', qpu: 16 }, { pid: 'BALENO', mid: 'PLASTIC_KG', qpu: 52 },
    { pid: 'BALENO', mid: 'ALUMINUM_KG', qpu: 75 }, { pid: 'BALENO', mid: 'ELECTRONICS_SET', qpu: 1 },
    { pid: 'BALENO', mid: 'FABRIC_M', qpu: 24 },
];

export const ROUTING: RoutingLine[] = [
    { pid: 'ALTO', op: 'Body Shop', lm: 280, mm: 190, mach: 'PRESS_01' },
    { pid: 'ALTO', op: 'Paint Shop', lm: 140, mm: 210, mach: 'PAINT_01' },
    { pid: 'ALTO', op: 'Assembly', lm: 220, mm: 120, mach: 'ASSY_01' },
    { pid: 'ALTO', op: 'Quality', lm: 60, mm: 30, mach: 'QC_01' },
    { pid: 'SWIFT', op: 'Body Shop', lm: 350, mm: 230, mach: 'PRESS_01' },
    { pid: 'SWIFT', op: 'Paint Shop', lm: 170, mm: 250, mach: 'PAINT_01' },
    { pid: 'SWIFT', op: 'Assembly', lm: 260, mm: 140, mach: 'ASSY_01' },
    { pid: 'SWIFT', op: 'Quality', lm: 80, mm: 40, mach: 'QC_01' },
    { pid: 'BALENO', op: 'Body Shop', lm: 390, mm: 260, mach: 'PRESS_01' },
    { pid: 'BALENO', op: 'Paint Shop', lm: 180, mm: 290, mach: 'PAINT_01' },
    { pid: 'BALENO', op: 'Assembly', lm: 280, mm: 160, mach: 'ASSY_01' },
    { pid: 'BALENO', op: 'Quality', lm: 80, mm: 50, mach: 'QC_01' },
];

export const MATERIALS: Material[] = [
    { mid: 'STEEL_KG', name: 'Steel', unit: 'kg', stock: 43000, price: 72 },
    { mid: 'RUBBER_KG', name: 'Rubber', unit: 'kg', stock: 5000, price: 120 },
    { mid: 'GLASS_SQM', name: 'Glass', unit: 'sqm', stock: 900, price: 650 },
    { mid: 'PLASTIC_KG', name: 'Plastic', unit: 'kg', stock: 3200, price: 95 },
    { mid: 'ALUMINUM_KG', name: 'Aluminum', unit: 'kg', stock: 5000, price: 220 },
    { mid: 'ELECTRONICS_SET', name: 'Electronics', unit: 'set', stock: 90, price: 18000 },
    { mid: 'FABRIC_M', name: 'Fabric', unit: 'm', stock: 1400, price: 180 },
];

export const MACHINES: Machine[] = [
    { mid: 'PRESS_01', name: 'Press Line', kw: 85 },
    { mid: 'PAINT_01', name: 'Paint Booth', kw: 120 },
    { mid: 'ASSY_01', name: 'Assembly Conveyor', kw: 65 },
    { mid: 'QC_01', name: 'Quality Bench', kw: 25 },
];
