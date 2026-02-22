"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "./footer/Footer";
import Header from "./header/page";
import SectionDrawer from "./mpspain/components/SectionDrawer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const HEADER_HEIGHT = 100; // Header 컴포넌트에서 쓰는 높이랑 반드시 맞추기

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
        {/* ✅ /mpspain 페이지에서만 책갈피(우측 아이콘) 메뉴 */}
        {isMpsPage && <SectionDrawer />}

        {/* ✅ mpspain 페이지에서는 Header 숨김 */}
        {!isMpsPage && <Header />}

        {/* 헤더가 있는 페이지만 paddingTop 적용 */}
        <main style={!isMpsPage ? { paddingTop: HEADER_HEIGHT } : undefined}>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}