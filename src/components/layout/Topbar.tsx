'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { SessionUser } from '@/types/auth'
import styles from './Topbar.module.scss'

type Props = {
  user: SessionUser
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  if (!last || last === 'dashboard') return 'Dashboard'
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).toUpperCase()
}

export default function Topbar({ user }: Props) {
  const pathname    = usePathname()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.topbar}>

      {/* Left — page title */}
      <div className={styles.left}>
        <h2 className={styles.pageTitle}>{getPageTitle(pathname)}</h2>
      </div>

      {/* Right — search, notifications, date, user */}
      <div className={styles.right}>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.searchShortcut}>⌘K</span>
        </div>

        {/* Notification bell */}
        <button className={styles.iconBtn} title="Notifications">
          <span className={styles.bellIcon}>🔔</span>
          <span className={styles.bellDot} />
        </button>

        {/* Date */}
        <div className={styles.dateBadge}>
          {getFormattedDate()}
        </div>

        {/* User menu */}
        <div className={styles.userWrap}>
          <div
            className={styles.userChip}
            onClick={() => setMenuOpen(p => !p)}
          >
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {menuOpen && (
            <>
              <div
                className={styles.overlay}
                onClick={() => setMenuOpen(false)}
              />
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownRole}>{user.role_name}</p>
                  </div>
                </div>
                <hr className={styles.divider} />
                <button
                  className={styles.dropdownItem}
                  onClick={() => logout()}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  )
}