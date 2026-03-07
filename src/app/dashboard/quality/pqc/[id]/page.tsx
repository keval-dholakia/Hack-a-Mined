import { getPQCById, getRouteCardsForSelect, getUsersForSelect } from '@/app/actions/quality'
import { getSessionUser } from '@/app/actions/auth'
import { redirect, notFound } from 'next/navigation'
import PQCForm from '@/components/modules/quality/PQCForm'

export default async function EditPQCPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const [entry, routeCards, users] = await Promise.all([
    getPQCById(Number(params.id)),
    getRouteCardsForSelect(),
    getUsersForSelect(),
  ])

  if (!entry) notFound()

  return (
    <PQCForm
      entry={entry}
      routeCards={routeCards}
      users={users}
      currentUserId={user.id}
    />
  )
}
