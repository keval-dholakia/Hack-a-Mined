// src/app/_landing/LandingStack.tsx
import styles from './Landing.module.scss';

const STACK = [
    'Next.js 14', 'TypeScript', 'Supabase', 'PostgreSQL',
    'TanStack Query', 'Tailwind CSS', 'Supabase Auth',
    'Edge Functions', 'Row Level Security',
];

export default function LandingStack() {
    return (
        <div className={`${styles.stack} reveal`} id="stack">
            <span className={styles.stackLabel}>Tech Stack</span>
            <div className={styles.stackDivider} />
            <div className={styles.stackItems}>
                {STACK.map((item) => (
                    <span key={item} className={styles.stackItem}>{item}</span>
                ))}
            </div>
        </div>
    );
}