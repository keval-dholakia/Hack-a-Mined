import { getWarehouses } from '@/app/actions/warehouses'
import WarehouseList from '@/components/modules/masters/WarehouseList'
import { checkPermission } from '@/app/actions/permissions'
import { getSessionUser } from '@/app/actions/auth'
import { MODULES, PAGES } from '@/constants/permissions'
import { redirect } from 'next/navigation'

export default async function WarehousesPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const canView = await checkPermission(user.role_id, MODULES.MASTER, PAGES.MASTER.WAREHOUSES, 'can_view')
  if (!canView && !user.is_super_admin) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Access Denied. You do not have permission to view Warehouse Masters.</div>
  }

  const warehouses = await getWarehouses()
  return <WarehouseList warehouses={warehouses} />
}