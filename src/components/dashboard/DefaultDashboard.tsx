import type { SessionUser } from '@/types/auth'
import styles from './Dashboard.module.scss'

export default function DefaultDashboard({ user }: { user: SessionUser }) {
  return (
    <div className={styles.kpiCard} style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No dashboard configured for <strong>{user.role_name}</strong>. Use the sidebar to navigate to your modules.
      </p>
    </div>
  )
}