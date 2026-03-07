import { getVendors } from '@/app/actions/vendors'
import VendorAnalytics from '@/components/modules/masters/VendorAnalytics'

export const metadata = { title: 'Vendor Analytics | TechMicra ERP' }

export default async function VendorAnalyticsPage() {
    const vendors = await getVendors()
    return <VendorAnalytics vendors={vendors as any} />
}
