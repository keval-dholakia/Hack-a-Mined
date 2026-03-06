import { getInvoices } from '@/app/actions/invoices'
import InvoiceList from '@/components/modules/sales/InvoiceList'

export default async function InvoicePage() {
  const invoices = await getInvoices()
  return <InvoiceList invoices={invoices} />
}