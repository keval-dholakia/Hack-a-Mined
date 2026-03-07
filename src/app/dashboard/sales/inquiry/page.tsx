import { getInquiriesWithItems } from '@/app/actions/inquiries'
import InquiryList from '@/components/modules/sales/InquiryList'

export default async function InquiryPage() {
  const inquiries = await getInquiriesWithItems()
  return <InquiryList inquiries={inquiries} />
}