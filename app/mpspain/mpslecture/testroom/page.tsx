'use client';

import TestVideoPlayer from './TestVideoPlayer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const lectureId = Number(searchParams.get('lectureId'));

  useEffect(() => {
    // 예: localStorage 또는 쿠키에서 userId 가져오기
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.mb_id); // mb_id가 userId
    }
  }, []);

  if (!userId || !lectureId) return <p>로딩 중...</p>;

  return <TestVideoPlayer/>;
}
