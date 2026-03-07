'use client'

import { contractorAdvances } from '@/data/contractorMock'
import AdvanceAnalytics from '@/components/modules/contractors/AdvanceAnalytics'

export default function AdvanceAnalyticsPage() {
    return <AdvanceAnalytics advances={contractorAdvances} />
}
