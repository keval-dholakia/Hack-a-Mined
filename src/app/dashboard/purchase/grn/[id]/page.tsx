import { getGRNById, getPOsForSelect } from "@/app/actions/purchase";
import { getVendorsForSelect } from "@/app/actions/vendors";
import { getProductsForSelect } from "@/app/actions/products";
import { getWarehousesForSelect } from "@/app/actions/warehouses";
import GRNForm from "@/components/modules/purchase/GRNForm";
import { notFound } from "next/navigation";

export default async function EditGRNPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [grn, pos, vendors, products, warehouses] = await Promise.all([
    getGRNById(Number(resolvedParams.id)),
    getPOsForSelect(),
    getVendorsForSelect(),
    getProductsForSelect(),
    getWarehousesForSelect(),
  ]);
  if (!grn) notFound();
  return (
    <GRNForm
      grn={grn}
      pos={pos}
      vendors={vendors}
      products={products}
      warehouses={warehouses}
    />
  );
}
