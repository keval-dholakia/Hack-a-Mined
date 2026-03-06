import { getCustomers } from '@/app/actions/customers'
import CustomerAnalytics from '@/components/modules/masters/CustomerAnalytics'

export const metadata = { title: 'Customer Analytics | TechMicra ERP' }

export default async function CustomerAnalyticsPage() {
    const customers = await getCustomers()
    return <CustomerAnalytics customers={customers as any} />
}
