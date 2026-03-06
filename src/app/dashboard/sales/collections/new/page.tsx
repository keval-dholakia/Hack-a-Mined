import { getCustomersForSelect } from '@/app/actions/customers'
import { getInvoicesForSelect } from '@/app/actions/invoices'
import ReceiptVoucherForm from '@/components/modules/sales/ReceiptVoucherForm'

export default async function NewReceiptVoucherPage() {
  const [customers, invoices] = await Promise.all([
    getCustomersForSelect(),
    getInvoicesForSelect(),
  ])

  return (
    <ReceiptVoucherForm
      customers={customers}
      invoices={invoices}
    />
  )
}