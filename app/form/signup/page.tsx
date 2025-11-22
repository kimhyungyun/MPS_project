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

type SignupFormData = {
  mb_id: string;
  mb_password: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;
  mb_sex: string;
  mb_birth: string;
  mb_zip1: string;      // ✅ 우편번호 추가
  mb_addr1: string;
  mb_addr2: string;
  mb_school: School | ''; // 선택 전에는 '' 허용
};

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    mb_id: '',
    mb_password: '',
    mb_name: '',
    mb_nick: '',
    mb_email: '',
    mb_hp: '',
    mb_sex: '',
    mb_birth: '',
    mb_zip1: '',
    mb_addr1: '',
    mb_addr2: '',
    mb_school: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 중복확인 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNickChecked, setIsNickChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [nickCheckMessage, setNickCheckMessage] = useState('');

  const router = useRouter();

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

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length > 11) return value;
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'mb_id') {
      setIsIdChecked(false);
      setIdCheckMessage('');
    }
    if (name === 'mb_nick') {
      setIsNickChecked(false);
      setNickCheckMessage('');
    }

    if (name === 'mb_hp') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else if (name === 'mb_school') {
      setFormData((prev) => ({
        ...prev,
        mb_school: value as School | '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
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
          // 도로명 주소
          addr = data.roadAddress;
        } else {
          // 지번 주소
          addr = data.jibunAddress;
        }

        setFormData((prev) => ({
          ...prev,
          mb_zip1: data.zonecode, // 5자리 우편번호
          mb_addr1: addr,         // 기본 주소
          mb_addr2: '',           // 상세주소는 직접 입력
        }));
      },
    }).open();
  };

  const validateForm = () => {
    if (!formData.mb_id) {
      setError('아이디를 입력해주세요.');
      return false;
    }
    if (formData.mb_id.length < 4 || formData.mb_id.length > 20) {
      setError('아이디는 4~20자 사이여야 합니다.');
      return false;
    }
    if (!isIdChecked) {
      setError('아이디 중복확인을 해주세요.');
      return false;
    }

    if (!formData.mb_password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    if (formData.mb_password.length < 6 || formData.mb_password.length > 20) {
      setError('비밀번호는 6~20자 사이여야 합니다.');
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
    if (!isNickChecked) {
      setError('닉네임 중복확인을 해주세요.');
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

    if (!formData.mb_hp) {
      setError('휴대폰 번호를 입력해주세요.');
      return false;
    }
    const phoneNumber = formData.mb_hp.replace(/[^\d]/g, '');
    if (phoneNumber.length !== 11) {
      setError('올바른 휴대폰 번호 형식이 아닙니다.');
      return false;
    }

    if (!formData.mb_school) {
      setError('학교를 선택해주세요.');
      return false;
    }

    // 주소를 필수로 하고 싶으면 여기도 체크 추가
    // if (!formData.mb_zip1 || !formData.mb_addr1) {
    //   setError('주소를 입력해주세요.');
    //   return false;
    // }

    return true;
  };

  const handleCheckId = async () => {
    setError('');
    setIdCheckMessage('');

    if (!formData.mb_id) {
      setError('아이디를 먼저 입력해주세요.');
      return;
    }
    if (formData.mb_id.length < 4 || formData.mb_id.length > 20) {
      setError('아이디는 4~20자 사이여야 합니다.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setError('서버 설정에 문제가 있습니다.');
        return;
      }

      const res = await axios.get(`${apiUrl}/api/auth/check-id`, {
        params: { mb_id: formData.mb_id },
      });

      if (res.data.available) {
        setIsIdChecked(true);
        setIdCheckMessage(res.data.message || '사용 가능한 아이디입니다.');
      } else {
        setIsIdChecked(false);
        setIdCheckMessage(res.data.message || '이미 사용 중인 아이디입니다.');
      }
    } catch (err: any) {
      console.error('Check ID error:', err);
      setIsIdChecked(false);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('아이디 중복 확인에 실패했습니다.');
      }
    }
  };

  const handleCheckNick = async () => {
    setError('');
    setNickCheckMessage('');

    if (!formData.mb_nick) {
      setError('닉네임을 먼저 입력해주세요.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setError('서버 설정에 문제가 있습니다.');
        return;
      }

      const res = await axios.get(`${apiUrl}/api/auth/check-nick`, {
        params: { mb_nick: formData.mb_nick },
      });

      if (res.data.available) {
        setIsNickChecked(true);
        setNickCheckMessage(res.data.message || '사용 가능한 닉네임입니다.');
      } else {
        setIsNickChecked(false);
        setNickCheckMessage(res.data.message || '이미 사용 중인 닉네임입니다.');
      }
    } catch (err: any) {
      console.error('Check Nick error:', err);
      setIsNickChecked(false);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('닉네임 중복 확인에 실패했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL is not defined');
        setIsLoading(false);
        setError('서버 설정에 문제가 있습니다.');
        return;
      }

      const response = await axios.post(`${apiUrl}/api/auth/signup`, formData);

      if (response.data.success) {
        alert(response.data.message);
        router.push('/form/login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else if (err.response?.status === 409) {
        setError('이미 사용 중인 아이디입니다.');
      } else if (err.response?.status === 500) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('회원가입에 실패했습니다. 입력한 정보를 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 아이디 + 중복확인 */}
            <div>
              <label htmlFor="mb_id" className="block text-sm font-medium text-gray-700">
                아이디 *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_id"
                  name="mb_id"
                  type="text"
                  required
                  minLength={4}
                  maxLength={20}
                  value={formData.mb_id}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="4~20자 사이의 아이디를 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleCheckId}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  중복확인
                </button>
              </div>
              {idCheckMessage && (
                <p
                  className={`mt-1 text-xs ${
                    isIdChecked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {idCheckMessage}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="mb_password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_password"
                  name="mb_password"
                  type="password"
                  required
                  minLength={6}
                  maxLength={20}
                  value={formData.mb_password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="6~20자 사이의 비밀번호를 입력하세요"
                />
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="mb_name" className="block text-sm font-medium text-gray-700">
                이름 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_name"
                  name="mb_name"
                  type="text"
                  required
                  value={formData.mb_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="이름을 입력하세요"
                />
              </div>
            </div>

            {/* 닉네임 + 중복확인 */}
            <div>
              <label htmlFor="mb_nick" className="block text-sm font-medium text-gray-700">
                닉네임 *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_nick"
                  name="mb_nick"
                  type="text"
                  required
                  value={formData.mb_nick}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="닉네임을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleCheckNick}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  중복확인
                </button>
              </div>
              {nickCheckMessage && (
                <p
                  className={`mt-1 text-xs ${
                    isNickChecked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {nickCheckMessage}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="mb_email" className="block text-sm font-medium text-gray-700">
                이메일 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_email"
                  name="mb_email"
                  type="email"
                  required
                  value={formData.mb_email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* 휴대폰 */}
            <div>
              <label htmlFor="mb_hp" className="block text-sm font-medium text-gray-700">
                휴대폰 번호 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_hp"
                  name="mb_hp"
                  type="tel"
                  required
                  maxLength={13}
                  value={formData.mb_hp}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label htmlFor="mb_sex" className="block text-sm font-medium text-gray-700">
                성별
              </label>
              <div className="mt-1">
                <select
                  id="mb_sex"
                  name="mb_sex"
                  value={formData.mb_sex}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">선택하세요</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
            </div>

            {/* 학교 선택 */}
            <div>
              <label
                htmlFor="mb_school"
                className="block text-sm font-medium text-gray-700"
              >
                학교 *
              </label>
              <div className="mt-1">
                <select
                  id="mb_school"
                  name="mb_school"
                  required
                  value={formData.mb_school}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">학교를 선택하세요</option>
                  {SCHOOL_LIST.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label htmlFor="mb_birth" className="block text-sm font-medium text-gray-700">
                생년월일
              </label>
              <div className="mt-1">
                <input
                  id="mb_birth"
                  name="mb_birth"
                  type="text"
                  placeholder="YYYYMMDD"
                  value={formData.mb_birth}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* ✅ 우편번호 + 검색 버튼 */}
            <div>
              <label htmlFor="mb_zip1" className="block text-sm font-medium text-gray-700">
                우편번호
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="mb_zip1"
                  name="mb_zip1"
                  type="text"
                  value={formData.mb_zip1}
                  onChange={handleChange}
                  className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="우편번호"
                  readOnly // 팝업으로만 입력하게
                />
                <button
                  type="button"
                  onClick={handlePostcodeSearch}
                  className="px-3 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                >
                  우편번호 검색
                </button>
              </div>
            </div>

            {/* 기본주소 */}
            <div>
              <label htmlFor="mb_addr1" className="block text-sm font-medium text-gray-700">
                기본주소
              </label>
              <div className="mt-1">
                <input
                  id="mb_addr1"
                  name="mb_addr1"
                  type="text"
                  value={formData.mb_addr1}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="기본주소를 입력하세요"
                  readOnly // 검색으로 채우도록
                />
              </div>
            </div>

            {/* 상세주소 */}
            <div>
              <label htmlFor="mb_addr2" className="block text-sm font-medium text-gray-700">
                상세주소
              </label>
              <div className="mt-1">
                <input
                  id="mb_addr2"
                  name="mb_addr2"
                  type="text"
                  value={formData.mb_addr2}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="상세주소를 입력하세요"
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리중...' : '가입하기'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a
                href="/form/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                로그인
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
