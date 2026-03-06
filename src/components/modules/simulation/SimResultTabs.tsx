// src/app/dashboard/simulation/_components/SimResultTabs.tsx
// Tab navigation for the 4 result views: MRP, CRP, Costing, Routing.
// Each tab is its own component imported below.

import type { SimResult } from '@/types/simulation';
import type { MPSRow } from '@/types/simulation';
import MRPTab from './tabs/MRPtab';
import CRPTab from './tabs/CRPTab';
import CostingTab from './tabs/CostingTab';
import RoutingTab from './tabs/RoutingTab';
import styles from './SimResultTabs.module.scss';

const TABS = ['MRP', 'CRP', 'Costing', 'Routing'] as const;
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
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <div role="tabpanel" className={styles.tabPanel}>
                {activeTab === 'MRP' && <MRPTab result={result} />}
                {activeTab === 'CRP' && (
                    <CRPTab
                        result={result}
                        workers={workers}
                        shift={shift}
                        start={start}
                    />
                )}
                {activeTab === 'Costing' && (
                    <CostingTab
                        result={result}
                        laborRate={laborRate}
                        energyRate={energyRate}
                        mpsArr={mpsArr}
                    />
                )}
                {activeTab === 'Routing' && (
                    <RoutingTab result={result} mpsArr={mpsArr} />
                )}
            </div>
        </div>
    );
}