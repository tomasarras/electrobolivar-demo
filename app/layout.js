import { Barlow_Condensed, Barlow, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/components/AdminProvider";
import { CartProvider } from "@/components/CartProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";
import { AuthProvider } from "@/components/AuthProvider";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata = {
  title: "MercadoBolívar — Demo de tienda de electrodomésticos",
  description:
    "Proyecto de portfolio: tienda de electrodomésticos ficticia con catálogo, pedido por WhatsApp, y un panel de administración para cargar productos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${barlow.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <FavoritesProvider>{children}</FavoritesProvider>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
