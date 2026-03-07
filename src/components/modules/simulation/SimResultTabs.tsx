// src/app/dashboard/simulation/_components/SimResultTabs.tsx
// CHANGED: Added 'AI Insight' tab + AIInsightTab import

import type { SimResult } from '@/types/simulation';
import type { MPSRow } from '@/types/simulation';
import MRPTab from './tabs/MRPtab';
import CRPTab from './tabs/CRPTab';
import CostingTab from './tabs/CostingTab';
import RoutingTab from './tabs/RoutingTab';
import AIInsightTab from './tabs/AIInsightTab';       // ← NEW
import styles from './SimResultTabs.module.scss';

const TABS = ['MRP', 'CRP', 'Costing', 'Routing', 'AI Insight'] as const;  // ← NEW
type TabName = typeof TABS[number];

interface SimResultTabsProps {
    result: SimResult;
    activeTab: string;
    onTabChange: (tab: string) => void;
    workers: number;
    shift: number;
    start: string;
    laborRate: number;
    energyRate: number;
    mpsArr: MPSRow[];
}

export default function SimResultTabs({
    result, activeTab, onTabChange,
    workers, shift, start,
    laborRate, energyRate, mpsArr,
}: SimResultTabsProps) {
    return (
        <div className={styles.container}>
            {/* Tab buttons */}
            <div role="tablist" className={styles.tabBar}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''} ${tab === 'AI Insight' ? styles.aiTab : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab === 'AI Insight' && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginRight: 5 }}>
                                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                                <circle cx="5.5" cy="5.5" r="2" fill="currentColor" opacity="0.6" />
                            </svg>
                        )}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <div role="tabpanel" className={styles.tabPanel}>
                {activeTab === 'MRP' && <MRPTab result={result} />}
                {activeTab === 'CRP' && <CRPTab result={result} workers={workers} shift={shift} start={start} />}
                {activeTab === 'Costing' && <CostingTab result={result} laborRate={laborRate} energyRate={energyRate} mpsArr={mpsArr} />}
                {activeTab === 'Routing' && <RoutingTab result={result} mpsArr={mpsArr} />}
                {activeTab === 'AI Insight' && <AIInsightTab result={result} />}  {/* ← NEW */}
            </div>
        </div>
    );
}