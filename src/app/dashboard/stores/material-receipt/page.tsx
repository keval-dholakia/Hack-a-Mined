import { getMaterialReceipts } from '@/app/actions/stores'
import MaterialReceiptList from '@/components/modules/stores/MaterialReceiptList'

export const metadata = { title: 'Material Receipt | Stores | TechMicra ERP' }

export default async function MaterialReceiptPage() {
    const receipts = await getMaterialReceipts()
    return <MaterialReceiptList receipts={receipts as any} />
}
