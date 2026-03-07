'use client'

// ─── DownloadButton.tsx ───────────────────────────────────────────────────────
// Styled download button with icon, loading state, and variant support
// Wraps around the existing Button styling patterns

import { useState } from 'react'

type Variant = 'list' | 'voucher' | 'analytics'

type Props = {
    /** Button label text */
    label?: string
    /** Visual variant — controls icon & default color */
    variant?: Variant
    /** Async function to execute on click. Button shows loading state. */
    onClick: () => void | Promise<void>
    /** Custom inline styles */
    style?: React.CSSProperties
    /** Disable the button */
    disabled?: boolean
}

const ICON: Record<Variant, string> = {
    list: '📄',
    voucher: '🧾',
    analytics: '📊',
}

const DEFAULT_LABEL: Record<Variant, string> = {
    list: 'Download PDF',
    voucher: 'Download',
    analytics: 'Export Report',
}

const VARIANT_COLOR: Record<Variant, string> = {
    list: '#6366f1',
    voucher: '#34d399',
    analytics: '#22d3ee',
}

export default function DownloadButton({
    label,
    variant = 'list',
    onClick,
    style,
    disabled,
}: Props) {
    const [loading, setLoading] = useState(false)

    async function handleClick() {
        if (loading || disabled) return
        setLoading(true)
        try {
            await onClick()
        } catch (err) {
            console.error('[DownloadButton]', err)
        } finally {
            setLoading(false)
        }
    }

    const color = VARIANT_COLOR[variant]
    const icon = ICON[variant]
    const text = label ?? DEFAULT_LABEL[variant]

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading || disabled}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                cursor: loading || disabled ? 'not-allowed' : 'pointer',
                border: `1px solid ${color}25`,
                background: `${color}12`,
                color: color,
                transition: 'all 0.15s ease',
                opacity: loading || disabled ? 0.6 : 1,
                whiteSpace: 'nowrap',
                ...style,
            }}
            onMouseEnter={e => {
                if (!loading && !disabled) {
                    e.currentTarget.style.background = `${color}25`
                    e.currentTarget.style.borderColor = `${color}40`
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = `${color}12`
                e.currentTarget.style.borderColor = `${color}25`
            }}
        >
            {loading ? (
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '0.85rem' }}>⏳</span>
            ) : (
                <span style={{ fontSize: '0.85rem' }}>{icon}</span>
            )}
            {loading ? 'Generating...' : text}
        </button>
    )
}
