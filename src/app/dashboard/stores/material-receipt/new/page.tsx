import { getWarehousesForSelect } from '@/app/actions/warehouses'
import { getProductsForSelect, getStockTransfersForSelect } from '@/app/actions/stores'
import MaterialReceiptForm from '@/components/modules/stores/MaterialReceiptForm'

export const metadata = { title: 'New Material Receipt | TechMicra ERP' }

export default async function NewMaterialReceiptPage() {
    const [warehouses, products, transfers] = await Promise.all([
        getWarehousesForSelect(),
        getProductsForSelect(),
        getStockTransfersForSelect(),
    ])
    return (
        <MaterialReceiptForm
            warehouses={warehouses as any}
            products={products as any}
            transfers={transfers as any}
        />
    )
}
