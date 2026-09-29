import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/components/AdminProvider";
import { CartProvider } from "@/components/CartProvider";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata = {
  title: "ElectroBolívar — Demo de tienda de electrodomésticos",
  description:
    "Proyecto de portfolio: tienda de electrodomésticos ficticia con catálogo, pedido por WhatsApp, y un panel de administración para cargar productos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${bigShoulders.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AdminProvider>
          <CartProvider>{children}</CartProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
