import { getPurchaseOrders } from '@/app/actions/purchase'
import POList from '@/components/modules/purchase/POList'

export default async function POPage() {
  const orders = await getPurchaseOrders()
  return <POList orders={orders} />
}