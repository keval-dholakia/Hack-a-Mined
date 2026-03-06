import { getSalaryHeads } from '@/app/actions/hr'
import SalaryHeadMaster from '@/components/modules/hr/SalaryHeadMaster'

export const metadata = { title: 'Salary Head Master | TechMicra ERP' }

export default async function SalaryHeadsPage() {
    const heads = await getSalaryHeads()
    return <SalaryHeadMaster heads={heads as any} />
}
