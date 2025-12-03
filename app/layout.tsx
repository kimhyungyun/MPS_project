"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./header/Header";
import Footer from "./footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const HEADER_HEIGHT = 72; // Header 컴포넌트에서 쓰는 높이랑 반드시 맞추기

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
        {/* 헤더를 따로 fixed로 감싸지 말고, Header 컴포넌트만 그대로 렌더 */}
        {!isMpsPage && <Header />}

        {/* 헤더가 있는 페이지는 헤더 높이만큼 전체 컨텐츠를 아래로 밀어줌 */}
        <main
          style={
            !isMpsPage
              ? { paddingTop: HEADER_HEIGHT }
              : undefined
          }
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
