import IQC from '@/components/modules/quality/IQC'
import { getGRNsForSelect } from '@/app/actions/quality'

export default async function IQCPage() {
  // Fetch live GRNs from Supabase; fall back to [] if unavailable
  const grns = await getGRNsForSelect().catch(() => [])
  return <IQC initialGRNs={grns} />
}
