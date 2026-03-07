import { getTransportMasters } from '@/app/actions/transport'
import TransportList from '@/components/modules/masters/TransportList'
import { checkPermission } from '@/app/actions/permissions'
import { getSessionUser } from '@/app/actions/auth'
import { MODULES, PAGES } from '@/constants/permissions'
import { redirect } from 'next/navigation'

export default async function TransportPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const canView = await checkPermission(user.role_id, MODULES.MASTER, PAGES.MASTER.TRANSPORT, 'can_view')
  if (!canView && !user.is_super_admin) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Access Denied. You do not have permission to view Transport Masters.</div>
  }

  const transporters = await getTransportMasters()
  return <TransportList transporters={transporters} />
}