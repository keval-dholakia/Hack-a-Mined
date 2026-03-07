import { getRouteCardById, getBOMsForSelect } from '@/app/actions/production'
import { getProductsForSelect } from '@/app/actions/products'
import RouteCardForm from '@/components/modules/production/RouteCardForm'
import { notFound } from 'next/navigation'

export default async function EditRouteCardPage({ params }: { params: { id: string } }) {
  const [rc, products, boms] = await Promise.all([
    getRouteCardById(Number(params.id)),
    getProductsForSelect(),
    getBOMsForSelect(),
  ])
  if (!rc) notFound()
  return <RouteCardForm routeCard={rc} products={products} boms={boms} />
}