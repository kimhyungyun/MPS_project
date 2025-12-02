'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { School, SCHOOL_LIST } from '@/types/school';

// window.daum 타입 보완
declare global {
  interface Window {
    daum: any;
  }
}

type CompleteProfileFormData = {
  mb_hp: string;
  mb_school: School | '';
  mb_sex: string;
  mb_birth: string;
  mb_zip1: string;
  mb_addr1: string;
  mb_addr2: string;
  agreePrivacy: boolean;
};

export default function CompleteProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<CompleteProfileFormData>({
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

  // ✅ 카카오 우편번호 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ✅ 휴대폰 번호 포맷
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length > 11) return value;
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  // ✅ 우편번호 검색 팝업
  const handlePostcodeSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        let addr = '';

        if (data.userSelectedType === 'R') {
          addr = data.roadAddress; // 도로명 주소
        } else {
          addr = data.jibunAddress; // 지번 주소
        }

        setFormData((prev) => ({
          ...prev,
          mb_zip1: data.zonecode, // 5자리 우편번호
          mb_addr1: addr, // 기본 주소
          mb_addr2: '', // 상세주소는 직접 입력
        }));
      },
    }).open();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any;

    if (name === 'mb_hp') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        mb_hp: formattedValue,
      }));
    } else if (name === 'mb_school') {
      setFormData((prev) => ({
        ...prev,
        mb_school: value as School | '',
      }));
    } else if (type === 'checkbox') {
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

      // 🔥 여기 수정: PUT + /api/users/complete-profile
      const res = await axios.put(
        `${apiUrl}/api/users/complete-profile`,
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

      if (err.response?.status === 404) {
        setError(
          '백엔드에 PUT /api/users/complete-profile 엔드포인트가 없거나 prefix가 다릅니다. ' +
            'NestJS Controller 경로(@Controller(\'users\'))와 global prefix(app.setGlobalPrefix)를 확인하세요.',
        );
      } else {
        setError(
          err.response?.data?.message ||
            '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
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
              maxLength={13}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="010-0000-0000"
            />
          </div>

          {/* 학교 선택 (회원가입과 동일) */}
          <div>
            <label
              htmlFor="mb_school"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학교
            </label>
            <select
              id="mb_school"
              name="mb_school"
              value={formData.mb_school}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">학교를 선택하세요</option>
              {SCHOOL_LIST.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
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

          {/* 주소 + 우편번호 검색 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 우편번호 + 검색 */}
            <div className="col-span-3">
              <label
                htmlFor="mb_zip1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                우편번호
              </label>
              <div className="flex gap-2">
                <input
                  id="mb_zip1"
                  name="mb_zip1"
                  type="text"
                  value={formData.mb_zip1}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="우편번호"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handlePostcodeSearch}
                  className="px-3 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  우편번호 검색
                </button>
              </div>
            </div>

            {/* 기본주소 */}
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
                readOnly
              />
            </div>

            {/* 상세주소 */}
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

          {/* 제출 버튼 */}
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
