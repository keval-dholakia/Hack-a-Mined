// src/app/_landing/LandingWorkflow.tsx
import styles from './Landing.module.scss';

const FLOW_STEPS = [
    { icon: '📋', label: 'Inquiry' },
    { icon: '💬', label: 'Quotation' },
    { icon: '📄', label: 'Customer PO' },
    { icon: '🔒', label: 'Sale Order', highlight: true },
    { icon: '🚛', label: 'Dispatch' },
    { icon: '🧾', label: 'Invoice' },
    { icon: '✅', label: 'Receipt', success: true },
];

const Arrow = () => (
    <div className={styles.flowArrow}>
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
            <path d="M0 8h20M16 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    </div>
);

export default function LandingWorkflow() {
    return (
        <section className={styles.workflow} id="workflow">
            <div className={`${styles.sectionHeader} reveal`} style={{ marginBottom: '48px' }}>
                <div>
                    <div className={styles.sectionEyebrow}>Control Flow</div>
                    <h2 className={styles.sectionTitle}>
                        State Machine<br />Driven Workflow
                    </h2>
                </div>
                <p className={styles.sectionDesc}>
                    Documents flow sequentially with role-based handoffs.
                    Each step unlocks the next — the system enforces the business process automatically.
                </p>
            </div>

            <div className={`${styles.flowChain} reveal`}>
                {FLOW_STEPS.map((step, i) => (
                    <>
                        <div className={styles.flowStep} key={step.label}>
                            <div className={`${styles.flowNode} ${step.highlight ? styles.flowNodeAmber : ''} ${step.success ? styles.flowNodeGreen : ''}`}>
                                {step.icon}
                            </div>
                            <div className={styles.flowLabel}>{step.label}</div>
                        </div>
                        {i < FLOW_STEPS.length - 1 && <Arrow key={`arrow-${i}`} />}
                    </>
                ))}
            </div>
        </section>
    );
}