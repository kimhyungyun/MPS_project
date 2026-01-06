'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;

  mb_sex?: string | null;
  mb_birth?: string | null;

  mb_school?: string | null;
  mb_zip1?: string | null;
  mb_addr1?: string | null;
  mb_addr2?: string | null;

  mb_level: number;
  mb_point?: number;
}

export default function MyPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

        if (!token) {
          router.push('/form/login');
          return;
        }

        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // 🔥 디버그 필요하면 주석 해제
        // console.log('PROFILE RAW =', res.data);

        if (res.data?.success) {
          setUser(res.data.data);
        } else {
          setError('회원 정보를 불러오지 못했습니다.');
        }
      } catch (e) {
        const err = e as AxiosError<any>;
        console.error('[MyPage] profile error:', err?.message);

        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/form/login');
          return;
        }

        setError(err?.response?.data?.message || '회원 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-700">{error || '회원 정보를 불러오지 못했습니다.'}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => router.push('/form/login')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                로그인으로
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</p>
    </div>
  );

  const fullAddress = [user.mb_zip1, user.mb_addr1, user.mb_addr2].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">마이페이지</h1>
            <p className="text-sm text-gray-500 mt-1">내 정보 확인 및 수정</p>
          </div>

          <button
            onClick={() => router.push('/mypage/edit')}
            className="shrink-0 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm"
          >
            정보 수정
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">회원 정보</h2>
            <p className="text-sm text-gray-500 mt-1">회원가입 시 입력한 정보를 표시합니다.</p>
          </div>

          <div className="px-5 sm:px-7 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="아이디" value={user.mb_id} />
              <Field label="이름" value={user.mb_name || '-'} />
              <Field label="닉네임" value={user.mb_nick || '-'} />
              <Field label="이메일" value={user.mb_email || '-'} />
              <Field label="휴대폰" value={user.mb_hp || '-'} />
              <Field label="성별" value={user.mb_sex || '-'} />
              <Field label="생년월일" value={user.mb_birth || '-'} />
              <Field label="학교" value={user.mb_school || '-'} />
              <Field label="주소" value={fullAddress || '-'} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/form/login');
                }}
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
