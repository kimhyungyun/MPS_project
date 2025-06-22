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

interface FormData {
  mb_password?: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;
}

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    mb_password: '',
    mb_name: '',
    mb_nick: '',
    mb_email: '',
    mb_hp: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // 환경변수로 API URL을 가져옵니다.

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/form/login');
          return;
        }

        const response = await axios.get(`${apiUrl}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          setFormData({
            mb_password: '',
            mb_name: userData.mb_name,
            mb_nick: userData.mb_nick,
            mb_email: userData.mb_email,
            mb_hp: userData.mb_hp,
          });
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
  }, [router, apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (formData.mb_password && formData.mb_password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return false;
    }
    if (!formData.mb_name) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.mb_nick) {
      setError('닉네임을 입력해주세요.');
      return false;
    }
    if (!formData.mb_email) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    if (!formData.mb_email.includes('@')) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/form/login');
        return;
      }

      // 비밀번호가 비어있으면 제외하고 전송
      const updateData = { ...formData };
      if (!updateData.mb_password) {
        delete updateData.mb_password;
      }

      const response = await axios.put(
        `${apiUrl}/users/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('프로필이 성공적으로 업데이트되었습니다.');
        // 2초 후 마이페이지로 리다이렉트
        setTimeout(() => {
          router.push('/mypage');
        }, 2000);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
      } else {
        setError('프로필 업데이트에 실패했습니다.');
      }
    }
  };

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필 수정</h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="mb_password" className="block text-sm font-medium text-gray-700">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="mb_password"
                  name="mb_password"
                  value={formData.mb_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="변경하지 않으려면 비워두세요"
                />
              </div>

              <div>
                <label htmlFor="mb_name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  type="text"
                  id="mb_name"
                  name="mb_name"
                  value={formData.mb_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="mb_nick" className="block text-sm font-medium text-gray-700">
                  닉네임
                </label>
                <input
                  type="text"
                  id="mb_nick"
                  name="mb_nick"
                  value={formData.mb_nick}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="mb_email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  type="email"
                  id="mb_email"
                  name="mb_email"
                  value={formData.mb_email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="mb_hp" className="block text-sm font-medium text-gray-700">
                  휴대폰
                </label>
                <input
                  type="tel"
                  id="mb_hp"
                  name="mb_hp"
                  value={formData.mb_hp}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/mypage')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
