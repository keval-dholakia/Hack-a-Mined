import { getWarehouseById } from "@/app/actions/warehouses";
import WarehouseForm from "@/components/modules/masters/WarehouseForm";
import { notFound } from "next/navigation";

export default async function EditWarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const warehouse = await getWarehouseById(Number(resolvedParams.id));
  if (!warehouse) notFound();
  return <WarehouseForm warehouse={warehouse} />;
}
