'use client'

import { contractorStructures } from '@/data/contractorMock'
import SalaryStructureAnalytics from '@/components/modules/contractors/SalaryStructureAnalytics'

export default function SalaryStructureAnalyticsPage() {
    return <SalaryStructureAnalytics structures={contractorStructures} />
}
