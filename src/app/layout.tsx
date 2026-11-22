import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { portraitSrc } from "@/components/anchor-portrait";
import { Sidebar } from "@/components/sidebar";
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
  title: "The Late Edit · Newsroom",
  description: "Production portal for Reema and Siddharth",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full bg-slate-950 text-slate-200">
        <Sidebar portraits={{ reema: portraitSrc("reema"), siddharth: portraitSrc("siddharth") }} />
        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
