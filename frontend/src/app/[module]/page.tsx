import GenericModule from '@/components/modules/GenericModule';

const TITLES: Record<string, string> = {
    finance: 'Finance Management',
    hr: 'HR Management',
    quality: 'Quality Management',
    logistics: 'Logistics Management',
    stores: 'Stores & Warehouse',
    maintenance: 'Maintenance Management',
    assets: 'Asset Management',
    statutory: 'Statutory & Compliance',
    contractors: 'Contractor Management',
};

const DESCS: Record<string, string> = {
    finance: 'Vouchers, reconciliation & financial statements',
    hr: 'Employee records, payroll & advances',
    quality: 'IQC → PQC → PDI — end-to-end quality control',
    logistics: 'Transport orders, challan and freight bills',
    stores: 'Stock movement, transfers and receipts',
    maintenance: 'Tool master, calibration and repair logs',
    assets: 'Asset register, allocation and depreciation',
    statutory: 'GST, TDS/TCS and balance sheet',
    contractors: 'Contract labor, attendance and payouts',
};

interface PageProps {
    params: Promise<{ module: string }>;
}

export default async function ModulePage({ params }: PageProps) {
    const { module } = await params;
    const title = TITLES[module] || module;
    const description = DESCS[module];
    return <GenericModule title={title} description={description} />;
}

export function generateStaticParams() {
    return Object.keys(TITLES).map(module => ({ module }));
}
