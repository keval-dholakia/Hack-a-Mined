import { getCustomersForSelect } from '@/app/actions/customers'
import { getProductsForSelect } from '@/app/actions/products'
import { getSaleOrdersForSelect } from '@/app/actions/saleOrders'
import InvoiceForm from '@/components/modules/sales/InvoiceForm'

export default async function NewInvoicePage() {
  const [customers, products, saleOrders] = await Promise.all([
    getCustomersForSelect(),
    getProductsForSelect(),
    getSaleOrdersForSelect(),
  ])

  return (
    <InvoiceForm
      customers={customers}
      products={products}
      saleOrders={saleOrders}
    />
  )
}