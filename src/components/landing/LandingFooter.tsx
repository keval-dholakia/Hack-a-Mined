// src/app/_landing/LandingFooter.tsx
import styles from './Landing.module.scss';

export default function LandingFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerLeft}>
                <div className={styles.logoMark} style={{ width: 24, height: 24 }}>
                    <svg viewBox="0 0 32 32" fill="none">
                        <rect x="1" y="1" width="13" height="13" stroke="var(--amber)" strokeWidth="1.5" />
                        <rect x="18" y="18" width="13" height="13" stroke="var(--amber)" strokeWidth="1.5" />
                        <rect x="13" y="13" width="6" height="6" fill="var(--amber)" />
                    </svg>
                </div>
                <span className={styles.footerCopy}>
                    NexCore ERP · Discrete Manufacturing Intelligence
                </span>
            </div>
            <div className={styles.footerRight}>
                Built for Indian Manufacturing ·{' '}
                <span style={{ color: 'var(--amber)' }}>TechMicra Hackathon 2025</span>
            </div>
        </footer>
    );
}