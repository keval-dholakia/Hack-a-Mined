import { getReceiptVoucherById } from "@/app/actions/receiptVouchers";
import { getCustomersForSelect } from "@/app/actions/customers";
import { getInvoicesForSelect } from "@/app/actions/invoices";
import ReceiptVoucherForm from "@/components/modules/sales/ReceiptVoucherForm";
import { notFound } from "next/navigation";

export default async function EditReceiptVoucherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [voucher, customers, invoices] = await Promise.all([
    getReceiptVoucherById(Number(resolvedParams.id)),
    getCustomersForSelect(),
    getInvoicesForSelect(),
  ]);

  if (!voucher) notFound();

  return (
    <ReceiptVoucherForm
      voucher={voucher}
      customers={customers}
      invoices={invoices}
    />
  );
}
