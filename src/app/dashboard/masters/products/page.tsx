import { getProducts } from '@/app/actions/products'
import ProductList from '@/components/modules/masters/ProductList'

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductList products={products} />
}