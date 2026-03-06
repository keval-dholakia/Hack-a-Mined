import { getProducts } from '@/app/actions/products'
import ProductAnalytics from '@/components/modules/masters/ProductAnalytics'

export const metadata = { title: 'Product Analytics | TechMicra ERP' }

export default async function ProductAnalyticsPage() {
    const products = await getProducts()
    return <ProductAnalytics products={products as any} />
}
