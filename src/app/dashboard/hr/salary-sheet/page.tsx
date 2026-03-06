import { getSalarySheets } from '@/app/actions/hr'
import SalarySheetList from '@/components/modules/hr/SalarySheetList'

export const metadata = { title: 'Salary Sheets | TechMicra ERP' }

export default async function SalarySheetPage() {
    const sheets = await getSalarySheets()
    return <SalarySheetList sheets={sheets as any} />
}
