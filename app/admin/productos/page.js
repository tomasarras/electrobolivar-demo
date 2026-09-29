"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";

export default function AdminProductosPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("¿Borrar este producto del catálogo?")) return;
    setError("");
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo borrar el producto.");
      return;
    }
    load();
  }

  if (!products) return <p className="text-sm text-steel">Cargando…</p>;

  const total = products.length;
  const inStock = products.filter((p) => p.inStock !== false).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-ink-soft">Esto es lo que gestionás vos; tus clientes solo ven la Tienda.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-md border border-line bg-panel px-4 py-2 text-center">
            <span className="block font-mono text-lg font-semibold">{total}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-steel">Productos</span>
          </div>
          <div className="rounded-md border border-line bg-panel px-4 py-2 text-center">
            <span className="block font-mono text-lg font-semibold">{inStock}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-steel">En stock</span>
          </div>
          <div className="rounded-md border border-line bg-panel px-4 py-2 text-center">
            <span className="block font-mono text-lg font-semibold">{total - inStock}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-steel">Sin stock</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110"
        >
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {products.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-line p-8 text-center text-sm text-steel">
          Todavía no cargaste productos.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-panel">
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
                  <td className="p-3">{categoryLabel(p.category)}</td>
                  <td className="p-3 font-mono">{formatCurrency(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                        p.inStock === false ? "border-danger text-danger" : "border-accent-2 text-accent-2"
                      }`}
                    >
                      {p.inStock === false ? "Sin stock" : "En stock"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="rounded p-1.5 text-ink-soft hover:bg-panel-2 hover:text-ink"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded p-1.5 text-ink-soft hover:bg-panel-2 hover:text-danger"
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
