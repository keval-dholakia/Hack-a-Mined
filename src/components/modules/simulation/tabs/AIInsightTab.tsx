// src/app/dashboard/simulation/_components/tabs/AIInsightTab.tsx
// AI Insight tab — calls Gemini, renders structured markdown-style output.
// Handles loading, error, and idle states internally.

'use client';

import { useState, useCallback } from 'react';
import type { SimResult } from '@/types/simulation';
import { fetchGeminiInsights } from '@/lib/geminiInsights';
import styles from './AIInsightTab.module.scss';

interface Props {
    result: SimResult;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

// ── Markdown-lite renderer ────────────────────────────────────────────────────
// Gemini returns **bold** headings and bullet lists. We parse these minimally
// without pulling in a full markdown library.

function renderInsight(raw: string): React.ReactNode {
    const lines = raw.split('\n');

    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className={styles.spacer} />;

        // **Heading** lines
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            const text = trimmed.slice(2, -2);
            return (
                <h3 key={i} className={styles.insightHeading}>
                    {text}
                </h3>
            );
        }

        // Inline **bold** within a line
        const withBold = trimmed.split(/(\*\*[^*]+\*\*)/).map((chunk, j) => {
            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={j}>{chunk.slice(2, -2)}</strong>;
            }
            return chunk;
        });

        // Bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
                <div key={i} className={styles.bulletRow}>
                    <span className={styles.bullet}>—</span>
                    <p className={styles.bulletText}>{withBold}</p>
                </div>
            );
        }

        // Numbered list
        if (/^\d+\./.test(trimmed)) {
            return (
                <div key={i} className={styles.bulletRow}>
                    <span className={styles.num}>{trimmed.match(/^\d+/)?.[0]}.</span>
                    <p className={styles.bulletText}>{withBold.slice(1)}</p>
                </div>
            );
        }

        // Plain paragraph
        return (
            <p key={i} className={styles.para}>
                {withBold}
            </p>
        );
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIInsightTab({ result }: Props) {
    const [status, setStatus] = useState<Status>('idle');
    const [insight, setInsight] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        setStatus('loading');
        setInsight('');
        setError('');
        try {
            const text = await fetchGeminiInsights(result);
            setInsight(text);
            setStatus('done');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            setStatus('error');
        }
    }, [result]);

    const handleReset = () => {
        setStatus('idle');
        setInsight('');
        setError('');
    };

    // ── Idle state ──────────────────────────────────────────────────────────────
    if (status === 'idle') {
        return (
            <div className={styles.idleWrap}>
                <div className={styles.idleIcon}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="1" y="1" width="38" height="38" rx="2" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 3" />
                        <path d="M13 20h14M20 13v14" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
                        <circle cx="20" cy="20" r="5" stroke="var(--accent)" strokeWidth="1.4" />
                        <circle cx="20" cy="20" r="2" fill="var(--accent)" />
                    </svg>
                </div>
                <p className={styles.idleTitle}>AI Insight Ready</p>
                <p className={styles.idleSub}>
                    Gemini will analyse your simulation output — MRP shortages, capacity constraints,
                    cost breakdown — and return a structured management briefing.
                </p>

                {/* What to expect cards */}
                <div className={styles.previewCards}>
                    {[
                        { num: '01', label: 'Executive Summary', desc: 'Feasibility & top risk in 2–3 sentences' },
                        { num: '02', label: 'Material Procurement Actions', desc: 'Shortage items with urgency & cost impact' },
                        { num: '03', label: 'Capacity & Scheduling', desc: 'Timeline realism + specific remedies if overloaded' },
                        { num: '04', label: 'Cost Optimisation', desc: '2–3 actionable levers for this specific run' },
                    ].map((c) => (
                        <div key={c.num} className={styles.previewCard}>
                            <span className={styles.previewNum}>{c.num}</span>
                            <div>
                                <p className={styles.previewLabel}>{c.label}</p>
                                <p className={styles.previewDesc}>{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className={styles.generateBtn} onClick={handleGenerate}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
                        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    Generate AI Insight
                </button>

                <p className={styles.apiNote}>
                    Uses Gemini 1.5 Flash · <code>NEXT_PUBLIC_GEMINI_API_KEY</code>
                </p>
            </div>
        );
    }

    // ── Loading state ───────────────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className={styles.loadingWrap}>
                <div className={styles.loadingSpinner} />
                <p className={styles.loadingTitle}>Analysing simulation output…</p>
                <p className={styles.loadingSub}>
                    Gemini is reviewing your MRP, CRP, and cost data.
                </p>
                <div className={styles.loadingSteps}>
                    {[
                        'Reading material shortages',
                        'Evaluating capacity constraints',
                        'Calculating cost optimisations',
                        'Drafting management briefing',
                    ].map((step, i) => (
                        <div key={i} className={styles.loadingStep} style={{ animationDelay: `${i * 0.4}s` }}>
                            <span className={styles.loadingDot} style={{ animationDelay: `${i * 0.4}s` }} />
                            {step}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Error state ─────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className={styles.errorWrap}>
                <div className={styles.errorIcon}>⚠</div>
                <p className={styles.errorTitle}>Gemini API Error</p>
                <p className={styles.errorMsg}>{error}</p>
                <div className={styles.errorActions}>
                    <button className={styles.retryBtn} onClick={handleGenerate}>↺ Retry</button>
                    <button className={styles.ghostBtn} onClick={handleReset}>Cancel</button>
                </div>
                <div className={styles.errorHint}>
                    <p>Common causes:</p>
                    <ul>
                        <li><code>NEXT_PUBLIC_GEMINI_API_KEY</code> not set in <code>.env.local</code></li>
                        <li>API key does not have Gemini 1.5 Flash access</li>
                        <li>Network / CORS issue in development</li>
                    </ul>
                </div>
            </div>
        );
    }

    // ── Done state — render insight ─────────────────────────────────────────────
    return (
        <div className={styles.resultWrap}>

            {/* Header bar */}
            <div className={styles.resultHeader}>
                <div className={styles.resultHeaderLeft}>
                    <span className={styles.geminiTag}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="var(--accent)" strokeWidth="1.2" />
                            <circle cx="5" cy="5" r="2" fill="var(--accent)" />
                        </svg>
                        Gemini 1.5 Flash
                    </span>
                    <span className={styles.resultTitle}>Management Briefing</span>
                </div>
                <div className={styles.resultHeaderRight}>
                    <button className={styles.regenBtn} onClick={handleGenerate} title="Regenerate">
                        ↺ Regenerate
                    </button>
                    <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(insight)} title="Copy to clipboard">
                        Copy
                    </button>
                    <button className={styles.ghostBtn} onClick={handleReset} title="Clear">
                        Clear
                    </button>
                </div>
            </div>

            {/* Insight content */}
            <div className={styles.insightBody}>
                {renderInsight(insight)}
            </div>

            {/* Footer disclaimer */}
            <div className={styles.resultFooter}>
                AI-generated analysis. Verify material prices and lead times with procurement before actioning.
            </div>
        </div>
    );
}