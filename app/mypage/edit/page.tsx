'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { School, SCHOOL_LIST } from '@/types/school';

// window.daum 타입 보완
declare global {
  interface Window {
    daum: any;
  }
}

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;

  mb_sex?: string | null;
  mb_birth?: string | null;

  mb_zip1?: string | null;
  mb_addr1?: string | null;
  mb_addr2?: string | null;
  mb_school?: string | null;

  mb_level: number;
}

type FormData = {
  mb_password?: string;

  mb_name: string;
  mb_nick: string;
  mb_email: string;
  mb_hp: string;

  mb_sex: string;
  mb_birth: string;

  mb_zip1: string;
  mb_addr1: string;
  mb_addr2: string;

  mb_school: School | '';
};

export default function EditProfilePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState<FormData>({
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

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

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

        if (res.data?.success) {
          const u: User = res.data.data;
          setUser(u);

          setForm({
            mb_password: '',
            mb_name: u.mb_name ?? '',
            mb_nick: u.mb_nick ?? '',
            mb_email: u.mb_email ?? '',
            mb_hp: u.mb_hp ?? '',

            mb_sex: (u.mb_sex ?? '') as string,
            mb_birth: (u.mb_birth ?? '') as string,

            mb_zip1: (u.mb_zip1 ?? '') as string,
            mb_addr1: (u.mb_addr1 ?? '') as string,
            mb_addr2: (u.mb_addr2 ?? '') as string,

            mb_school: ((u.mb_school ?? '') as School | '') || '',
          });
        } else {
          setError('회원 정보를 불러오지 못했습니다.');
        }
      } catch (e) {
        const err = e as AxiosError<any>;
        console.error('[EditProfile] profile error:', err?.message);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setError(null);
    setSuccess(null);

    if (name === 'mb_hp') {
      setForm((prev) => ({ ...prev, mb_hp: formatPhoneNumber(value) }));
      return;
    }

    if (name === 'mb_school') {
      setForm((prev) => ({ ...prev, mb_school: value as School | '' }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 우편번호 검색 팝업
  const handlePostcodeSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;

        setForm((prev) => ({
          ...prev,
          mb_zip1: data.zonecode,
          mb_addr1: addr,
          mb_addr2: '',
        }));
      },
    }).open();
  };

  const validate = () => {
    if (form.mb_password && form.mb_password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (!form.mb_name.trim()) return '이름을 입력해주세요.';
    if (!form.mb_nick.trim()) return '닉네임을 입력해주세요.';
    if (!form.mb_email.trim()) return '이메일을 입력해주세요.';
    if (!form.mb_email.includes('@')) return '올바른 이메일 형식이 아닙니다.';

    const phoneNumber = form.mb_hp.replace(/[^\d]/g, '');
    if (phoneNumber && phoneNumber.length !== 11) return '올바른 휴대폰 번호 형식이 아닙니다.';

    if (!form.mb_school) return '학교를 선택해주세요.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');
      if (!token) {
        router.push('/form/login');
        return;
      }

      // ✅ 회원가입 폼 기준 그대로 전송 (agreePrivacy 같은 건 수정에 필요없음)
      const payload: any = {
        mb_name: form.mb_name,
        mb_nick: form.mb_nick,
        mb_email: form.mb_email,
        mb_hp: form.mb_hp,

        mb_sex: form.mb_sex || null,
        mb_birth: form.mb_birth || null,

        mb_zip1: form.mb_zip1 || null,
        mb_addr1: form.mb_addr1 || null,
        mb_addr2: form.mb_addr2 || null,

        mb_school: form.mb_school,
      };

      // ✅ 비번 비면 제외
      if (form.mb_password && form.mb_password.trim().length > 0) {
        payload.mb_password = form.mb_password;
      }

      const res = await axios.put(`${API_URL}/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.data?.success) {
        setSuccess('프로필이 수정되었습니다.');
        setTimeout(() => router.push('/mypage'), 800);
      } else {
        setError('프로필 업데이트에 실패했습니다.');
      }
    } catch (e) {
      const err = e as AxiosError<any>;
      setError(err?.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">정보 수정</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-800">{user.mb_id}</span> 계정 정보 수정
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/mypage')}
            className="shrink-0 inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            뒤로
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-7 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">수정 폼</h2>
            <p className="text-sm text-gray-500 mt-1">비밀번호는 변경할 때만 입력</p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 sm:px-7 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 비밀번호 */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">새 비밀번호</label>
                <input
                  type="password"
                  name="mb_password"
                  value={form.mb_password ?? ''}
                  onChange={handleChange}
                  placeholder="변경하지 않으면 비워두세요"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 기본 */}
              <Field label="이름" name="mb_name" value={form.mb_name} onChange={handleChange} required />
              <Field label="닉네임" name="mb_nick" value={form.mb_nick} onChange={handleChange} required />
              <Field label="이메일" name="mb_email" value={form.mb_email} onChange={handleChange} required />
              <Field label="휴대폰" name="mb_hp" value={form.mb_hp} onChange={handleChange} placeholder="010-0000-0000" />

              {/* 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800">성별</label>
                <select
                  name="mb_sex"
                  value={form.mb_sex}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">선택</option>
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>

              <Field label="생년월일" name="mb_birth" value={form.mb_birth} onChange={handleChange} placeholder="YYYYMMDD" />

              {/* 학교 */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">학교 *</label>
                <select
                  name="mb_school"
                  value={form.mb_school}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">학교를 선택하세요</option>
                  {SCHOOL_LIST.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              {/* 주소 */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">우편번호</label>
                <div className="mt-2 flex gap-2">
                  <input
                    name="mb_zip1"
                    value={form.mb_zip1}
                    readOnly
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm"
                    placeholder="우편번호"
                  />
                  <button
                    type="button"
                    onClick={handlePostcodeSearch}
                    className="rounded-xl border border-indigo-600 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    우편번호 검색
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">기본주소</label>
                <input
                  name="mb_addr1"
                  value={form.mb_addr1}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm"
                  placeholder="기본주소"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">상세주소</label>
                <input
                  name="mb_addr2"
                  value={form.mb_addr2}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="상세주소"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => router.push('/mypage')}
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                취소
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const { label, name, value, onChange, required, placeholder } = props;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
