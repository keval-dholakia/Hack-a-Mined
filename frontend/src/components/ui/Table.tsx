import { ReactNode } from 'react';
import styles from './Table.module.css';

export interface Column<T = Record<string, unknown>> {
    key: string;
    label: string;
    align?: 'r' | 'c';
    render?: (value: unknown, row: T) => ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
    columns: Column<T>[];
    rows: T[];
    onRowClick?: (row: T) => void;
}

export default function Table<T extends Record<string, unknown>>({
    columns,
    rows,
    onRowClick,
}: TableProps<T>) {
    return (
        <div className={styles.wrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className={col.align ? styles[col.align] : ''}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.c}>
                                <div className="empty">No records found</div>
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr
                                key={i}
                                onClick={() => onRowClick?.(row)}
                                style={{ cursor: onRowClick ? 'pointer' : undefined }}
                            >
                                {columns.map(col => (
                                    <td key={col.key} className={col.align ? styles[col.align] : ''}>
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : (row[col.key] ?? '-') as ReactNode}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
