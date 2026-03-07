import { getAllEmployeesWithStructure, getSalaryHeads } from '@/app/actions/hr'
import SalarySheetForm from '@/components/modules/hr/SalarySheetForm'

export const metadata = { title: 'New Salary Sheet | TechMicra ERP' }

export default async function NewSalarySheetPage() {
    const [employees, salaryHeads] = await Promise.all([
        getAllEmployeesWithStructure(),
        getSalaryHeads(),
    ])
    return <SalarySheetForm employees={employees as any} salaryHeads={salaryHeads as any} />
}
