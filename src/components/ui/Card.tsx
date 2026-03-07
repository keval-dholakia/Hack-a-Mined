import styles from './Card.module.scss'

type Props = {
  title?: string
  children: React.ReactNode
  noPad?: boolean
  action?: React.ReactNode
  style?: React.CSSProperties
}

export default function Card({ title, children, noPad, action, style }: Props) {
  return (
    <div className={styles.card} style={{ ...style }}>
      {(title || action) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={noPad ? styles.bodyNoPad : styles.body}>
        {children}
      </div>
    </div>
  )
}