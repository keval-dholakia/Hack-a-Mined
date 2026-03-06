import { getSaleOrderById } from "@/app/actions/saleOrders";
import { getCustomersForSelect } from "@/app/actions/customers";
import { getProductsForSelect } from "@/app/actions/products";
import { getInquiriesForSelect } from "@/app/actions/inquiries";
import { getTransportForSelect } from "@/app/actions/transport";
import SaleOrderForm from "@/components/modules/sales/SaleOrderForm";
import { notFound } from "next/navigation";

export default async function EditSaleOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [so, customers, products, inquiries, transporters] = await Promise.all([
    getSaleOrderById(Number(resolvedParams.id)),
    getCustomersForSelect(),
    getProductsForSelect(),
    getInquiriesForSelect(),
    getTransportForSelect(),
  ]);

  if (!so) notFound();

  return (
    <SaleOrderForm
      saleOrder={so}
      customers={customers}
      products={products}
      inquiries={inquiries}
      transporters={transporters}
    />
  );
}
