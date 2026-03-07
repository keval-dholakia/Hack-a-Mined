import { getPurchaseOrdersWithItems } from '@/app/actions/purchase'
import POList from '@/components/modules/purchase/POList'

export default async function POPage() {
  const orders = await getPurchaseOrdersWithItems()
  return <POList orders={orders} />
}