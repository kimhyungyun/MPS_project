"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "./footer/Footer";
import Header from "./header/page";
import { ViewModeProvider } from "./providers/ViewModeProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const HEADER_HEIGHT = 100;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isMpsPage = pathname?.startsWith("/mpspain");

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ViewModeProvider>
          {!isMpsPage && <Header />}

          <main style={!isMpsPage ? { paddingTop: HEADER_HEIGHT } : undefined}>
            {children}
          </main>

          <Footer />
        </ViewModeProvider>
      </body>
    </html>
  );
}
