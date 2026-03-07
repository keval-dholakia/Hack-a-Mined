import styles from './Badge.module.scss'

type Variant = 'default' | 'warning' | 'info' | 'success' | 'danger'

type Props = {
  label:    string
  variant?: Variant
}

export default function Badge({ label, variant = 'default' }: Props) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {label}
    </span>
  )
}