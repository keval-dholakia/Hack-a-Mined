import { getCustomerById } from "@/app/actions/customers";
import CustomerForm from "@/components/modules/masters/CustomerForm";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const customer = await getCustomerById(Number(resolvedParams.id));
  if (!customer) notFound();

  return <CustomerForm customer={customer} />;
}
