import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MehnatAI — Xodimlar samaradorligi baholash tizimi",
  description: "Sun'iy intellekt algoritmlari yordamida xodimlarni ish sifatini va samaradorligini baholash tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`h-full ${inter.variable}`}>
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
