// ─── Navigation Config ────────────────────────────────────

export interface NavSubItem {
    label: string;
    href: string;
}

export interface NavItem {
    id: string;
    label: string;
    icon: string;
    href: string;
    sub?: NavSubItem[];
}

export interface NavGroup {
    group: string;
    items: NavItem[];
}

export const NAV: NavGroup[] = [
    {
        group: 'Operations',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: '⬡', href: '/dashboard' },
            {
                id: 'sales', label: 'Sales', icon: '◈', href: '/sales',
                sub: [
                    { label: 'Inquiry', href: '/sales?tab=Inquiries' },
                    { label: 'Quotation', href: '/sales?tab=Quotations' },
                    { label: 'Sale Order', href: '/sales?tab=Sale+Orders' },
                    { label: 'Invoice', href: '/sales?tab=Invoices' },
                    { label: 'Collections', href: '/sales?tab=Collections' },
                ],
            },
            {
                id: 'purchase', label: 'Purchase', icon: '◉', href: '/purchase',
                sub: [
                    { label: 'Indent', href: '/purchase?tab=Indent' },
                    { label: 'PO', href: '/purchase?tab=PO' },
                    { label: 'GRN', href: '/purchase?tab=GRN' },
                    { label: 'IQC', href: '/purchase?tab=IQC' },
                    { label: 'Bill Book', href: '/purchase?tab=Bill+Book' },
                ],
            },
            {
                id: 'production', label: 'Production', icon: '◫', href: '/production',
                sub: [
                    { label: 'BOM', href: '/production?tab=BOM' },
                    { label: 'Route Card', href: '/production?tab=Route+Card' },
                    { label: 'Material Issue', href: '/production?tab=Material+Issue' },
                    { label: 'Job Order', href: '/production?tab=Job+Order' },
                    { label: 'Reports', href: '/production?tab=Reports' },
                ],
            },
            {
                id: 'logistics', label: 'Logistics', icon: '◧', href: '/logistics',
                sub: [
                    { label: 'Transport Master', href: '/logistics?tab=Transport+Master' },
                    { label: 'Orders', href: '/logistics?tab=Orders' },
                    { label: 'Challan Out', href: '/logistics?tab=Challan+Out' },
                    { label: 'Freight Bills', href: '/logistics?tab=Freight+Bills' },
                ],
            },
        ],
    },
    {
        group: 'Management',
        items: [
            {
                id: 'quality', label: 'Quality', icon: '◎', href: '/quality',
                sub: [
                    { label: 'IQC', href: '/quality?tab=IQC' },
                    { label: 'PQC', href: '/quality?tab=PQC' },
                    { label: 'PDI', href: '/quality?tab=PDI' },
                    { label: 'QRD', href: '/quality?tab=QRD' },
                ],
            },
            {
                id: 'stores', label: 'Stores', icon: '▣', href: '/stores',
                sub: [
                    { label: 'Warehouse', href: '/stores?tab=Warehouse' },
                    { label: 'Stock Transfer', href: '/stores?tab=Stock+Transfer' },
                    { label: 'SRV', href: '/stores?tab=SRV' },
                ],
            },
            {
                id: 'maintenance', label: 'Maintenance', icon: '◌', href: '/maintenance',
                sub: [
                    { label: 'Tool Master', href: '/maintenance?tab=Tool+Master' },
                    { label: 'Calibration', href: '/maintenance?tab=Calibration' },
                    { label: 'Repair Logs', href: '/maintenance?tab=Repair+Logs' },
                ],
            },
            {
                id: 'assets', label: 'Assets', icon: '◆', href: '/assets',
                sub: [
                    { label: 'Asset Master', href: '/assets?tab=Asset+Master' },
                    { label: 'Allocation', href: '/assets?tab=Allocation' },
                    { label: 'Depreciation', href: '/assets?tab=Depreciation' },
                ],
            },
        ],
    },
    {
        group: 'Finance & HR',
        items: [
            {
                id: 'finance', label: 'Finance', icon: '◑', href: '/finance',
                sub: [
                    { label: 'Vouchers', href: '/finance?tab=Vouchers' },
                    { label: 'Bank Recon', href: '/finance?tab=Bank+Recon' },
                    { label: 'Credit Cards', href: '/finance?tab=Credit+Cards' },
                ],
            },
            {
                id: 'hr', label: 'HR', icon: '◐', href: '/hr',
                sub: [
                    { label: 'Employees', href: '/hr?tab=Employees' },
                    { label: 'Salary', href: '/hr?tab=Salary' },
                    { label: 'Advances', href: '/hr?tab=Advances' },
                ],
            },
            {
                id: 'contractors', label: 'Contractors', icon: '◒', href: '/contractors',
                sub: [
                    { label: 'Workers', href: '/contractors?tab=Workers' },
                    { label: 'Salary Sheet', href: '/contractors?tab=Salary+Sheet' },
                    { label: 'Payments', href: '/contractors?tab=Payments' },
                ],
            },
            {
                id: 'statutory', label: 'Statutory', icon: '◓', href: '/statutory',
                sub: [
                    { label: 'GST', href: '/statutory?tab=GST' },
                    { label: 'TDS/TCS', href: '/statutory?tab=TDS-TCS' },
                    { label: 'Balance Sheet', href: '/statutory?tab=Balance+Sheet' },
                ],
            },
        ],
    },
    {
        group: 'Intelligence',
        items: [
            { id: 'simulation', label: 'Simulation', icon: '◈', href: '/simulation' },
        ],
    },
];

export const BREADCRUMBS: Record<string, string[]> = {
    dashboard: ['Dashboard'],
    sales: ['Sales', 'Management'],
    purchase: ['Purchase', 'Management'],
    production: ['Production', 'Management'],
    finance: ['Finance', 'Management'],
    hr: ['HR', 'Management'],
    quality: ['Quality', 'Management'],
    simulation: ['Intelligence', 'Simulation'],
    logistics: ['Logistics', 'Management'],
    stores: ['Stores', 'Warehouse'],
    maintenance: ['Maintenance', 'Management'],
    assets: ['Assets', 'Management'],
    statutory: ['Statutory', 'Compliance'],
    contractors: ['Contractors', 'Management'],
};
