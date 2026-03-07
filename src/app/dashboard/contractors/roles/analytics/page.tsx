'use client'

import { contractorRoles } from '@/data/contractorMock'
import RoleAnalytics from '@/components/modules/contractors/RoleAnalytics'

export default function RoleAnalyticsPage() {
    return <RoleAnalytics roles={contractorRoles} />
}
