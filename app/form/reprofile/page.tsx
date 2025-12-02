'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    mb_hp: '',
    mb_school: '',
    mb_sex: '',
    mb_birth: '',
    mb_zip1: '',
    mb_addr1: '',
    mb_addr2: '',
    agreePrivacy: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as any;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agreePrivacy) {
      setError('개인정보 수집 · 이용 동의(필수)에 체크해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setError('서버 설정에 문제가 있습니다.');
        setIsLoading(false);
        return;
      }

      const res = await axios.patch(
        `${apiUrl}/api/user/complete-profile`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        alert('추가 정보 및 동의가 완료되었습니다.');
        router.push('/');
      } else {
        setError(res.data.message || '저장에 실패했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          추가 정보 입력 및 개인정보 동의
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          더 나은 서비스 제공을 위해 일부 정보를 추가로 입력해 주세요.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 휴대폰 */}
          <div>
            <label
              htmlFor="mb_hp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              휴대폰 번호
            </label>
            <input
              id="mb_hp"
              name="mb_hp"
              type="tel"
              value={formData.mb_hp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="010-0000-0000"
            />
          </div>

          {/* 학교 */}
          <div>
            <label
              htmlFor="mb_school"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학교
            </label>
            <input
              id="mb_school"
              name="mb_school"
              type="text"
              value={formData.mb_school}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="학교명을 입력하세요"
            />
          </div>

          {/* 성별 */}
          <div>
            <label
              htmlFor="mb_sex"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              성별
            </label>
            <select
              id="mb_sex"
              name="mb_sex"
              value={formData.mb_sex}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">선택하세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>

          {/* 생년월일 */}
          <div>
            <label
              htmlFor="mb_birth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              생년월일
            </label>
            <input
              id="mb_birth"
              name="mb_birth"
              type="text"
              value={formData.mb_birth}
              onChange={handleChange}
              placeholder="YYYYMMDD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* 주소 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label
                htmlFor="mb_zip1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                우편번호
              </label>
              <input
                id="mb_zip1"
                name="mb_zip1"
                type="text"
                value={formData.mb_zip1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="우편번호"
              />
            </div>
            <div className="col-span-3">
              <label
                htmlFor="mb_addr1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                기본주소
              </label>
              <input
                id="mb_addr1"
                name="mb_addr1"
                type="text"
                value={formData.mb_addr1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="기본주소를 입력하세요"
              />
            </div>
            <div className="col-span-3">
              <label
                htmlFor="mb_addr2"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                상세주소
              </label>
              <input
                id="mb_addr2"
                name="mb_addr2"
                type="text"
                value={formData.mb_addr2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="상세주소를 입력하세요"
              />
            </div>
          </div>

          {/* 개인정보 동의 */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-start gap-2">
              <input
                id="agreePrivacy"
                name="agreePrivacy"
                type="checkbox"
                checked={formData.agreePrivacy}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label
                  htmlFor="agreePrivacy"
                  className="text-sm font-medium text-gray-800"
                >
                  개인정보 수집 · 이용 동의 (필수)
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  서비스 이용을 위해 필요한 최소한의 개인정보를 수집 · 이용합니다.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.agreePrivacy}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? '저장 중...' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
