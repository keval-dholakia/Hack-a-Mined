import { getPurchaseBillById } from "@/app/actions/purchase";
import { getVendorsForSelect } from "@/app/actions/vendors";
import { getGRNsForSelect } from "@/app/actions/purchase";
import PurchaseBillForm from "@/components/modules/purchase/PurchaseBillForm";
import { notFound } from "next/navigation";

export default async function EditBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [bill, vendors, grns] = await Promise.all([
    getPurchaseBillById(Number(resolvedParams.id)),
    getVendorsForSelect(),
    getGRNsForSelect(),
  ]);
  if (!bill) notFound();
  return <PurchaseBillForm bill={bill} vendors={vendors} grns={grns} />;
}
