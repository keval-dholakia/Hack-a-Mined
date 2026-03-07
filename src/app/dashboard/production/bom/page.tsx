import { getBOMs } from '@/app/actions/production'
import BOMList from '@/components/modules/production/BOMList'

export default async function BOMPage() {
  const boms = await getBOMs()
  return <BOMList boms={boms} />
}