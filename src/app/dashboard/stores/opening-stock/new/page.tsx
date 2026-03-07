import { getWarehousesForSelect } from '@/app/actions/warehouses'
import { getProductsForSelect } from '@/app/actions/stores'
import OpeningStockForm from '@/components/modules/stores/OpeningStockForm'

export const metadata = { title: 'Add Opening Stock | TechMicra ERP' }

export default async function NewOpeningStockPage() {
    const [warehouses, products] = await Promise.all([
        getWarehousesForSelect(),
        getProductsForSelect(),
    ])
    return <OpeningStockForm warehouses={warehouses as any} products={products as any} />
}
