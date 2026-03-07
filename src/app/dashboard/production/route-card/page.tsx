import { getRouteCards } from '@/app/actions/production'
import RouteCardList from '@/components/modules/production/RouteCardList'

export default async function RouteCardPage() {
  const routeCards = await getRouteCards()
  return <RouteCardList routeCards={routeCards} />
}