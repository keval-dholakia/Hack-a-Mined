// src/app/_landing/LandingFeatures.tsx
import styles from './Landing.module.scss';

export default function LandingFeatures() {
    return (
        <section className={styles.features} id="features">
            <div className={`${styles.sectionHeader} reveal`}>
                <div>
                    <div className={styles.sectionEyebrow}>Intelligent Features</div>
                    <h2 className={styles.sectionTitle}>
                        Built for How<br />Factories Actually Work
                    </h2>
                </div>
                <p className={styles.sectionDesc}>
                    Not generic ERP software retrofitted for manufacturing.
                    Every feature was designed around discrete, make-to-order production.
                </p>
            </div>

            <div className={styles.featureGrid}>

                {/* Large card — Simulation */}
                <div className={`${styles.featureCard} ${styles.featureCardLarge} reveal`}>
                    <div>
                        <span className={styles.featureTag}>Module 13 · Star Feature</span>
                        <h3 className={styles.featureTitle}>
                            Production Simulation &amp; Forecasting
                        </h3>
                        <p className={styles.featureBody}>
                            Input a Master Production Schedule. The system performs a full BOM reverse
                            explosion, calculates capacity requirements, detects overloads, and estimates
                            provisional costs — in seconds.
                        </p>
                        <ul className={styles.featureList}>
                            <li>MRP: BOM explosion with shortfall detection</li>
                            <li>CRP: Capacity vs. monthly availability</li>
                            <li>Costing: Labour + electricity + material</li>
                            <li>Overload alert if target exceeds capacity</li>
                        </ul>
                    </div>

                    {/* Mini simulation preview */}
                    <div className={styles.simPreview}>
                        <div className={styles.simRow}>
                            <span className={styles.simLabel}>Input: 20 Alto + 30 Swift + 25 Baleno</span>
                        </div>
                        <div className={styles.simBars}>
                            {[
                                { label: 'Steel Sheet', pct: 72, color: 'var(--amber)' },
                                { label: 'Alum. Cast', pct: 38, color: 'var(--red)' },
                                { label: 'Copper Wire', pct: 100, color: 'var(--green)' },
                            ].map((b) => (
                                <div className={styles.simBarRow} key={b.label}>
                                    <span className={styles.simLabel} style={{ width: '80px' }}>{b.label}</span>
                                    <div className={styles.simBarTrack}>
                                        <div
                                            className={styles.simBarFill}
                                            style={{ width: `${b.pct}%`, background: b.color }}
                                            data-width={`${b.pct}%`}
                                        />
                                    </div>
                                    <span className={styles.simVal} style={{ color: b.color }}>{b.pct}%</span>
                                </div>
                            ))}
                        </div>
                        {[
                            { label: 'Total Estimated Cost', val: '₹42.8L', valClass: '' },
                            { label: 'Days Required', val: '18 days', valClass: '' },
                        ].map((r) => (
                            <div className={styles.simRow} key={r.label}>
                                <span className={styles.simLabel}>{r.label}</span>
                                <span className={styles.simVal}>{r.val}</span>
                            </div>
                        ))}
                        <div className={styles.simRow}>
                            <span className={styles.simLabel}>Capacity Status</span>
                            <span className={`${styles.mockPill} ${styles.pillGreen}`}>Within Limit</span>
                        </div>
                    </div>
                </div>

                {/* Card — Reminders */}
                <div className={`${styles.featureCard} reveal`}>
                    <span className={styles.featureTag}>Smart Automation</span>
                    <h3 className={styles.featureTitle}>Payment Reminder Engine</h3>
                    <p className={styles.featureBody}>
                        Configurable multi-trigger reminder system. Automatically sends
                        WhatsApp and email alerts at 7 days, 3 days, due date, and daily
                        overdue — with full communication log.
                    </p>
                    <ul className={styles.featureList}>
                        <li>Auto-triggered on invoice creation</li>
                        <li>WhatsApp + Email dual channel</li>
                        <li>Strict / Moderate / Lenient modes</li>
                        <li>Read &amp; delivered status tracking</li>
                    </ul>
                </div>

                {/* Card — GST */}
                <div className={`${styles.featureCard} reveal`}>
                    <span className={styles.featureTag}>India Compliance</span>
                    <h3 className={styles.featureTitle}>Full GST &amp; TDS Integration</h3>
                    <p className={styles.featureBody}>
                        CGST/SGST/IGST split, HSN codes, GSTR-1 export, GSTR-2A reconciliation,
                        TDS section 194C for contractor payments, TCS on sales. Built for Indian
                        manufacturing from day one.
                    </p>
                    <ul className={styles.featureList}>
                        <li>GSTR-1 auto-export for portal upload</li>
                        <li>GSTR-2A mismatch detection</li>
                        <li>TDS with certificate tracking</li>
                        <li>E-Way Bill number management</li>
                    </ul>
                </div>

                {/* Card — RBAC */}
                <div className={`${styles.featureCard} reveal`}>
                    <span className={styles.featureTag}>Access Control</span>
                    <h3 className={styles.featureTitle}>Granular Role-Based Permissions</h3>
                    <p className={styles.featureBody}>
                        15 predefined roles from Super Admin to Quality Inspector.
                        Each permission is scoped to module + page + action.
                        A warehouse guy never sees a quotation.
                    </p>
                    <ul className={styles.featureList}>
                        <li>Per-page view / create / edit / delete</li>
                        <li>15 role types out of the box</li>
                        <li>Super Admin creates unlimited users</li>
                        <li>Audit log on every action</li>
                    </ul>
                </div>

            </div>
        </section>
    );
}