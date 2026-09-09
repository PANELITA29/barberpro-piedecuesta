import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberPro | SaaS de Gestión de Reservas para Barberías",
  description: "Reserva tu cita en 30 segundos. Sistema SaaS para barberías en Piedecuesta con agenda en tiempo real, catálogo de servicios y pagos digitales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFCF9] dark:bg-zinc-950 text-zinc-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
