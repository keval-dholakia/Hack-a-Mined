// src/app/_landing/LandingHero.tsx
import styles from './Landing.module.scss';
import Link from 'next/link';

export default function LandingHero() {
    return (
        <section className={styles.hero}>
            <div className={styles.heroEyebrow}>
                <span className={styles.eyebrowDot}></span>
                <span className={styles.eyebrowText}>Manufacturing Intelligence Platform</span>
                <span className={styles.eyebrowLine}></span>
            </div>

            <h1 className={styles.heroHeading}>
                Command Your<br />
                <span className={styles.accent}>Factory Floor.</span>
                <span className={styles.dim}>
                    End-to-end ERP for Indian discrete manufacturing
                </span>
            </h1>

            <p className={styles.heroSub}>
                From customer inquiry to dispatch, raw material to finished goods —
                NexCore unifies 13 operational modules into a single, auditable system
                built for automotive ancillary manufacturers.
            </p>

            <div className={styles.heroActions}>
                <Link href="/dashboard" className={styles.btnHero}>
                    Launch Dashboard
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
                <a href="#modules" className={styles.btnHeroOutline}>
                    Explore Modules
                </a>
            </div>

            <div className={styles.heroStats}>
                {[
                    { val: '13', suffix: '+', label: 'Core Modules' },
                    { val: '70', suffix: '+', label: 'Sub-Modules' },
                    { val: 'GST', suffix: '✓', label: 'India Compliant' },
                    { val: 'Real', suffix: '-time', label: 'Stock Ledger' },
                ].map((s) => (
                    <div className={styles.stat} key={s.label} data-counter={s.val}>
                        <div className={styles.statVal}>
                            {s.val}<span>{s.suffix}</span>
                        </div>
                        <div className={styles.statLabel}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Dashboard mockup — decorative, right side */}
            <div className={styles.heroVisual}>
                <div className={styles.dashboardMock}>
                    <div className={styles.mockTopbar}>
                        <div className={styles.mockDot} style={{ background: 'var(--red)' }} />
                        <div className={styles.mockDot} style={{ background: 'var(--amber)' }} />
                        <div className={styles.mockDot} style={{ background: 'var(--green)' }} />
                        <span className={styles.mockTitle}>NexCore ERP — Sales Dashboard</span>
                    </div>
                    <div className={styles.mockBody}>
                        <div className={styles.mockKpis}>
                            {[
                                { val: '₹28.4L', label: 'Revenue MTD', accent: 'var(--amber)' },
                                { val: '142', label: 'Active Orders', accent: 'var(--green)' },
                                { val: '96.2%', label: 'On-Time Dispatch', accent: 'var(--accent)' },
                            ].map((k) => (
                                <div className={styles.mockKpi} key={k.label} style={{ borderTopColor: k.accent }}>
                                    <div className={styles.mockKpiVal}>{k.val}</div>
                                    <div className={styles.mockKpiLbl}>{k.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.mockChart}>
                            {[40, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
                                <div key={i} className={styles.mockBar} style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <div className={styles.mockTable}>
                            {[
                                { text: 'SO-2024-0891 · Maruti Suzuki', status: 'Dispatched', statusClass: 'pillGreen', val: '₹1.2L' },
                                { text: 'SO-2024-0892 · Tata Motors', status: 'Pending', statusClass: 'pillAmber', val: '₹2.8L' },
                                { text: 'SO-2024-0893 · Mahindra', status: 'Overdue', statusClass: 'pillRed', val: '₹0.9L' },
                            ].map((r) => (
                                <div className={styles.mockRow} key={r.text}>
                                    <span className={styles.mockRowText}>{r.text}</span>
                                    <span className={`${styles.mockPill} ${styles[r.statusClass]}`}>{r.status}</span>
                                    <span className={styles.mockRowVal}>{r.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}