import { getInquiryById } from "@/app/actions/inquiries";
import { getCustomersForSelect } from "@/app/actions/customers";
import { getProductsForSelect } from "@/app/actions/products";
import { getSessionUser } from "@/app/actions/auth";
import InquiryForm from "@/components/modules/sales/InquiryForm";
import { notFound } from "next/navigation";

export default async function EditInquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [inquiry, customers, products, user] = await Promise.all([
    getInquiryById(Number(resolvedParams.id)),
    getCustomersForSelect(),
    getProductsForSelect(),
    getSessionUser(),
  ]);

  if (!inquiry) notFound();

  return (
    <InquiryForm
      inquiry={inquiry}
      customers={customers}
      products={products}
      currentUser={user}
    />
  );
}
