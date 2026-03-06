import styles from './Button.module.scss'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = {
  children:   React.ReactNode
  variant?:   Variant
  onClick?:   () => void
  style?:     React.CSSProperties
  disabled?:  boolean
  type?:      'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  style,
  disabled,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  )
}