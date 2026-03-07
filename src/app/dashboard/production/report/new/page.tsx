import { getRouteCardsForSelect } from '@/app/actions/production'
import { getProductsForSelect } from '@/app/actions/products'
import { getSessionUser } from '@/app/actions/auth'
import ProductionReportForm from '@/components/modules/production/ProductionReportForm'

export default async function NewProductionReportPage() {
  const [routeCards, products, user] = await Promise.all([
    getRouteCardsForSelect(),
    getProductsForSelect(),
    getSessionUser(),
  ])
  return (
    <ProductionReportForm
      routeCards={routeCards}
      products={products}
      currentUser={user}
    />
  )
}