import { getGRNsForSelect } from '@/app/actions/purchase'
import { getProductsForSelect } from '@/app/actions/products'
import { getSessionUser } from '@/app/actions/auth'
import IQCForm from '@/components/modules/purchase/IQCForm'

export default async function NewIQCPage() {
  const [grns, products, user] = await Promise.all([
    getGRNsForSelect(),
    getProductsForSelect(),
    getSessionUser(),
  ])
  return <IQCForm grns={grns} products={products} currentUser={user} />
}