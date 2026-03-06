'use client';

import styles from './Tabs.module.css';

interface TabsProps {
    tabs: string[];
    active: string;
    onChange: (tab: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
    return (
        <div className={styles.tabs}>
            {tabs.map(t => (
                <button
                    key={t}
                    className={`${styles.tab} ${t === active ? styles.active : ''}`}
                    onClick={() => onChange(t)}
                >
                    {t}
                </button>
            ))}
        </div>
    );
}
