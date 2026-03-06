import { getVendors } from '@/app/actions/vendors'
import VendorList from '@/components/modules/masters/VendorList'

export default async function VendorsPage() {
  const vendors = await getVendors()
  return <VendorList vendors={vendors} />
}