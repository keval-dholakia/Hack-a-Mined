import Statutory from '@/components/modules/Statutory';

const TAB_MAP: Record<string, string> = {
    Dashboard: 'Dashboard',
    GST: 'GST',
    'TDS-TCS': 'TDS/TCS',
    'TDS/TCS': 'TDS/TCS',
    'Balance Sheet': 'Balance Sheet',
};

interface StatutoryPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function StatutoryPage({ searchParams }: StatutoryPageProps) {
    const { tab } = await searchParams;
    const initialTab = tab && TAB_MAP[tab] ? TAB_MAP[tab] : 'Dashboard';
    return <Statutory key={initialTab} initialTab={initialTab} />;
}
