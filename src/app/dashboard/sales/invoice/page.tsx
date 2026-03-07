import { getInvoicesWithItems } from '@/app/actions/invoices'
import InvoiceList from '@/components/modules/sales/InvoiceList'

export default async function InvoicePage() {
  const invoices = await getInvoicesWithItems()
  return <InvoiceList invoices={invoices} />
}