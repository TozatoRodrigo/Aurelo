import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import ClientLayout from "./client-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurelo - Assistente de Carreira",
  description: "Plataforma inteligente para profissionais da saúde",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        style={{
          fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "Segoe UI", system-ui, sans-serif',
        }}
      >
        <ClientLayout>
          <AppShell>{children}</AppShell>
          <Toaster />
        </ClientLayout>
      </body>
    </html>
  );
}
