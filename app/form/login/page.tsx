'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement actual login logic here
      console.log('Login attempt with:', { id, password });
      router.push('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">로그인</h2>
          <p className="text-slate-600"></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-slate-700 mb-1">
                아이디
              </label>
              <input
                id="id"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end items-center gap-5 text-sm w-full">
            <div className="flex items-center">
            </div>
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              아이디 찾기
            </a>
            <a href="#" className="text-emerald-600 hover:text-emerald-500">
              비밀번호 찾기
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 font-medium"
          >
            로그인
          </button>

          <div className="text-center text-sm text-slate-600">
            계정이 없으신가요?{' '}
            <a href="/form/signup" className="text-emerald-600 hover:text-emerald-500 font-medium">
              회원가입
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
