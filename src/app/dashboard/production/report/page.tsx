import { getProductionReports } from '@/app/actions/production'
import ProductionReportList from '@/components/modules/production/ProductionReportList'

export default async function ProductionReportPage() {
  const reports = await getProductionReports()
  return <ProductionReportList reports={reports} />
}