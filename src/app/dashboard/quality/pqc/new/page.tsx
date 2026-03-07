import { getRouteCardsForSelect, getUsersForSelect } from '@/app/actions/quality'
import { getSessionUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import PQCForm from '@/components/modules/quality/PQCForm'

export default async function NewPQCPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const [routeCards, users] = await Promise.all([
    getRouteCardsForSelect(),
    getUsersForSelect(),
  ])

  return (
    <PQCForm
      routeCards={routeCards}
      users={users}
      currentUserId={user.id}
    />
  )
}
