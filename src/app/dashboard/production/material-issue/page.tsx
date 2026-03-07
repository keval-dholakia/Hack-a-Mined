import { getMaterialIssues } from '@/app/actions/production'
import MaterialIssueList from '@/components/modules/production/MaterialIssueList'

export default async function MaterialIssuePage() {
  const issues = await getMaterialIssues()
  return <MaterialIssueList issues={issues} />
}