import { getRouteCardsForSelect } from '@/app/actions/production'
import { getProductsForSelect } from '@/app/actions/products'
import { getWarehousesForSelect } from '@/app/actions/warehouses'
import { getSessionUser } from '@/app/actions/auth'
import MaterialIssueForm from '@/components/modules/production/MaterialIssueForm'

export default async function NewMaterialIssuePage() {
  const [routeCards, products, warehouses, user] = await Promise.all([
    getRouteCardsForSelect(),
    getProductsForSelect(),
    getWarehousesForSelect(),
    getSessionUser(),
  ])
  return (
    <MaterialIssueForm
      routeCards={routeCards}
      products={products}
      warehouses={warehouses}
      currentUser={user}
    />
  )
}