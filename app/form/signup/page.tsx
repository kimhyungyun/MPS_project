'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    mb_id: '',
    mb_password: '',
    mb_name: '',
    mb_nick: '',
    mb_email: '',
    mb_hp: '',
    mb_sex: '',
    mb_birth: '',
    mb_addr1: '',
    mb_addr2: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 11자리로 제한
    if (numbers.length > 11) return value;
    
    // 형식에 맞게 하이픈 추가
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mb_hp') {
      const formattedValue = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // 에러 메시지 초기화
    setError('');
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
    // 하이픈을 제외한 숫자만 체크
    const phoneNumber = formData.mb_hp.replace(/[^\d]/g, '');
    if (phoneNumber.length !== 11) {
      setError('올바른 휴대폰 번호 형식이 아닙니다.');
      return false;
    }
    return true;
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
      const response = await axios.post('http://localhost:3001/api/auth/signup', formData);
      
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
            {/* 필수 입력 필드 */}
            <div>
              <label htmlFor="mb_id" className="block text-sm font-medium text-gray-700">
                아이디 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_id"
                  name="mb_id"
                  type="text"
                  required
                  minLength={4}
                  maxLength={20}
                  value={formData.mb_id}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="4~20자 사이의 아이디를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mb_password" className="block text-sm font-medium text-gray-700">
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

            <div>
              <label htmlFor="mb_nick" className="block text-sm font-medium text-gray-700">
                닉네임 *
              </label>
              <div className="mt-1">
                <input
                  id="mb_nick"
                  name="mb_nick"
                  type="text"
                  required
                  value={formData.mb_nick}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
            </div>

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

            {/* 선택 입력 필드 */}
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
                />
              </div>
            </div>

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
              <a href="/form/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                로그인
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 