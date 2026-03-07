import { getEmployees } from '@/app/actions/hr'
import EmployeeAnalytics from '@/components/modules/hr/EmployeeAnalytics'

export const metadata = { title: 'Employee Analytics | TechMicra ERP' }

export default async function EmployeeAnalyticsPage() {
    const employees = await getEmployees()
    return <EmployeeAnalytics employees={employees as any} />
}
