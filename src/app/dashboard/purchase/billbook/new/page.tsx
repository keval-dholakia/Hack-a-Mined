import { getVendorsForSelect } from '@/app/actions/vendors'
import { getGRNsForSelect } from '@/app/actions/purchase'
import PurchaseBillForm from '@/components/modules/purchase/PurchaseBillForm'

export default async function NewBillPage() {
  const [vendors, grns] = await Promise.all([
    getVendorsForSelect(),
    getGRNsForSelect(),
  ])
  return <PurchaseBillForm vendors={vendors} grns={grns} />
}