import { getAllEmployeesWithStructure, getSalaryHeads } from '@/app/actions/hr'
import SalaryStructureForm from '@/components/modules/hr/SalaryStructureForm'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit Structure | TechMicra ERP' }

export default async function EditStructurePage({ params }: Props) {
    const { id } = await params
    const [employees, salaryHeads] = await Promise.all([
        getAllEmployeesWithStructure(),
        getSalaryHeads(),
    ])

    const employee = employees.find((e: any) => e.id === Number(id))
    if (!employee) notFound()

    return <SalaryStructureForm employee={employee} salaryHeads={salaryHeads as any} />
}
