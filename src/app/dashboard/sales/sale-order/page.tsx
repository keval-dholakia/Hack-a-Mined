import { getSaleOrders } from '@/app/actions/saleOrders'
import SaleOrderList from '@/components/modules/sales/SaleOrderList'

export default async function SaleOrderPage() {
  const saleOrders = await getSaleOrders()
  return <SaleOrderList saleOrders={saleOrders} />
}