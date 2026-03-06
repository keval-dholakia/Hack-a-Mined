import styles from './Card.module.scss'

type Props = {
  title?:    string
  children:  React.ReactNode
  noPad?:    boolean
  action?:   React.ReactNode
}

export default function Card({ title, children, noPad, action }: Props) {
  return (
    <div className={styles.card}>
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