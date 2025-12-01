// app/form/findid/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function FindIdPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [maskedUserId, setMaskedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 숫자만 추출
  const normalizePhoneDigits = (phone: string) => phone.replace(/\D/g, '');

  // 01012345678 -> 010-1234-5678
  const formatPhoneDashed = (digits: string) => {
    if (digits.length < 10) return digits;
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setMaskedUserId(null);
    setLoading(true);

    try {
      const digitsPhone = normalizePhoneDigits(formData.phone); // 01012345678
      const dashedPhone = formatPhoneDashed(digitsPhone);       // 010-1234-5678

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/find-id`,
        {
          name: formData.name,
          phone: dashedPhone, // 백엔드는 이걸로만 검색
        },
        {
          withCredentials: true,
          validateStatus: () => true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        if (response.data.maskedUserId) {
          setMaskedUserId(response.data.maskedUserId);
        }
        // ✅ 이제는 "문자 전송" 아니라, 그냥 아이디를 찾았다고만 표시
        setMessage('입력하신 정보와 일치하는 아이디입니다.');
      } else {
        setError(response.data.message || '아이디를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          '아이디 찾기에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">아이디 찾기</h2>
          <p className="text-slate-600 text-sm">
            가입 시 등록한 이름과 휴대폰 번호를 입력해주세요.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {maskedUserId && (
          <div className="mb-4 p-3 bg-slate-50 text-slate-800 rounded-lg text-sm">
            회원님의 아이디:{' '}
            <span className="font-semibold">{maskedUserId}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              휴대폰 번호
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 01012345678 또는 010-1234-5678"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? '처리 중...' : '아이디 찾기'}
          </button>

          <div className="text-center text-sm text-gray-600">
            <a href="/form/login" className="text-blue-600 hover:text-blue-700">
              로그인으로 돌아가기
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
