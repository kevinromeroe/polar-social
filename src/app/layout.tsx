import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ClientDataProvider } from "@/lib/client-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escucha Activa de Clientes",
  description: "Plataforma de monitoreo de redes sociales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ClientDataProvider>{children}</ClientDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
