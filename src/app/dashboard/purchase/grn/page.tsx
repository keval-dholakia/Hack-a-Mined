import { getGRNsWithItems } from '@/app/actions/purchase'
import GRNList from '@/components/modules/purchase/GRNList'

export default async function GRNPage() {
  const grns = await getGRNsWithItems()
  return <GRNList grns={grns} />
}