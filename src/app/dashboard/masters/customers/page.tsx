import { getCustomers } from '@/app/actions/customers'
import CustomerList from '@/components/modules/masters/CustomerList'
import { checkPermission } from '@/app/actions/permissions'
import { getSessionUser } from '@/app/actions/auth'
import { MODULES, PAGES } from '@/constants/permissions'
import { redirect } from 'next/navigation'

export default async function CustomersPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const canView = await checkPermission(user.role_id, MODULES.MASTER, PAGES.MASTER.CUSTOMERS, 'can_view')
  if (!canView && !user.is_super_admin) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Access Denied. You do not have permission to view Customer Masters.</div>
  }

  const customers = await getCustomers()
  return <CustomerList customers={customers} />
}