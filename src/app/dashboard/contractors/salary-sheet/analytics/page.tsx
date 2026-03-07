'use client'

import { contractorSheets } from '@/data/contractorMock'
import SalarySheetAnalytics from '@/components/modules/contractors/SalarySheetAnalytics'

export default function SalarySheetAnalyticsPage() {
    return <SalarySheetAnalytics sheets={contractorSheets} />
}
