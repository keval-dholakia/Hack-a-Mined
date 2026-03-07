import { getProducts } from '@/app/actions/products'
import ProductList from '@/components/modules/masters/ProductList'
import { checkPermission } from '@/app/actions/permissions'
import { getSessionUser } from '@/app/actions/auth'
import { MODULES, PAGES } from '@/constants/permissions'
import { redirect } from 'next/navigation'

export default async function ProductsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const canView = await checkPermission(user.role_id, MODULES.MASTER, PAGES.MASTER.PRODUCTS, 'can_view')
  if (!canView && !user.is_super_admin) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Access Denied. You do not have permission to view Product Masters.</div>
  }

  const products = await getProducts()
  return <ProductList products={products} />
}