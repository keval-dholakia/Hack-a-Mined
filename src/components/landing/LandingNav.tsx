// src/app/_landing/LandingNav.tsx
import styles from './Landing.module.scss';
import Link from 'next/link';

export default function LandingNav() {
    return (
        <nav className={styles.nav}>
            <div className={styles.navLogo}>
                <div className={styles.logoMark}>
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="13" height="13" stroke="var(--amber)" strokeWidth="1.5" />
                        <rect x="18" y="1" width="13" height="13" stroke="var(--border)" strokeWidth="1.5" />
                        <rect x="1" y="18" width="13" height="13" stroke="var(--border)" strokeWidth="1.5" />
                        <rect x="18" y="18" width="13" height="13" stroke="var(--amber)" strokeWidth="1.5" />
                        <rect x="7" y="7" width="18" height="18" fill="var(--amber)" opacity="0.1" />
                        <rect x="13" y="13" width="6" height="6" fill="var(--amber)" />
                    </svg>
                </div>
                <span className={styles.logoText}>
                    Nex<span>Core</span>
                </span>
                <span className={styles.navTag}>ERP v1.0</span>
            </div>

            <ul className={styles.navLinks}>
                <li><a href="#modules">Modules</a></li>
                <li><a href="#workflow">Workflow</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#stack">Stack</a></li>
            </ul>

            <div className={styles.navCta}>
                <Link href="/login" className={styles.btnGhost}>Sign In</Link>
                <Link href="/dashboard" className={styles.btnPrimary}>Get Started →</Link>
            </div>
        </nav>
    );
}