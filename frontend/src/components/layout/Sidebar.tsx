'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, NavItem } from '@/lib/nav';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ sales: true });

    const toggle = (id: string) =>
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const isActive = (item: NavItem) => pathname.startsWith(item.href);

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>M</div>
                <div>
                    <div className={styles.logoName}>TechMicra</div>
                    <div className={styles.logoVer}>ERP v1.0</div>
                </div>
            </div>

            {/* Nav */}
            <nav className={styles.nav}>
                {NAV.map(group => (
                    <div key={group.group}>
                        <div className={styles.groupLabel}>{group.group}</div>
                        {group.items.map(item => (
                            <div key={item.id}>
                                {item.sub ? (
                                    <button
                                        className={`${styles.navItem} ${isActive(item) ? styles.active : ''}`}
                                        onClick={() => toggle(item.id)}
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        <span className={`${styles.chevron} ${expanded[item.id] ? styles.chevronOpen : ''}`}>▾</span>
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`${styles.navItem} ${isActive(item) ? styles.active : ''}`}
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                    </Link>
                                )}

                                {item.sub && expanded[item.id] && (
                                    <div className={styles.subNav}>
                                        {item.sub.map(s => (
                                            <Link key={s.label} href={s.href} className={styles.subItem}>
                                                {s.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User bar */}
            <div className={styles.userBar}>
                <div className={styles.avatar}>A</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 500 }}>Admin</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Super Admin</div>
                </div>
                <button style={{ color: 'var(--text-muted)', fontSize: '14px' }}>⊙</button>
            </div>
        </aside>
    );
}
