import { getProductsForSelect } from '@/app/actions/products'
import { getBOMsForSelect } from '@/app/actions/production'
import RouteCardForm from '@/components/modules/production/RouteCardForm'

export default async function NewRouteCardPage() {
  const [products, boms] = await Promise.all([
    getProductsForSelect(),
    getBOMsForSelect(),
  ])
  return <RouteCardForm products={products} boms={boms} />
}