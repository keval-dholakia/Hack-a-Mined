import { getWarehouses } from '@/app/actions/warehouses'
import WarehouseMasterList from '@/components/modules/stores/WarehouseMasterList'

export const metadata = { title: 'Warehouse Master | Stores | TechMicra ERP' }

export default async function WarehouseMasterPage() {
    const warehouses = await getWarehouses()
    return <WarehouseMasterList warehouses={warehouses as any} />
}
