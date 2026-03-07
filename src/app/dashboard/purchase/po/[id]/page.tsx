import { getPurchaseOrderById } from "@/app/actions/purchase";
import { getVendorsForSelect } from "@/app/actions/vendors";
import { getProductsForSelect } from "@/app/actions/products";
import POForm from "@/components/modules/purchase/POForm";
import { notFound } from "next/navigation";

export default async function EditPOPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [po, vendors, products] = await Promise.all([
    getPurchaseOrderById(Number(resolvedParams.id)),
    getVendorsForSelect(),
    getProductsForSelect(),
  ]);
  if (!po) notFound();
  return <POForm po={po} vendors={vendors} products={products} />;
}
