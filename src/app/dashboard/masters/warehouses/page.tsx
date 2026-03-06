import { getWarehouses } from '@/app/actions/warehouses'
import WarehouseList from '@/components/modules/masters/WarehouseList'

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()
  return <WarehouseList warehouses={warehouses} />
}