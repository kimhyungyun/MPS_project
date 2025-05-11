"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HamburgerButton from "../header/button/Hambugerbutton";
import { menuData } from "@/types/menudata";
import Image from "next/image";

const Menuheader = () => {

    const [isScrolled, setIsScrolled] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
      <header
      className={`group fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md bg-white/90 backdrop-blur" : "bg-white/90 backdrop-blur"
      }`}
    >
        <div className="flex justify-center items-center w-full h-[110px] px-10">
          <div className="flex items-center w-full justify-between px-20">
            <div className="text-xl">
              <Link href="/">
                    <Image
                    src="/빈배경로고.png"
                    alt=""
                    width={150}
                    height={150} />
              </Link></div>
            <ul className="flex flex-row gap-45 font-pretendard text-xl font-semibold">
              <li><Link href="/mpspain/introduction">연구회 소개</Link></li>
              <li><Link href="/mpspain/mpschamp">MPS 회원 광장</Link></li>
              <li><Link href="/mpspain/mpslecture">MPS 강좌</Link></li>
            </ul>
            <div className="flex">
              <HamburgerButton />
            </div>
          </div>
        </div>
  
        {/* 드롭다운 전체 메뉴 */}
        <div className="absolute left-0 top-full w-full bg-white/90 backdrop-blur shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40">
        <div className="flex justify-center text-center ml-25 gap-46 pt-5 pb-10">
            {menuData.map((menu) => (
              <div key={menu.title}>
                <ul className="space-y-6 font-pretendard font-medium">
                  {menu.submenu.map((sub) => (
                    <li key={sub.href}>
                      <Link href={sub.href}>
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </header>
    );
  };
 
export default Menuheader;