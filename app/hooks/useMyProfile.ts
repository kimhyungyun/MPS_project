'use client';

import { useEffect, useState } from 'react';
import { fetchMyProfile, MyProfile } from '@/app/services/auth';

export function useMyProfile() {
  const [me, setMe] = useState<MyProfile | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingMe(true);
        const profile = await fetchMyProfile();
        if (alive) setMe(profile);
      } catch (e) {
        // 결제 페이지에서 로그인 안 됐으면 여기서 실패할 수 있음
        if (alive) setMe(null);
      } finally {
        if (alive) setLoadingMe(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return { me, loadingMe };
}