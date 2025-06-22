'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AxiosError } from 'axios';

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;
  mb_level: number;
  mb_point: number;
}

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/form/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
        if (!apiUrl) {
          throw new Error("API URL is not defined");
        }

        const response = await axios.get(`${apiUrl}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('Failed to fetch user profile:', error.message);
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/form/login');
          }
        }
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">마이페이지</h1>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">아이디</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">이름</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">닉네임</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_nick}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">이메일</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">휴대폰</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_hp}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">포인트</h3>
                  <p className="mt-1 text-sm text-gray-900">{user.mb_point}점</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => router.push('/mypage/edit')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  정보 수정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
