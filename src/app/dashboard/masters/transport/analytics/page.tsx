import { getTransportMasters } from '@/app/actions/transport'
import TransportAnalytics from '@/components/modules/masters/TransportAnalytics'

export const metadata = { title: 'Transport Analytics | TechMicra ERP' }

export default async function TransportAnalyticsPage() {
    const transporters = await getTransportMasters()
    return <TransportAnalytics transporters={transporters as any} />
}
