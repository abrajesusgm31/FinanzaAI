import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanzasAI — Sistema Financiero Inteligente",
  description: "Plataforma multiusuario para gestión de finanzas personales, familiares y de equipos basada en Ledger Centralizado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
