import { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
    label: string;
    required?: boolean;
    children: ReactNode;
}

export default function Field({ label, required, children }: FieldProps) {
    return (
        <div className={styles.field}>
            <label className={styles.label}>
                {label}
                {required && <span className={styles.req}>*</span>}
            </label>
            {children}
        </div>
    );
}
