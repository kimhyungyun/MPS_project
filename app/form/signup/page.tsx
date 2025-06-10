'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    name: '',
    email: '',
    phoneNumber: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.');
      }

      router.push('/form/login');
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">회원가입</h2>
          <p className="text-slate-600">필수 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-slate-700 mb-1">
                아이디
              </label>
              <input
                id="id"
                name="id"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="아이디를 입력하세요"
                value={formData.id}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">
                연락처
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="연락처를 입력하세요"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-slate-700 mb-1">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 font-medium"
          >
            회원가입
          </button>

          <div className="text-center text-sm text-slate-600">
            이미 계정이 있으신가요?{' '}
            <a href="/form/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
              로그인
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 