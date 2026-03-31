import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "@/app/globals.css";

import type { Metadata } from "next";

import { Providers } from "@/components/shared/providers";

export const metadata: Metadata = {
  title: "LeadMap CRM",
  description: "CRM de liderancas com dashboard, ranking, mapa e auditoria"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-surface text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
