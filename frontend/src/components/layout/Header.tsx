'use client';

import { usePathname } from 'next/navigation';
import { BREADCRUMBS } from '@/lib/nav';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();
    const segment = pathname.split('/')[1] || 'dashboard';
    const crumbs = BREADCRUMBS[segment] || [segment];

    const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <header className={styles.header}>
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
                {crumbs.map((c, i) => (
                    <span key={i} className={styles.breadcrumbGroup}>
                        {i > 0 && <span className={styles.sep}>›</span>}
                        <span className={`${styles.bcItem} ${i === crumbs.length - 1 ? styles.bcLast : ''}`}>
                            {c}
                        </span>
                    </span>
                ))}
            </nav>

            {/* Right side */}
            <div className={styles.right}>
                <div className={styles.searchBox}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⌕</span>
                    <input placeholder="Search..." aria-label="Search" />
                    <span className={styles.kbd}>⌘K</span>
                </div>

                <button className={styles.iconBtn} aria-label="Notifications">
                    <span>⚬</span>
                    <span className={styles.notifDot} />
                </button>

                <div className={styles.dateChip}>{today}</div>
            </div>
        </header>
    );
}
