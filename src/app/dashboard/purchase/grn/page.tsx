import { getGRNs } from '@/app/actions/purchase'
import GRNList from '@/components/modules/purchase/GRNList'

export default async function GRNPage() {
  const grns = await getGRNs()
  return <GRNList grns={grns} />
}