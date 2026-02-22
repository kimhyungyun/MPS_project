// app/services/auth.ts
import axios from 'axios';

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const api = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;

export async function fetchMyProfile() {
  const res = await axios.get(`${api}/auth/profile`, {
    withCredentials: true, // 쿠키 기반이면 필요
    // Authorization Bearer 쓰는 구조면 여기 headers 추가해야 함
  });
  return res.data?.data; // { mb_name, mb_email, mb_hp, ... }
}