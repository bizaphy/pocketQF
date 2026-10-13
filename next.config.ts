import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // exceljs usa módulos de Node: se carga tal cual en el servidor, sin empaquetarlo
  serverExternalPackages: ["exceljs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb", // el Excel semanal pesa ~250 KB; el límite por defecto es 1 MB
    },
  },
};

export default nextConfig;
