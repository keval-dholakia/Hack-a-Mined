import { getSessionUser } from '@/app/actions/auth'
import {
  getSuperAdminDashboard,
  getSalesDashboard,
  getPurchaseDashboard,
  getProductionDashboard,
  getHRDashboard,
  getFinanceDashboard,
} from '@/app/actions/dashboard'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) return null

  const role = user.role_name
  let data   = null

  if (user.is_super_admin || role === 'Super Admin') {
    data = await getSuperAdminDashboard()
  } else if (role === 'Sales Manager') {
    data = await getSalesDashboard()
  } else if (role === 'Purchase Manager') {
    data = await getPurchaseDashboard()
  } else if (role === 'Production Manager') {
    data = await getProductionDashboard()
  } else if (role === 'HR Manager') {
    data = await getHRDashboard()
  } else if (role === 'Finance Manager') {
    data = await getFinanceDashboard()
  }

  return <DashboardClient user={user} role={role} data={data} />
}