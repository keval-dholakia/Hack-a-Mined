import styles from './StatCard.module.scss'

type Props = {
  label: string
  value: string
  trend: number
  sub:   string
}

export default function StatCard({ label, value, trend, sub }: Props) {
  const positive = trend >= 0

  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <div className={styles.footer}>
        <span className={`${styles.trend} ${positive ? styles.up : styles.down}`}>
          {positive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className={styles.sub}>{sub}</span>
      </div>
    </div>
  )
}