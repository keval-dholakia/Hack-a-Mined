import { getGRNsForSelect, getProductsForIQC, getUsersForSelect } from '@/app/actions/quality'
import { getSessionUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import IQCForm from '@/components/modules/quality/IQCForm'

export default async function NewIQCPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const [grns, products, users] = await Promise.all([
    getGRNsForSelect(),
    getProductsForIQC(),
    getUsersForSelect(),
  ])

  return (
    <IQCForm
      grns={grns}
      products={products}
      users={users}
      currentUserId={user.id}
    />
  )
}
