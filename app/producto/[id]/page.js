import { notFound } from "next/navigation";
import Link from "next/link";
import { Store, ChevronRight, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import StoreHeader from "@/components/StoreHeader";
import ProductGallery from "@/components/ProductGallery";
import AddToCartPanel from "@/components/AddToCartPanel";
import FavoriteButton from "@/components/FavoriteButton";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import ProductComplaintForm from "@/components/ProductComplaintForm";
import { averageRating } from "@/lib/reviews";
import { totalSold } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      specs: { orderBy: { order: "asc" } },
      seller: { select: { id: true, storeName: true, flaggedFraud: true } },
      reviews: { orderBy: { createdAt: "desc" } },
      orderItems: { select: { qty: true } },
    },
  });

  if (!product) notFound();

  const avgRating = averageRating(product.reviews);
  const salesCount = totalSold(product.orderItems);

  const vehicleSpecs = [
    product.vehicleBrand && { label: "Marca", value: product.vehicleBrand },
    product.vehicleModel && { label: "Modelo", value: product.vehicleModel },
    product.vehicleYear && { label: "Año", value: String(product.vehicleYear) },
    (product.vehicleKm || product.vehicleKm === 0) && { label: "Kilómetros", value: `${product.vehicleKm.toLocaleString("es-AR")} km` },
    product.vehicleColor && { label: "Color", value: product.vehicleColor },
  ].filter(Boolean);

  const propertySpecs = [
    product.propertyOperation && { label: "Operación", value: product.propertyOperation === "alquiler" ? "Alquiler" : "Venta" },
    product.propertyLocation && { label: "Ubicación", value: product.propertyLocation },
    (product.propertyRooms || product.propertyRooms === 0) && { label: "Ambientes", value: String(product.propertyRooms) },
    (product.propertyBedrooms || product.propertyBedrooms === 0) && { label: "Dormitorios", value: String(product.propertyBedrooms) },
    (product.propertyBathrooms || product.propertyBathrooms === 0) && { label: "Baños", value: String(product.propertyBathrooms) },
    (product.propertyCoveredArea || product.propertyCoveredArea === 0) && {
      label: "Superficie cubierta",
      value: `${product.propertyCoveredArea.toLocaleString("es-AR")} m²`,
    },
    (product.propertyTotalArea || product.propertyTotalArea === 0) && {
      label: "Superficie total",
      value: `${product.propertyTotalArea.toLocaleString("es-AR")} m²`,
    },
    (product.propertyTotalUnits || product.propertyTotalUnits === 0) && {
      label: "Unidades totales",
      value: String(product.propertyTotalUnits),
    },
  ].filter(Boolean);

  const phoneSpecs = [
    product.phoneBrand && { label: "Marca", value: product.phoneBrand },
    product.phoneModel && { label: "Modelo", value: product.phoneModel },
    product.phoneStorage && { label: "Memoria interna", value: product.phoneStorage },
    product.phoneRam && { label: "Memoria RAM", value: product.phoneRam },
    product.phoneNetwork && { label: "Red móvil", value: product.phoneNetwork },
    product.phoneColor && { label: "Color", value: product.phoneColor },
    product.phoneCamera && { label: "Cámara", value: product.phoneCamera },
  ].filter(Boolean);

  const clothingSpecs = [
    product.clothingBrand && { label: "Marca", value: product.clothingBrand },
    product.clothingGender && { label: "Género", value: product.clothingGender },
    product.clothingSize && { label: "Talle", value: product.clothingSize },
    product.clothingColor && { label: "Color", value: product.clothingColor },
    product.clothingFit && { label: "Forma del calce", value: product.clothingFit },
    product.clothingAge && { label: "Edad", value: product.clothingAge },
    product.clothingMaterial && { label: "Material principal", value: product.clothingMaterial },
    product.clothingSleeve && { label: "Tipo de manga", value: product.clothingSleeve },
    product.clothingNeckline && { label: "Tipo de cuello", value: product.clothingNeckline },
    product.clothingAccessories && { label: "Accesorios", value: product.clothingAccessories },
  ].filter(Boolean);

  const beautySpecs = [
    product.beautyCategory && { label: "Categoría", value: product.beautyCategory },
    product.beautyBrand && { label: "Marca", value: product.beautyBrand },
  ].filter(Boolean);

  const homeSpecs = [
    product.homeColor && { label: "Color", value: product.homeColor },
    product.homeBrand && { label: "Marca", value: product.homeBrand },
    product.homeSaleFormat && { label: "Formato de venta", value: product.homeSaleFormat },
  ].filter(Boolean);

  const laundrySpecs = [
    product.laundryBrand && { label: "Marca", value: product.laundryBrand },
    product.laundryColor && { label: "Color", value: product.laundryColor },
  ].filter(Boolean);

  const techSpecs = [
    product.techCategory && { label: "Categoría", value: product.techCategory },
    product.techBrand && { label: "Marca", value: product.techBrand },
    product.techColor && { label: "Color", value: product.techColor },
  ].filter(Boolean);

  let sellerStats = null;
  let otherSellerProducts = [];
  if (product.seller) {
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: product.seller.id },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        seller: { select: { storeName: true } },
        reviews: { select: { rating: true } },
        orderItems: { select: { qty: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    sellerStats = {
      productCount: sellerProducts.length,
      avgRating: averageRating(sellerProducts.flatMap((p) => p.reviews)),
    };
    otherSellerProducts = sellerProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} category={product.category} />
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs uppercase tracking-wide text-steel">{categoryLabel(product.category)}</p>
                  {product.condition === "usado" && (
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-steel">
                      Usado
                    </span>
                  )}
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold">{product.name}</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <FavoriteButton product={product} size={40} />
                <ProductComplaintForm productId={product.id} hasSeller={Boolean(product.seller)} size={40} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <p className="font-mono text-xl font-semibold">{formatCurrency(product.price, product.currency)}</p>
              {product.installments && <p className="font-mono text-sm text-accent-2">{product.installments}</p>}
            </div>
            {product.seller ? (
              <Link
                href={`/tienda/vendedores/${product.seller.id}`}
                className="mt-3 flex items-center gap-3 rounded-md border border-line bg-panel p-3 transition hover:border-steel"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                  <Store size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {product.seller.storeName}
                    {product.seller.flaggedFraud && (
                      <TriangleAlert size={13} className="shrink-0 text-danger" />
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-steel">
                    {sellerStats?.avgRating && (
                      <span className="flex items-center gap-1">
                        <StarRating value={sellerStats.avgRating} readOnly size={12} />
                        {sellerStats.avgRating.toFixed(1)}
                      </span>
                    )}
                    <span>
                      {sellerStats?.productCount} {sellerStats?.productCount === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-mono text-xs uppercase tracking-wide text-steel">
                  Ver perfil
                  <ChevronRight size={14} />
                </span>
              </Link>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-steel">
                <Store size={14} />
                Vendido por BolivarMarket
              </p>
            )}
            {avgRating && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={avgRating} readOnly size={16} />
                <span className="text-sm text-steel">
                  {avgRating.toFixed(1)} ({salesCount} {salesCount === 1 ? "venta" : "ventas"})
                </span>
              </div>
            )}
            {product.description && <p className="mt-4 text-ink-soft">{product.description}</p>}
            <AddToCartPanel product={product} />

            {vehicleSpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos del vehículo</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {vehicleSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {propertySpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos de la propiedad</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {propertySpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {phoneSpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos del celular</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {phoneSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {clothingSpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos de la ropa</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {clothingSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {beautySpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos de belleza</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {beautySpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {homeSpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos del hogar</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {homeSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {laundrySpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos del electro</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {laundrySpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {techSpecs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Datos de tecnología</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {techSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {product.specs.length > 0 && (
              <div className="mt-6">
                <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Características</h2>
                <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-panel">
                  {product.specs.map((spec) => (
                    <div key={spec.id} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-ink-soft">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-12 max-w-2xl">
            <h2 className="font-display text-xl font-bold">Reseñas</h2>
            <ul className="mt-4 space-y-4">
              {product.reviews.map((review) => (
                <li key={review.id} className="rounded-md border border-line bg-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <StarRating value={review.rating} readOnly size={14} />
                    <span className="font-mono text-xs text-steel">
                      {new Date(review.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{review.buyerName || "Comprador verificado"}</p>
                  {review.comment && <p className="mt-1 text-sm text-ink-soft">{review.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {otherSellerProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Más productos de {product.seller.storeName}</h2>
              <Link
                href={`/tienda/vendedores/${product.seller.id}`}
                className="shrink-0 text-sm text-steel underline-offset-2 hover:text-accent hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {otherSellerProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
