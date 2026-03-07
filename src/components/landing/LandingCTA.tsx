// src/app/_landing/LandingCTA.tsx
import styles from './Landing.module.scss';
import Link from 'next/link';

export default function LandingCTA() {
    return (
        <section className={`${styles.ctaSection} reveal`}>
            <div className={styles.ctaLabel}>Ready to Deploy</div>
            <h2 className={styles.ctaTitle}>
                Your Factory.<br />Your Data. Your Control.
            </h2>
            <p className={styles.ctaSub}>
                End-to-end manufacturing ERP designed for Indian automotive ancillary companies.
                GST compliant. Real-time. Role-aware.
            </p>
            <div className={styles.ctaActions}>
                <Link href="/dashboard" className={styles.btnHero}>
                    Launch Dashboard
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <a href="#modules" className={styles.btnHeroOutline}>
                    View All Modules
                </a>
            </div>
        </section>
    );
}