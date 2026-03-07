import { getInvoiceById } from "@/app/actions/invoices";
import { getCustomersForSelect } from "@/app/actions/customers";
import { getProductsForSelect } from "@/app/actions/products";
import { getSaleOrdersForSelect } from "@/app/actions/saleOrders";
import InvoiceForm from "@/components/modules/sales/InvoiceForm";
import { notFound } from "next/navigation";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [invoice, customers, products, saleOrders] = await Promise.all([
    getInvoiceById(Number(resolvedParams.id)),
    getCustomersForSelect(),
    getProductsForSelect(),
    getSaleOrdersForSelect(),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceForm
      invoice={invoice}
      customers={customers}
      products={products}
      saleOrders={saleOrders}
    />
  );
}
