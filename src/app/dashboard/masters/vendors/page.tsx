import { getVendors } from '@/app/actions/vendors'
import VendorList from '@/components/modules/masters/VendorList'
import { checkPermission } from '@/app/actions/permissions'
import { getSessionUser } from '@/app/actions/auth'
import { MODULES, PAGES } from '@/constants/permissions'
import { redirect } from 'next/navigation'

export default async function VendorsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const canView = await checkPermission(user.role_id, MODULES.MASTER, PAGES.MASTER.VENDORS, 'can_view')
  if (!canView && !user.is_super_admin) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Access Denied. You do not have permission to view Vendor Masters.</div>
  }

  const vendors = await getVendors()
  return <VendorList vendors={vendors} />
}