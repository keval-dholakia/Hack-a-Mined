import { getCustomersForSelect } from '@/app/actions/customers'
import { getProductsForSelect } from '@/app/actions/products'
import { getSessionUser } from '@/app/actions/auth'
import InquiryForm from '@/components/modules/sales/InquiryForm'

export default async function NewInquiryPage() {
  const [customers, products, user] = await Promise.all([
    getCustomersForSelect(),
    getProductsForSelect(),
    getSessionUser(),
  ])

  return (
    <InquiryForm
      customers={customers}
      products={products}
      currentUser={user}
    />
  )
}