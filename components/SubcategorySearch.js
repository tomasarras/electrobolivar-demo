"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubcategorySearch({ categoria, q, options, value }) {
  const router = useRouter();
  const [text, setText] = useState(value || "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => setText(value || ""), [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const needle = text.trim().toLowerCase();
  const filtered = needle ? options.filter((o) => o.toLowerCase().includes(needle)) : options;

  function go(subcategoria) {
    const params = new URLSearchParams();
    params.set("categoria", categoria);
    if (q) params.set("q", q);
    if (subcategoria) params.set("subcategoria", subcategoria);
    setOpen(false);
    router.push(`/tienda?${params.toString()}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(text.trim());
        }}
        className="space-y-3"
      >
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-steel">Categoría</label>
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar..."
            autoComplete="off"
            className="filter-input"
          />
          {open && filtered.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-line bg-panel shadow-lg">
              {filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      setText(opt);
                      go(opt);
                    }}
                    className="block w-full px-2.5 py-1.5 text-left text-sm hover:bg-panel-2"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="w-full rounded-md bg-ink py-2 text-sm font-semibold text-paper hover:brightness-110">
          Filtrar
        </button>
        {value && (
          <Link
            href={{ pathname: "/tienda", query: { categoria, ...(q ? { q } : {}) } }}
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
    </div>
  );
}
