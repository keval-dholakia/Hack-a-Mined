import { getWarehousesForSelect } from '@/app/actions/warehouses'
import { getProductsForSelect } from '@/app/actions/stores'
import StockTransferForm from '@/components/modules/stores/StockTransferForm'

export const metadata = { title: 'New Stock Transfer | TechMicra ERP' }

export default async function NewStockTransferPage() {
    const [warehouses, products] = await Promise.all([
        getWarehousesForSelect(),
        getProductsForSelect(),
    ])
    return <StockTransferForm warehouses={warehouses as any} products={products as any} />
}
