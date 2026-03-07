// ─── PDF Constants & Shared Configuration ────────────────────────────────────
// Used across all PDF generation utilities for consistent branding & styling

export const COMPANY = {
    name: 'TechMicra ERP',
    tagline: 'Enterprise Resource Planning',
    address: '123 Tech Court, Software Park, Surat, Gujarat – 395007',
    gstin: '24ABCDE1234F1Z5',
    phone: '+91 9876543210',
    email: 'admin@techmicra.com',
    website: 'www.techmicra.com',
    // Optional logo URL (publicly accessible). Leave empty string to disable.
    logo: '',
} as const

// ── Color palette (RGB tuples) ────────────────────────────────────────────────
export const PDF_COLORS = {
    primary: [99, 102, 241] as [number, number, number],   // #6366f1 (Indigo)
    secondary: [34, 211, 238] as [number, number, number],   // #22d3ee (Cyan)
    success: [52, 211, 153] as [number, number, number],   // #34d399 (Green)
    danger: [244, 63, 94] as [number, number, number],   // #f43f5e (Rose)
    warning: [250, 204, 21] as [number, number, number],   // #facc15 (Amber)
    dark: [15, 17, 23] as [number, number, number],   // #0f1117
    darkCard: [19, 21, 31] as [number, number, number],   // #13151f
    border: [31, 34, 53] as [number, number, number],   // #1f2235
    textPrimary: [232, 234, 240] as [number, number, number],  // #e8eaf0
    textMuted: [107, 114, 128] as [number, number, number],  // #6b7280
    white: [255, 255, 255] as [number, number, number],
    black: [0, 0, 0] as [number, number, number],
    headerBg: [30, 41, 82] as [number, number, number],   // Dark navy header
    stripeBg: [245, 247, 250] as [number, number, number],  // Light stripe for rows
} as const

// ── Page dimensions (A4 in mm) ────────────────────────────────────────────────
export const PAGE = {
    width: 210,
    height: 297,
    margin: {
        top: 20,
        right: 14,
        bottom: 20,
        left: 14,
    },
    get contentWidth() { return this.width - this.margin.left - this.margin.right },
} as const

// ── Font sizes (pt) ──────────────────────────────────────────────────────────
export const FONT = {
    title: 16,
    subtitle: 11,
    heading: 12,
    body: 9,
    small: 7.5,
    tiny: 6.5,
} as const

// ── Formatting helpers ───────────────────────────────────────────────────────
export function fmtCurrency(n: number | string): string {
    const num = Number(n)
    if (isNaN(num)) return '—'
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function fmtCurrencyShort(n: number | string): string {
    const num = Number(n)
    if (isNaN(num)) return '—'
    if (num >= 10_00_000) return `₹${(num / 1_00_000).toFixed(1)}L`
    if (num >= 1_000) return `₹${(num / 1_000).toFixed(1)}K`
    return `₹${num.toLocaleString('en-IN')}`
}

export function fmtDate(d: string | Date | null | undefined): string {
    if (!d) return '—'
    const date = new Date(d)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(): string {
    return new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    })
}

/** Convert number to Indian words for vouchers */
export function numberToWords(n: number): string {
    if (n === 0) return 'Zero Rupees Only'
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    function convert(num: number): string {
        if (num < 20) return a[num]
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '')
        if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + convert(num % 100) : '')
        if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '')
        if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '')
        return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '')
    }
    return convert(Math.floor(Math.abs(n))).trim() + ' Rupees Only'
}
