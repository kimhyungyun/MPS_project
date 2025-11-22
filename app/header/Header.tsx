"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { menuData } from "@/types/menudata";
import Image from "next/image";
import axios from "axios";
import { AxiosError } from 'axios';
import { useRouter } from "next/navigation";
 

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    // Get user data from backend
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 5000, // 5초 타임아웃 설정
        });

        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Failed to fetch user profile:', error.message);
          // 토큰이 유효하지 않은 경우 로그아웃
          if (error.response?.status === 401 || error.code === 'ECONNABORTED') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          console.error('An unexpected error occurred:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push("/");
  };

  return (
    <header
      className={`group fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "shadow-md bg-white/90 backdrop-blur" : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="flex justify-center items-center w-full h-[110px] px-10">
        <div className="flex items-center w-full justify-between px-10">
          <div className="text-xl">
            <Link href="/">
              <Image
                src="/빈배경로고.png"
                alt="로고"
                width={150}
                height={150}
                priority
                style={{ width: 'auto', height: 'auto' }}
                className="object-contain"
              />
            </Link>
          </div>
          <ul className="flex flex-row gap-45 font-pretendard text-xl">
            <li><Link href="/mpspain/introduction">연구회 소개</Link></li>
            <li><Link href="/mpspain/mpschamp">MPS 회원 광장</Link></li>
            <li><Link href="/mpspain/mpslecture">MPS 강좌</Link></li>
          </ul>
          <div className="flex items-center gap-4 w-48 justify-end">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-2 text-xs">
                  <Link 
                    href={user.mb_level >= 8 ? '/admin' : '/mypage'} 
                    className="text-gray-700 font-pretendard text-xs hover:text-blue-600"
                  >
                    {user.mb_name}
                  </Link>
                  <span className="text-gray-700">님 반갑습니다!</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 font-pretendard hover:text-blue-600"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link href="/form/login" className="text-gray-700 font-pretendard hover:text-blue-600">
                  로그인
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* 드롭다운 전체 메뉴 */}
      <div className="absolute left-0 top-full w-full bg-white/90 backdrop-blur shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-40">
        <div className="flex justify-center text-center gap-46 pt-5 pb-10">
          {menuData.map((menu) => (
            <div key={menu.title}>
              <ul className="space-y-8 font-pretendard font-medium">
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

export default Header;
