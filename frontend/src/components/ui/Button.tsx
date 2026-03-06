import { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: 'sm';
    icon?: string;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size,
    icon,
    children,
    className = '',
    ...rest
}: ButtonProps) {
    const cls = [
        styles.btn,
        styles[variant],
        size === 'sm' ? styles.sm : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={cls} {...rest}>
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
}
