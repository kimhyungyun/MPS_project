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

// ✅ 쿠키 기반이면 withCredentials true가 편함
export const api = axios.create({
  baseURL: (() => {
    try {
      return getApiBaseOrThrow();
    } catch {
      // 빌드/SSR 환경에서 undefined일 수 있어 런타임에서 잡히게 둠
      return '';
    }
  })(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});