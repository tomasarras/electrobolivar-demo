"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export default function AdminSellerProductsPage({ params }) {
  const { id } = use(params);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/admin/sellers/${id}/products`)
      .then((res) => res.json())
      .then((data) => {
        setSeller(data.seller || null);
        setProducts(data.products || []);
      });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [id]);

  async function handleDelete(productId) {
    if (!window.confirm("¿Borrar este producto del catálogo?")) return;
    setError("");
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo borrar el producto.");
      return;
    }
    load();
  }

  if (!products) return <p className="text-sm text-steel">Cargando…</p>;

  return (
    <div>
      <Link href="/admin/vendedores" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={14} />
        Volver a vendedores
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold">Productos de {seller?.storeName || "vendedor"}</h1>
      <p className="mt-1 text-sm text-ink-soft">Editá o borrá los productos publicados por este vendedor.</p>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {products.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line p-8 text-center text-sm text-steel">
          Este vendedor todavía no publicó productos.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-panel">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-steel">
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-left">Precio</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-panel-2">
                        {p.images?.[0] ? (
                          <Image src={p.images[0].url} alt="" fill className="object-cover" />
                        ) : (
                          <ProductImagePlaceholder category={p.category} className="h-full w-full" />
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-ink-soft">{categoryLabel(p.category)}</td>
                  <td className="p-3 font-mono">{formatCurrency(p.price, p.currency)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (p.stock ?? 0) > 0 ? "bg-accent-2/10 text-accent-2" : "bg-danger/10 text-danger"
                      }`}
                    >
                      {(p.stock ?? 0) > 0 ? `${p.stock} en stock` : "Sin stock"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}?redirectTo=/admin/vendedores/${id}/productos`}
                        className="rounded p-1.5 text-steel hover:bg-panel-2 hover:text-ink"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1.5 text-steel hover:bg-danger/10 hover:text-danger"
                        title="Borrar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
