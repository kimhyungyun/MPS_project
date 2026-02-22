import { api, getApiBaseOrThrow } from './api';

export type MyProfile = {
  mb_no: number | null;
  mb_id: string;
  mb_level: number;
  isAdmin: boolean;

  mb_name: string | null;
  mb_nick: string | null;
  mb_email: string | null;
  mb_hp: string | null;
};

export async function fetchMyProfile(): Promise<MyProfile> {
  // baseURL이 빈 경우 대비 (런타임에서 확정)
  api.defaults.baseURL = getApiBaseOrThrow();

  const res = await api.get('/auth/profile');
  const data = res.data?.data;
  if (!data) throw new Error('프로필 응답이 비어있습니다.');
  return data as MyProfile;
}