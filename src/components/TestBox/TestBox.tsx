import styles from "./TestBox.module.scss"

export default function TestBox() {
  return (
    <div className={styles.container}>
      <h2>SCSS is Working</h2>
      <button>Test Button</button>
    </div>
  )
}