import { getSalarySheets } from '@/app/actions/hr'
import SalarySheetAnalytics from '@/components/modules/hr/SalarySheetAnalytics'

export const metadata = { title: 'Salary Sheet Analytics | TechMicra ERP' }

export default async function SalarySheetAnalyticsPage() {
    const sheets = await getSalarySheets()
    return <SalarySheetAnalytics sheets={sheets as any} />
}
