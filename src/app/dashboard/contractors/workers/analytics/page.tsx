'use client'

import { contractorWorkers } from '@/data/contractorMock'
import WorkerAnalytics from '@/components/modules/contractors/WorkerAnalytics'

export default function WorkerAnalyticsPage() {
    return <WorkerAnalytics workers={contractorWorkers} />
}
