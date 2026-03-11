'use client';

import { useCallback, useState, type ReactNode } from 'react';
import type { SimResult } from '@/types/simulation';
import { fetchGeminiInsights } from '@/lib/geminiInsights';
import styles from './AIInsightTab.module.scss';

interface Props {
    result: SimResult;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

function renderInsight(raw: string): ReactNode {
    const lines = raw.split('\n');

    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className={styles.spacer} />;

        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            const text = trimmed.slice(2, -2);
            return (
                <h3 key={i} className={styles.insightHeading}>
                    {text}
                </h3>
            );
        }

        const withBold = trimmed.split(/(\*\*[^*]+\*\*)/).map((chunk, j) => {
            if (chunk.startsWith('**') && chunk.endsWith('**')) {
                return <strong key={j}>{chunk.slice(2, -2)}</strong>;
            }
            return chunk;
        });

        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('\u2022')) {
            return (
                <div key={i} className={styles.bulletRow}>
                    <span className={styles.bullet}>-</span>
                    <p className={styles.bulletText}>{withBold}</p>
                </div>
            );
        }

        if (/^\d+\./.test(trimmed)) {
            return (
                <div key={i} className={styles.bulletRow}>
                    <span className={styles.num}>{trimmed.match(/^\d+/)?.[0]}.</span>
                    <p className={styles.bulletText}>{withBold.slice(1)}</p>
                </div>
            );
        }

        return (
            <p key={i} className={styles.para}>
                {withBold}
            </p>
        );
    });
}

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
                <p className={styles.idleTitle}>AI Feasibility Insight Ready</p>
                <p className={styles.idleSub}>
                    Gemini embeds your simulation run, GST data, stock position, and related ERP context
                    before generating a production-feasibility plan with sales-based cost and profit projections.
                </p>

                <div className={styles.previewCards}>
                    {[
                        { num: '01', label: 'Feasibility Verdict', desc: 'GO / CONDITIONAL GO / NO-GO with main constraint' },
                        { num: '02', label: 'Production Plan', desc: 'Procurement, scheduling, quality, and dispatch actions' },
                        { num: '03', label: 'Sales Cost Profit', desc: 'Scenario-wise projected sales, cost, and profitability' },
                        { num: '04', label: 'GST Stock ERP Impact', desc: 'Tax, inventory, working capital, and risk implications' },
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
                    Generate Feasibility Insight
                </button>

                <p className={styles.apiNote}>
                    Uses Gemini 2.5 Flash + gemini-embedding-001 · <code>NEXT_PUBLIC_GEMINI_API_KEY</code>
                </p>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className={styles.loadingWrap}>
                <div className={styles.loadingSpinner} />
                <p className={styles.loadingTitle}>Building production feasibility analysis...</p>
                <p className={styles.loadingSub}>
                    Gemini is embedding simulation and ERP context before generating the production plan.
                </p>
                <div className={styles.loadingSteps}>
                    {[
                        'Embedding simulation run and query prompt',
                        'Embedding GST, stock, and ERP datasets',
                        'Ranking semantically relevant planning context',
                        'Generating production plan and profit projection',
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

    if (status === 'error') {
        return (
            <div className={styles.errorWrap}>
                <div className={styles.errorIcon}>!</div>
                <p className={styles.errorTitle}>Gemini API Error</p>
                <p className={styles.errorMsg}>{error}</p>
                <div className={styles.errorActions}>
                    <button className={styles.retryBtn} onClick={handleGenerate}>Retry</button>
                    <button className={styles.ghostBtn} onClick={handleReset}>Cancel</button>
                </div>
                <div className={styles.errorHint}>
                    <p>Common causes:</p>
                    <ul>
                        <li><code>NEXT_PUBLIC_GEMINI_API_KEY</code> not set in <code>.env.local</code></li>
                        <li>API key does not have access to Gemini generation or embedding models</li>
                        <li>Network issue in development</li>
                        <li>Embedding or generation request timed out (retry once)</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.resultWrap}>
            <div className={styles.resultHeader}>
                <div className={styles.resultHeaderLeft}>
                    <span className={styles.geminiTag}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="var(--accent)" strokeWidth="1.2" />
                            <circle cx="5" cy="5" r="2" fill="var(--accent)" />
                        </svg>
                        Gemini 2.5 Flash
                    </span>
                    <span className={styles.resultTitle}>Production Feasibility Briefing</span>
                </div>
                <div className={styles.resultHeaderRight}>
                    <button className={styles.regenBtn} onClick={handleGenerate} title="Regenerate">
                        Regenerate
                    </button>
                    <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(insight)} title="Copy to clipboard">
                        Copy
                    </button>
                    <button className={styles.ghostBtn} onClick={handleReset} title="Clear">
                        Clear
                    </button>
                </div>
            </div>

            <div className={styles.insightBody}>
                {renderInsight(insight)}
            </div>

            <div className={styles.resultFooter}>
                AI-generated analysis. Validate sales assumptions, GST effects, and procurement lead times before execution.
            </div>
        </div>
    );
}
