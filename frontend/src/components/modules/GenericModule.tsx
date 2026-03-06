import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';

interface GenericModuleProps {
    title: string;
    description?: string;
}

export default function GenericModule({ title, description }: GenericModuleProps) {
    return (
        <>
            <PageHeader title={title} description={description} />
            <Card>
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◉</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {title} module is ready for development
                    </div>
                </div>
            </Card>
        </>
    );
}
