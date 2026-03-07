import { getOpeningStocks } from '@/app/actions/stores'
import OpeningStockList from '@/components/modules/stores/OpeningStockList'

export const metadata = { title: 'Opening Stock | Stores | TechMicra ERP' }

export default async function OpeningStockPage() {
    const rows = await getOpeningStocks()
    return <OpeningStockList rows={rows as any} />
}
