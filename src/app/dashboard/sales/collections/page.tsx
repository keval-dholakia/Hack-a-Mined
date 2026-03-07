import { getReceiptVouchers } from '@/app/actions/receiptVouchers'
import ReceiptVoucherList from '@/components/modules/sales/ReceiptVoucherList'

export default async function CollectionsPage() {
  const vouchers = await getReceiptVouchers()
  return <ReceiptVoucherList vouchers={vouchers} />
}