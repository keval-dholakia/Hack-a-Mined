import { redirect } from 'next/navigation'
import { getSessionUser } from '@/app/actions/auth'
import { getPermissionsByRole } from '@/app/actions/permissions'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ChatbotPanel from '@/components/modules/chatbot/ChatbotPanel'
import styles from './dashboard.module.scss'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const permissions = await getPermissionsByRole(user.role_id)

  return (
    <div className={styles.shell}>
      <Sidebar
        permissions={permissions}
        isSuperAdmin={user.is_super_admin}
        user={user}
      />
      <div className={styles.main}>
        <Topbar user={user} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
      <ChatbotPanel roleId={user.role_id} />
    </div>
  )
}