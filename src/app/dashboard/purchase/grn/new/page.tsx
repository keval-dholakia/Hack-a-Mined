import { getPOsForSelect } from '@/app/actions/purchase'
import { getVendorsForSelect } from '@/app/actions/vendors'
import { getProductsForSelect } from '@/app/actions/products'
import { getWarehousesForSelect } from '@/app/actions/warehouses'
import GRNForm from '@/components/modules/purchase/GRNForm'

export default async function NewGRNPage() {
  const [pos, vendors, products, warehouses] = await Promise.all([
    getPOsForSelect(),
    getVendorsForSelect(),
    getProductsForSelect(),
    getWarehousesForSelect(),
  ])
  return <GRNForm pos={pos} vendors={vendors} products={products} warehouses={warehouses} />
}