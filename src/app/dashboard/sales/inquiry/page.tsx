import { getInquiries } from '@/app/actions/inquiries'
import InquiryList from '@/components/modules/sales/InquiryList'

export default async function InquiryPage() {
  const inquiries = await getInquiries()
  return <InquiryList inquiries={inquiries} />
}