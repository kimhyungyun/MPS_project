'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    mb_id: '',
    mb_password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        formData,
        {
          withCredentials: true,
          validateStatus: () => true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.success) {
        const userData = response.data.data;
        console.log('Login response:', userData);

        // Set both localStorage and cookies
        localStorage.setItem('token', userData.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        document.cookie = `user=${JSON.stringify(userData)}; path=/`;
        document.cookie = `token=${userData.access_token}; path=/`;

        const needProfileUpdate = userData.needProfileUpdate === true;

        // ✅ 추가 정보/동의가 필요한 경우 우선 이동
        if (needProfileUpdate) {
          console.log('Login - Redirecting to complete profile page');
          setTimeout(() => {
            window.location.href = '../from/reprofile';
          }, 100);
          return;
        }

        // ✅ 그 외 기존 로직 유지
        if (userData.mb_level >= 8) {
          console.log(
            'Login - Redirecting to admin page, mb_level:',
            userData.mb_level,
          );
          setTimeout(() => {
            window.location.href = '/admin';
          }, 100);
        } else {
          console.log(
            'Login - Redirecting to main page, mb_level:',
            userData.mb_level,
          );
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      } else {
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          '로그인에 실패했습니다. 다시 시도해주세요.',
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">로그인</h2>
          <p className="text-slate-600">MPS 연구회에 오신 것을 환영합니다</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="mb_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              아이디
            </label>
            <input
              type="text"
              id="mb_id"
              name="mb_id"
              value={formData.mb_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="mb_password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="mb_password"
              name="mb_password"
              value={formData.mb_password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            로그인
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <a href="/form/signup" className="text-blue-600 hover:text-blue-700">
                회원가입
              </a>
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-600">
              <a href="/form/findid" className="hover:text-blue-700">
                아이디 찾기
              </a>
              <span className="text-gray-300">|</span>
              <a href="/form/findpassword" className="hover:text-blue-700">
                비밀번호 찾기
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
