import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Omni-Stock V1.5 | Predictive Watchdog",
  description: "Platform manajemen persediaan terpusat untuk bisnis F&B multi-outlet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
