import { getAllEmployeesWithStructure } from '@/app/actions/hr'
import SalaryStructureList from '@/components/modules/hr/SalaryStructureList'

export const metadata = { title: 'Salary Structure | TechMicra ERP' }

export default async function SalaryStructurePage() {
    const employees = await getAllEmployeesWithStructure()
    return <SalaryStructureList employees={employees as any} />
}
