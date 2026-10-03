import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProductoVendedorPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const seller = session?.user?.id ? await prisma.seller.findUnique({ where: { userId: session.user.id } }) : null;

  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product || !seller || product.sellerId !== seller.id) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Editar producto</h1>
      <div className="mt-6">
        <ProductForm
          product={serializeProduct(product)}
          basePath="/api/seller/products"
          redirectTo="/vendedor/productos"
        />
      </div>
    </div>
  );
}
