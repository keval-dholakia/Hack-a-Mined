import Finance from '@/components/modules/Finance';

const TAB_MAP: Record<string, string> = {
    Dashboard: 'Dashboard',
    Vouchers: 'Voucher Journal',
    'Voucher Journal': 'Voucher Journal',
    'Payment & Receipt': 'Payment & Receipt',
    Contra: 'Contra',
    'GST Entries': 'GST Entries',
    'Bank Recon': 'Bank Recon',
    'Credit Cards': 'Credit Cards',
};

interface FinancePageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
    const { tab } = await searchParams;
    const initialTab = tab && TAB_MAP[tab] ? TAB_MAP[tab] : 'Dashboard';
    return <Finance key={initialTab} initialTab={initialTab} />;
}
