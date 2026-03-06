import { getProductById } from "@/app/actions/products";
import ProductForm from "@/components/modules/masters/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductById(Number(resolvedParams.id));
  if (!product) notFound();
  return <ProductForm product={product} />;
}
