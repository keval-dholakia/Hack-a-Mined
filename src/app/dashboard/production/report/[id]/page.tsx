import { getProductionReportById, getRouteCardsForSelect } from '@/app/actions/production'
import { getProductsForSelect } from '@/app/actions/products'
import { getSessionUser } from '@/app/actions/auth'
import ProductionReportForm from '@/components/modules/production/ProductionReportForm'
import { notFound } from 'next/navigation'

export default async function EditProductionReportPage({ params }: { params: { id: string } }) {
  const [report, routeCards, products, user] = await Promise.all([
    getProductionReportById(Number(params.id)),
    getRouteCardsForSelect(),
    getProductsForSelect(),
    getSessionUser(),
  ])
  if (!report) notFound()
  return (
    <ProductionReportForm
      report={report}
      routeCards={routeCards}
      products={products}
      currentUser={user}
    />
  )
}