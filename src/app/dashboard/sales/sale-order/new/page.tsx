import { getCustomersForSelect } from '@/app/actions/customers'
import { getProductsForSelect } from '@/app/actions/products'
import { getInquiriesForSelect } from '@/app/actions/inquiries'
import { getTransportForSelect } from '@/app/actions/transport'
import SaleOrderForm from '@/components/modules/sales/SaleOrderForm'

export default async function NewSaleOrderPage() {
  const [customers, products, inquiries, transporters] = await Promise.all([
    getCustomersForSelect(),
    getProductsForSelect(),
    getInquiriesForSelect(),
    getTransportForSelect(),
  ])

  return (
    <SaleOrderForm
      customers={customers}
      products={products}
      inquiries={inquiries}
      transporters={transporters}
    />
  )
}