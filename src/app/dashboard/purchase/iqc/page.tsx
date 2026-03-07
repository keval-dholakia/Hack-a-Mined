import { getIQCEntries } from '@/app/actions/purchase'
import IQCList from '@/components/modules/purchase/IQCList'

export default async function IQCPage() {
  const entries = await getIQCEntries()
  return <IQCList entries={entries} />
}