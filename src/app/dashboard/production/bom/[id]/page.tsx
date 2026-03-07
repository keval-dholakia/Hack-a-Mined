import { getBOMById } from '@/app/actions/production'
import { getProductsForSelect } from '@/app/actions/products'
import BOMForm from '@/components/modules/production/BOMForm'
import { notFound } from 'next/navigation'

export default async function EditBOMPage({ params }: { params: { id: string } }) {
  const [bom, products] = await Promise.all([
    getBOMById(Number(params.id)),
    getProductsForSelect(),
  ])
  if (!bom) notFound()
  return <BOMForm bom={bom} products={products} />
}