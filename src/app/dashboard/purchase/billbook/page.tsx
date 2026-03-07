import { getPurchaseBills } from '@/app/actions/purchase'
import PurchaseBillList from '@/components/modules/purchase/PurchaseBillList'

export default async function BillbookPage() {
  const bills = await getPurchaseBills()
  return <PurchaseBillList bills={bills} />
}