'use client'

import { contractorPayments } from '@/data/contractorMock'
import PaymentAnalytics from '@/components/modules/contractors/PaymentAnalytics'

export default function PaymentAnalyticsPage() {
    return <PaymentAnalytics payments={contractorPayments} />
}
