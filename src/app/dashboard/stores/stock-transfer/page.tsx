import { getStockTransfers } from '@/app/actions/stores'
import StockTransferList from '@/components/modules/stores/StockTransferList'

export const metadata = { title: 'Stock Transfer | Stores | TechMicra ERP' }

export default async function StockTransferPage() {
    const transfers = await getStockTransfers()
    return <StockTransferList transfers={transfers as any} />
}
