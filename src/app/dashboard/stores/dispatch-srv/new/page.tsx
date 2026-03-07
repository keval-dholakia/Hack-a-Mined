import { getProductsForSelect } from '@/app/actions/stores'
import DispatchSRVForm from '@/components/modules/stores/DispatchSRVForm'

export const metadata = { title: 'New Dispatch SRV | TechMicra ERP' }

export default async function NewDispatchSRVPage() {
    const products = await getProductsForSelect()
    return <DispatchSRVForm products={products as any} />
}
