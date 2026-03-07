import styles from './Table.module.scss'

type Column = {
  key:     string
  label:   string
  align?:  'l' | 'c' | 'r'
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

type Props = {
  columns: Column[]
  rows:    Record<string, unknown>[]
}

const ALIGN = { l: 'left', c: 'center', r: 'right' } as const

export default function Table({ columns, rows }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={styles.th}
                style={{ textAlign: ALIGN[col.align ?? 'l'] }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={styles.tr}>
              {columns.map(col => (
                <td
                  key={col.key}
                  className={styles.td}
                  style={{ textAlign: ALIGN[col.align ?? 'l'] }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] as React.ReactNode)
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}