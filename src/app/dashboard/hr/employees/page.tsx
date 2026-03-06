import { getEmployees } from '@/app/actions/hr'
import EmployeeList from '@/components/modules/hr/EmployeeList'

export const metadata = { title: 'Employees | TechMicra ERP' }

export default async function EmployeesPage() {
    const employees = await getEmployees()
    return <EmployeeList employees={employees as any} />
}
