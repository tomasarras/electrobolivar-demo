import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({ params, searchParams }) {
  const { id } = await params;
  const { redirectTo } = await searchParams;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Editar producto</h1>
      <div className="mt-6">
        <ProductForm product={serializeProduct(product)} redirectTo={redirectTo || "/admin/productos"} />
      </div>
    </div>
  );
}
