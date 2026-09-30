import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/lib/demoData.mjs";
import { PROMOS } from "@/lib/demoPromos.mjs";

// Botón "Restablecer demo": borra todo el catálogo y las settings (transaccional)
// y vuelve a sembrar el catálogo base, para que cualquiera pueda romper la demo
// probando el panel de administrador y volver a un estado conocido.
export async function resetDemoData() {
  await prisma.$transaction([
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.storeSettings.deleteMany(),
    prisma.promoImage.deleteMany(),
  ]);

  for (const p of PRODUCTS) {
    await prisma.product.create({ data: p });
  }
  for (let i = 0; i < PROMOS.length; i++) {
    await prisma.promoImage.create({ data: { ...PROMOS[i], order: i } });
  }
}
