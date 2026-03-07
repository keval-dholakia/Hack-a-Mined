import { getAllEmployeesWithStructure } from '@/app/actions/hr'
import SalaryStructureAnalytics from '@/components/modules/hr/SalaryStructureAnalytics'

export const metadata = { title: 'Salary Structure Analytics | TechMicra ERP' }

export default async function SalaryStructureAnalyticsPage() {
    const employees = await getAllEmployeesWithStructure()
    return <SalaryStructureAnalytics employees={employees as any} />
}
