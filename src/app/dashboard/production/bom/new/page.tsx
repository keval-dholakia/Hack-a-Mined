import { getProductsForSelect } from '@/app/actions/products'
import BOMForm from '@/components/modules/production/BOMForm'

export default async function NewBOMPage() {
  const products = await getProductsForSelect()
  return <BOMForm products={products} />
}