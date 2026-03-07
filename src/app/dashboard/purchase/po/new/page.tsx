import { getVendorsForSelect } from '@/app/actions/vendors'
import { getProductsForSelect } from '@/app/actions/products'
import POForm from '@/components/modules/purchase/POForm'

export default async function NewPOPage() {
  const [vendors, products] = await Promise.all([
    getVendorsForSelect(),
    getProductsForSelect(),
  ])
  return <POForm vendors={vendors} products={products} />
}