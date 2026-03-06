import { getEmployeeById } from '@/app/actions/hr'
import EmployeeForm from '@/components/modules/hr/EmployeeForm'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit Employee | TechMicra ERP' }

export default async function EditEmployeePage({ params }: Props) {
    const { id } = await params
    const employee = await getEmployeeById(Number(id))
    if (!employee) notFound()
    return <EmployeeForm employee={employee as any} />
}
