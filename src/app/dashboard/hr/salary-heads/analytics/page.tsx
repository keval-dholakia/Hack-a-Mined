import { getSalaryHeads } from '@/app/actions/hr'
import SalaryHeadAnalytics from '@/components/modules/hr/SalaryHeadAnalytics'

export const metadata = { title: 'Salary Head Analytics | TechMicra ERP' }

export default async function SalaryHeadAnalyticsPage() {
    const heads = await getSalaryHeads()
    return <SalaryHeadAnalytics heads={heads as any} />
}
