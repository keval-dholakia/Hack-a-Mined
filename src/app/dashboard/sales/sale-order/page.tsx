import { getSaleOrdersWithItems } from '@/app/actions/saleOrders'
import SaleOrderList from '@/components/modules/sales/SaleOrderList'

export default async function SaleOrderPage() {
  const saleOrders = await getSaleOrdersWithItems()
  return <SaleOrderList saleOrders={saleOrders} />
}