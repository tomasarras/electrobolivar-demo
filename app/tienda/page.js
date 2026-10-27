import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import PromoRail from "@/components/PromoRail";
import AdminAccessFooter from "@/components/AdminAccessFooter";
import { MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { serializePromo } from "@/lib/promos";
import SubcategorySearch from "@/components/SubcategorySearch";

export const dynamic = "force-dynamic";

export default async function TiendaPage({ searchParams }) {
  const { categoria, q, marca, modelo, anioMin, anioMax, kmMax, estado, subcategoria, miciudad } = await searchParams;
  const query = (q || "").trim();
  const words = query.split(/\s+/).filter(Boolean).slice(0, 6);
  const isVehicles = categoria === "vehiculos";
  const isElectro = categoria === "lavado";
  const isHogar = categoria === "climatizacion";
  const isBelleza = categoria === "pequenos";
  const isRopa = categoria === "ropa";
  const isTecnologia = categoria === "cocina";
  const isHerramientas = categoria === "herramientas";
  const isInmobiliaria = categoria === "inmobiliaria";

  const session = await getServerSession(authOptions);
  const buyer = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { locality: true } })
    : null;
  const buyerLocality = buyer?.locality || "";
  const showMyCity = miciudad === "1" && Boolean(buyerLocality);

  const where = {
    ...(categoria ? { category: categoria } : {}),
    ...(words.length
      ? {
          OR: words.flatMap((w) => [
            { name: { contains: w, mode: "insensitive" } },
            { description: { contains: w, mode: "insensitive" } },
          ]),
        }
      : {}),
    ...(isVehicles && marca ? { vehicleBrand: marca } : {}),
    ...(isVehicles && modelo ? { vehicleModel: modelo } : {}),
    ...(isVehicles && (anioMin || anioMax)
      ? {
          vehicleYear: {
            ...(anioMin ? { gte: Number(anioMin) } : {}),
            ...(anioMax ? { lte: Number(anioMax) } : {}),
          },
        }
      : {}),
    ...(isVehicles && kmMax ? { vehicleKm: { lte: Number(kmMax) } } : {}),
    ...(isVehicles && (estado === "nuevo" || estado === "usado") ? { condition: estado } : {}),
    ...(isElectro && subcategoria ? { laundryCategory: subcategoria } : {}),
    ...(isHogar && subcategoria ? { homeCategory: subcategoria } : {}),
    ...(isBelleza && subcategoria ? { beautyCategory: subcategoria } : {}),
    ...(isRopa && subcategoria ? { clothingCategory: subcategoria } : {}),
    ...(isTecnologia && subcategoria ? { techCategory: subcategoria } : {}),
    ...(isHerramientas && subcategoria ? { toolsCategory: subcategoria } : {}),
    ...(isInmobiliaria && subcategoria ? { propertyCategory: subcategoria } : {}),
    ...(showMyCity ? { location: { contains: buyerLocality, mode: "insensitive" } } : {}),
  };

  const [
    products,
    promoImages,
    vehicleBrands,
    vehicleModels,
    electroCategories,
    hogarCategories,
    bellezaCategories,
    ropaCategories,
    tecnologiaCategories,
    herramientasCategories,
    inmobiliariaCategories,
  ] = await Promise.all([
    prisma.product.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        images: { orderBy: { order: "asc" } },
        seller: { select: { storeName: true } },
        reviews: { select: { rating: true } },
        orderItems: { select: { qty: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.promoImage.findMany({ orderBy: { order: "asc" } }),
    isVehicles
      ? prisma.product.findMany({
          where: { category: "vehiculos", vehicleBrand: { not: null } },
          select: { vehicleBrand: true },
          distinct: ["vehicleBrand"],
          orderBy: { vehicleBrand: "asc" },
        })
      : [],
    isVehicles
      ? prisma.product.findMany({
          where: { category: "vehiculos", vehicleModel: { not: null } },
          select: { vehicleModel: true },
          distinct: ["vehicleModel"],
          orderBy: { vehicleModel: "asc" },
        })
      : [],
    isElectro
      ? prisma.product.findMany({
          where: { category: "lavado", laundryCategory: { not: null } },
          select: { laundryCategory: true },
          distinct: ["laundryCategory"],
          orderBy: { laundryCategory: "asc" },
        })
      : [],
    isHogar
      ? prisma.product.findMany({
          where: { category: "climatizacion", homeCategory: { not: null } },
          select: { homeCategory: true },
          distinct: ["homeCategory"],
          orderBy: { homeCategory: "asc" },
        })
      : [],
    isBelleza
      ? prisma.product.findMany({
          where: { category: "pequenos", beautyCategory: { not: null } },
          select: { beautyCategory: true },
          distinct: ["beautyCategory"],
          orderBy: { beautyCategory: "asc" },
        })
      : [],
    isRopa
      ? prisma.product.findMany({
          where: { category: "ropa", clothingCategory: { not: null } },
          select: { clothingCategory: true },
          distinct: ["clothingCategory"],
          orderBy: { clothingCategory: "asc" },
        })
      : [],
    isTecnologia
      ? prisma.product.findMany({
          where: { category: "cocina", techCategory: { not: null } },
          select: { techCategory: true },
          distinct: ["techCategory"],
          orderBy: { techCategory: "asc" },
        })
      : [],
    isHerramientas
      ? prisma.product.findMany({
          where: { category: "herramientas", toolsCategory: { not: null } },
          select: { toolsCategory: true },
          distinct: ["toolsCategory"],
          orderBy: { toolsCategory: "asc" },
        })
      : [],
    isInmobiliaria
      ? prisma.product.findMany({
          where: { category: "inmobiliaria", propertyCategory: { not: null } },
          select: { propertyCategory: true },
          distinct: ["propertyCategory"],
          orderBy: { propertyCategory: "asc" },
        })
      : [],
  ]);
  const promos = promoImages.map(serializePromo);

  const hiddenFilters = { q: query || undefined, categoria };
  const hasVehicleFilters = Boolean(marca || modelo || anioMin || anioMax || kmMax || estado);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6 xl:pb-10">
        <h1 className="font-display text-2xl font-bold">Catálogo</h1>
        {query && (
          <p className="mt-1 text-sm text-ink-soft">
            Resultados para <span className="font-semibold">&quot;{query}&quot;</span> ·{" "}
            <Link href={categoria ? `/tienda?categoria=${categoria}` : "/tienda"} className="underline hover:text-ink">
              Quitar búsqueda
            </Link>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/tienda"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              !categoria ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-soft hover:border-steel"
            }`}
          >
            Todos
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?categoria=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                categoria === c.slug ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-soft hover:border-steel"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {buyerLocality && (
          <div className="mt-3">
            <Link
              href={{
                pathname: "/tienda",
                query: { ...(categoria ? { categoria } : {}), ...(query ? { q: query } : {}), ...(showMyCity ? {} : { miciudad: "1" }) },
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${
                showMyCity ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-steel"
              }`}
            >
              <MapPin size={14} />
              Productos de mi ciudad ({buyerLocality})
            </Link>
          </div>
        )}

        <div
          className={`mt-8 ${
            isVehicles || isElectro || isHogar || isBelleza || isRopa || isTecnologia || isHerramientas || isInmobiliaria
              ? "flex items-start gap-4 sm:gap-6"
              : ""
          }`}
        >
          {isInmobiliaria && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="inmobiliaria"
                  q={query}
                  value={subcategoria || ""}
                  options={inmobiliariaCategories.map((c) => c.propertyCategory)}
                />
              </div>
            </aside>
          )}
          {isHerramientas && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="herramientas"
                  q={query}
                  value={subcategoria || ""}
                  options={herramientasCategories.map((c) => c.toolsCategory)}
                />
              </div>
            </aside>
          )}
          {isTecnologia && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="cocina"
                  q={query}
                  value={subcategoria || ""}
                  options={tecnologiaCategories.map((c) => c.techCategory)}
                />
              </div>
            </aside>
          )}
          {isRopa && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="ropa"
                  q={query}
                  value={subcategoria || ""}
                  options={ropaCategories.map((c) => c.clothingCategory)}
                />
              </div>
            </aside>
          )}
          {isBelleza && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="pequenos"
                  q={query}
                  value={subcategoria || ""}
                  options={bellezaCategories.map((c) => c.beautyCategory)}
                />
              </div>
            </aside>
          )}
          {isHogar && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="climatizacion"
                  q={query}
                  value={subcategoria || ""}
                  options={hogarCategories.map((c) => c.homeCategory)}
                />
              </div>
            </aside>
          )}
          {isElectro && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Buscar categoría</h2>
              <div className="mt-3">
                <SubcategorySearch
                  categoria="lavado"
                  q={query}
                  value={subcategoria || ""}
                  options={electroCategories.map((c) => c.laundryCategory)}
                />
              </div>
            </aside>
          )}
          {isVehicles && (
            <aside className="sticky top-24 w-36 shrink-0 self-start rounded-md border border-line bg-panel p-3 sm:w-56 sm:p-4">
              <h2 className="font-mono text-[11px] uppercase tracking-wide text-steel">Filtrar vehículos</h2>
              <form
                method="get"
                className="mt-3 space-y-3"
                key={`${marca || ""}|${modelo || ""}|${anioMin || ""}|${anioMax || ""}|${kmMax || ""}|${estado || ""}`}
              >
                {Object.entries(hiddenFilters).map(
                  ([key, value]) => value && <input key={key} type="hidden" name={key} value={value} />
                )}

                <VehicleField label="Marca">
                  <select name="marca" defaultValue={marca || ""} className="filter-input">
                    <option value="">Todas</option>
                    {vehicleBrands.map(({ vehicleBrand }) => (
                      <option key={vehicleBrand} value={vehicleBrand}>
                        {vehicleBrand}
                      </option>
                    ))}
                  </select>
                </VehicleField>

                <VehicleField label="Modelo">
                  <select name="modelo" defaultValue={modelo || ""} className="filter-input">
                    <option value="">Todos</option>
                    {vehicleModels.map(({ vehicleModel }) => (
                      <option key={vehicleModel} value={vehicleModel}>
                        {vehicleModel}
                      </option>
                    ))}
                  </select>
                </VehicleField>

                <VehicleField label="Año desde">
                  <input type="number" name="anioMin" defaultValue={anioMin || ""} placeholder="2010" className="filter-input" />
                </VehicleField>
                <VehicleField label="Año hasta">
                  <input type="number" name="anioMax" defaultValue={anioMax || ""} placeholder="2024" className="filter-input" />
                </VehicleField>

                <VehicleField label="Kilómetros máx.">
                  <input type="number" name="kmMax" defaultValue={kmMax || ""} placeholder="100000" className="filter-input" />
                </VehicleField>

                <VehicleField label="Estado">
                  <select name="estado" defaultValue={estado || ""} className="filter-input">
                    <option value="">Todos</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="usado">Usado</option>
                  </select>
                </VehicleField>

                <button
                  type="submit"
                  className="w-full rounded-md bg-ink py-2 text-sm font-semibold text-paper hover:brightness-110"
                >
                  Filtrar
                </button>
                {hasVehicleFilters && (
                  <Link
                    href={{ pathname: "/tienda", query: { categoria: "vehiculos", ...(query ? { q: query } : {}) } }}
                    className="block text-center text-xs text-ink-soft underline-offset-2 hover:text-accent hover:underline"
                  >
                    Limpiar filtros
                  </Link>
                )}
              </form>

              <style>{`
                .filter-input {
                  width: 100%;
                  border-radius: 0.375rem;
                  border: 1px solid var(--line);
                  background: var(--paper);
                  color: var(--ink);
                  padding: 0.45rem 0.55rem;
                  font-size: 0.85rem;
                }
              `}</style>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {products.length === 0 ? (
              <p className="mt-2 text-sm text-steel sm:mt-0">
                {query
                  ? "No se encontraron productos para tu búsqueda."
                  : showMyCity
                    ? `Todavía no hay productos de ${buyerLocality}.`
                    : "No hay productos en esta categoría todavía."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <AdminAccessFooter />
      <PromoRail promos={promos} />
    </>
  );
}

function VehicleField({ label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-steel">{label}</label>
      {children}
    </div>
  );
}
