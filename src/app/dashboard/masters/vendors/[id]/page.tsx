import { getVendorById } from "@/app/actions/vendors";
import VendorForm from "@/components/modules/masters/VendorForm";
import { notFound } from "next/navigation";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const vendor = await getVendorById(Number(resolvedParams.id));
  if (!vendor) notFound();
  return <VendorForm vendor={vendor} />;
}
