import { getTransportMasters } from '@/app/actions/transport'
import TransportList from '@/components/modules/masters/TransportList'

export default async function TransportPage() {
  const transporters = await getTransportMasters()
  return <TransportList transporters={transporters} />
}