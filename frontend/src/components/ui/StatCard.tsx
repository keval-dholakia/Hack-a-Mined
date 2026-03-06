import styles from './StatCard.module.css';

interface StatCardProps {
    label: string;
    value: string;
    trend?: number;
    sub?: string;
}

export default function StatCard({ label, value, trend, sub }: StatCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.label}>{label}</div>
            <div className={styles.value}>{value}</div>
            <div className={styles.sub}>
                {trend !== undefined && (
                    <span className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
                {sub && <span className={styles.subText}>{sub}</span>}
            </div>
        </div>
    );
}
