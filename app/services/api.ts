import axios from 'axios';

function normalizeBase(input: unknown) {
  return String(input ?? '').trim().replace(/\/$/, '');
}

function ensureApiBase(baseUrl: string) {
  const base = normalizeBase(baseUrl);
  if (!base) return null;
  return base.endsWith('/api') ? base : `${base}/api`;
}

export function getApiBaseOrThrow() {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? '';
  const apiBase = ensureApiBase(raw);
  if (!apiBase) throw new Error('NEXT_PUBLIC_API_URL이 없습니다. (Vercel Env 확인)');
  return apiBase;
}

// ✅ 공용 axios
export const api = axios.create({
  baseURL: (() => {
    try {
      return getApiBaseOrThrow();
    } catch {
      return '';
    }
  })(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ 핵심: Bearer 토큰 자동 첨부 (네 로그인 저장 키: localStorage 'token')
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token'); // <- LoginForm에서 저장한 키
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});