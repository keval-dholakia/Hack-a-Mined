import { getCustomers } from '@/app/actions/customers'
import CustomerList from '@/components/modules/masters/CustomerList'

export default async function CustomersPage() {
  const customers = await getCustomers()
  return <CustomerList customers={customers} />
}