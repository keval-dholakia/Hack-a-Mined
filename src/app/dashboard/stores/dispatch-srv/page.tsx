import { getDispatchSRVs } from '@/app/actions/stores'
import DispatchSRVList from '@/components/modules/stores/DispatchSRVList'

export const metadata = { title: 'Dispatch SRV | Stores | TechMicra ERP' }

export default async function DispatchSRVPage() {
    const srvs = await getDispatchSRVs()
    return <DispatchSRVList srvs={srvs as any} />
}
