import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BarraLateral from "@/components/barra-lateral";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

// Switzer no está en Google Fonts: los archivos vienen de Fontshare y se guardan en app/fonts
const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500" },
    { path: "./fonts/Switzer-Semibold.woff2", weight: "600" },
    { path: "./fonts/Switzer-Bold.woff2", weight: "700" },
  ],
  variable: "--font-switzer",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | PocketQF", // %s se reemplaza por el título de cada pag.
    default: "PocketQF",
  },
  description:
    "Herramientas para la farmacia: vencimientos, tareas, calendario y fichas de medicamentos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${switzer.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {/* En pantallas grandes la barra va a la izquierda; en móvil queda bajo el contenido */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* flex-col: una página puede estirar su contenido a todo el alto con flex-1 (ej: fondo del inicio) */}
          <div className="flex min-w-0 flex-1 flex-col lg:order-2">
            {children}
          </div>
          <BarraLateral />
        </div>
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
