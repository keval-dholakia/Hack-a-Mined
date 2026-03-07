import { getTransportMasterById } from "@/app/actions/transport";
import TransportForm from "@/components/modules/masters/TransportForm";
import { notFound } from "next/navigation";

export default async function EditTransportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const transporter = await getTransportMasterById(Number(resolvedParams.id));
  if (!transporter) notFound();
  return <TransportForm transporter={transporter} />;
}
