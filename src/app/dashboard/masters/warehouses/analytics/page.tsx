import { getWarehouses } from '@/app/actions/warehouses'
import WarehouseAnalytics from '@/components/modules/masters/WarehouseAnalytics'

export const metadata = { title: 'Warehouse Analytics | TechMicra ERP' }

export default async function WarehouseAnalyticsPage() {
    const warehouses = await getWarehouses()
    return <WarehouseAnalytics warehouses={warehouses as any} />
}
