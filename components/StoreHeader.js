"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Heart, Bell, User, LogOut, Store, Search, Camera, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/CartProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import ImageCropModal from "@/components/ImageCropModal";

const NOTIFICATIONS_POLL_MS = 20000;

export default function StoreHeader() {
  const { itemCount } = useCart() || { itemCount: 0 };
  const { count: favoriteCount } = useFavorites() || { count: 0 };
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [q, setQ] = useState("");
  const [searchingPhoto, setSearchingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [cropFile, setCropFile] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    function load() {
      fetch("/api/profile/notifications")
        .then((res) => res.json())
        .then((data) => setUnreadNotifications(data.unreadCount || 0))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, NOTIFICATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [status]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/tienda?q=${encodeURIComponent(query)}`);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    setCropFile(file);
  }

  async function handleCropConfirm(croppedFile) {
    setCropFile(null);
    setPhotoError("");
    setSearchingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedFile);
      const res = await fetch("/api/search/image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo buscar por foto");
      router.push(`/tienda?q=${encodeURIComponent(data.query)}`);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setSearchingPhoto(false);
    }
  }

  return (
    <>
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <Link href="/tienda" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight">
            BOLIVAR<span className="text-accent">MARKET</span>
          </span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="order-3 flex w-full items-center gap-1.5 sm:order-none sm:w-auto sm:flex-1 sm:max-w-sm">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
            <Search size={16} className="shrink-0 text-steel" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={searchingPhoto}
            title="Buscar por foto"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {searchingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
        </form>
        {photoError && <p className="order-4 w-full text-xs text-danger sm:order-none">{photoError}</p>}

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/tienda" className="hidden hover:text-accent sm:inline">
            Catálogo
          </Link>

          {status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <Link href="/vendedor" className="flex items-center gap-1.5 font-semibold text-accent hover:brightness-90">
                <Store size={16} />
                <span className="hidden sm:inline">Vender</span>
              </Link>
              <Link href="/perfil" className="flex items-center gap-1.5 text-ink-soft hover:text-accent">
                {session.user?.image ? (
                  <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
                    <Image src={session.user.image} alt="" fill className="object-cover" sizes="20px" />
                  </span>
                ) : (
                  <User size={16} />
                )}
                <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/tienda" })}
                className="flex items-center gap-1 text-ink-soft hover:text-accent"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login?callbackUrl=%2Fvendedor"
                className="flex items-center gap-1.5 font-semibold text-accent hover:brightness-90"
              >
                <Store size={16} />
                <span className="hidden sm:inline">Vender</span>
              </Link>
              <Link href="/login" className="flex items-center gap-1.5 hover:text-accent">
                <User size={18} />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </Link>
            </div>
          )}

          {status === "authenticated" && (
            <Link href="/perfil/notificaciones" className="relative flex items-center gap-1 hover:text-accent">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          )}

          <Link href="/favoritos" className="relative flex items-center gap-1 hover:text-accent">
            <Heart size={20} />
            {favoriteCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
                {favoriteCount}
              </span>
            )}
          </Link>

          <Link href="/carrito" className="relative flex items-center gap-1 hover:text-accent">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>

    {cropFile && (
      <ImageCropModal file={cropFile} onCancel={() => setCropFile(null)} onConfirm={handleCropConfirm} />
    )}
    </>
  );
}
