import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
    title?: string;
    action?: ReactNode;
    noPad?: boolean;
    children: ReactNode;
}

export default function Card({ title, action, noPad = false, children }: CardProps) {
    return (
        <div className={styles.card}>
            {(title || action) && (
                <div className={styles.header}>
                    {title && <span className={styles.title}>{title}</span>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={`${styles.body} ${noPad ? styles.noPad : ''}`}>
                {children}
            </div>
        </div>
    );
}
