// app/form/findpassword/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type Step = 'request' | 'verify' | 'reset';

export default function FindPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [formData, setFormData] = useState({
    mb_id: '',
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 1단계: 인증번호 요청
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/sms/request`,
        {
          mb_id: formData.mb_id,
          phone: formData.phone,
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
        setInfo('입력하신 휴대폰 번호로 인증번호를 전송했습니다.');
        setStep('verify');
      } else {
        setError(response.data.message || '인증번호 전송에 실패했습니다.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          '인증번호 전송 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 인증번호 검증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/sms/verify`,
        {
          mb_id: formData.mb_id,
          code: formData.code,
        },
        {
          withCredentials: true,
          validateStatus: () => true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setInfo('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
        setStep('reset');
      } else {
        setError(response.data.message || '인증번호가 올바르지 않습니다.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          '인증번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!resetToken) {
      setError('유효하지 않은 요청입니다. 처음부터 다시 진행해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/password/reset`,
        {
          resetToken,
          newPassword: formData.newPassword,
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
        setInfo('비밀번호가 성공적으로 변경되었습니다.');
        // 잠깐 보여준 뒤 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/form/login');
        }, 1500);
      } else {
        setError(response.data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          '비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepForm = () => {
    if (step === 'request') {
      return (
        <form onSubmit={handleRequestCode} className="space-y-6">
          <div>
            <label
              htmlFor="mb_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              아이디
            </label>
            <input
              id="mb_id"
              name="mb_id"
              type="text"
              required
              value={formData.mb_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="아이디를 입력하세요"
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
              placeholder="예: 01012341234"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? '전송 중...' : '인증번호 전송'}
          </button>
        </form>
      );
    }

    if (step === 'verify') {
      return (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              인증번호
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="문자로 받은 인증번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? '확인 중...' : '인증번호 확인'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setStep('request')}
            className="w-full mt-2 border border-gray-300 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            처음 단계로 돌아가기
          </button>
        </form>
      );
    }

    // step === 'reset'
    return (
      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            새 비밀번호
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="새 비밀번호를 입력하세요"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="다시 한 번 입력하세요"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            비밀번호 찾기
          </h2>
          <p className="text-slate-600 text-sm">
            아이디와 휴대폰 번호로 본인 인증 후 비밀번호를 재설정합니다.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {info}
          </div>
        )}

        {renderStepForm()}

        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/form/login" className="text-blue-600 hover:text-blue-700">
            로그인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
