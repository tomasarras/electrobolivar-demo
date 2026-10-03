import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/lib/demoData.mjs";
import { PROMOS } from "@/lib/demoPromos.mjs";

// Botón "Restablecer demo": borra todo el catálogo y las settings (transaccional)
// y vuelve a sembrar el catálogo base, para que cualquiera pueda romper la demo
// probando el panel de administrador y volver a un estado conocido.
export async function resetDemoData() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.productSpec.deleteMany(),
    prisma.product.deleteMany(),
    prisma.seller.deleteMany(),
    prisma.storeSettings.deleteMany(),
    prisma.promoImage.deleteMany(),
  ]);

  for (const { specs, ...p } of PRODUCTS) {
    await prisma.product.create({
      data: { ...p, specs: { create: (specs || []).map((s, order) => ({ ...s, order })) } },
    });
  }
  for (let i = 0; i < PROMOS.length; i++) {
    await prisma.promoImage.create({ data: { ...PROMOS[i], order: i } });
  }
}
