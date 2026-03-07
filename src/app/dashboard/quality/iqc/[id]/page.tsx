import { getIQCById, getGRNsForSelect, getProductsForIQC, getUsersForSelect } from '@/app/actions/quality'
import { getSessionUser } from '@/app/actions/auth'
import { redirect, notFound } from 'next/navigation'
import IQCForm from '@/components/modules/quality/IQCForm'

export default async function EditIQCPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const [entry, grns, products, users] = await Promise.all([
    getIQCById(Number(params.id)),
    getGRNsForSelect(),
    getProductsForIQC(),
    getUsersForSelect(),
  ])

  if (!entry) notFound()

  return (
    <IQCForm
      entry={entry}
      grns={grns}
      products={products}
      users={users}
      currentUserId={user.id}
    />
  )
}
