// src/app/_landing/LandingModules.tsx
import styles from './Landing.module.scss';

const MODULES = [
    { num: '01', icon: '📋', name: 'Sales Management', desc: 'Inquiry to invoice with automated payment reminders', count: '9 sub-modules · WhatsApp alerts' },
    { num: '02', icon: '🏭', name: 'Purchase Management', desc: 'Indent to payment with vendor tracking', count: '8 sub-modules · GRN + IQC' },
    { num: '03', icon: '⚙️', name: 'Production Management', desc: 'Route cards, BOM, job work and batch closure', count: '10 sub-modules · Floor control' },
    { num: '04', icon: '💳', name: 'Finance Management', desc: 'Double-entry vouchers, bank reconciliation, P&L', count: '6 sub-modules · Auto ledger' },
    { num: '05', icon: '👥', name: 'HR Management', desc: 'Employee master, payroll processing, advances', count: '5 sub-modules · Monthly payroll' },
    { num: '06', icon: '🚛', name: 'Logistics Management', desc: 'Transport booking, challan, freight billing', count: '4 sub-modules · LR tracking' },
    { num: '07', icon: '🔍', name: 'Quality Management', desc: 'IQC → PQC → PDI quality gates with rejection decisions', count: '5 sub-modules · 4-stage gates' },
    { num: '08', icon: '🤝', name: 'Contractor Management', desc: 'Contract labour payroll with daily rate and OT calculation', count: '6 sub-modules · TDS deduction' },
    { num: '09', icon: '🔧', name: 'Maintenance Management', desc: 'Tool master, calibration, scheduled maintenance alerts', count: '4 sub-modules · Auto-scheduling' },
    { num: '10', icon: '📦', name: 'Stores Management', desc: 'Multi-warehouse stock, transfers, gate pass management', count: '5 sub-modules · Real-time ledger' },
    { num: '11', icon: '🏗️', name: 'Asset Management', desc: 'Fixed asset register, depreciation, allocation tracking', count: '5 sub-modules · Auto depreciation' },
    { num: '12', icon: '📊', name: 'Statutory Management', desc: 'GST filing, TDS/TCS, GSTR-1/2A reconciliation', count: '9 sub-modules · India compliant' },
    { num: '13', icon: '🔮', name: 'Production Simulation', desc: 'MRP + CRP + Cost estimation from MPS input', count: 'BOM explosion · Real-time forecast' },
    { num: '∞', icon: '🛡️', name: 'RBAC & Admin', desc: 'Super admin, 15 roles, per-page permission matrix', count: 'Granular access control' },
];

export default function LandingModules() {
    return (
        <section className={styles.modules} id="modules">
            <div className={`${styles.sectionHeader} reveal`}>
                <div>
                    <div className={styles.sectionEyebrow}>System Architecture</div>
                    <h2 className={styles.sectionTitle}>
                        13 Integrated<br />Operational Modules
                    </h2>
                </div>
                <p className={styles.sectionDesc}>
                    Every module is interconnected. Data flows automatically from Sales
                    to Warehouse to Production to Finance — no manual re-entry, no data silos.
                </p>
            </div>

            <div className={`${styles.moduleGrid} reveal-stagger`}>
                {MODULES.map((m) => (
                    <div
                        key={m.num}
                        className={`${styles.moduleCard}`}
                    >
                        <div className={styles.moduleNum}>{m.num}</div>
                        <span className={styles.moduleIcon}>{m.icon}</span>
                        <div className={styles.moduleName}>{m.name}</div>
                        <div className={styles.moduleDesc}>{m.desc}</div>
                        <div className={styles.moduleCount}>{m.count}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}