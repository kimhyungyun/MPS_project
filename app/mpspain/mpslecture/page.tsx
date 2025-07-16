'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  videoId: string;
  userId: string;
}

export default function VideoPlayer({ videoId, userId }: Props) {
  const [otp, setOtp] = useState('');
  const [playbackInfo, setPlaybackInfo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.get('/api/vdocipher/play-token', {
          params: { videoId, userId },
        });
        setOtp(res.data.otp);
        setPlaybackInfo(res.data.playbackInfo);
      } catch (err) {
        console.error('토큰 요청 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [videoId, userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">영상을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!otp || !playbackInfo) {
    return (
      <div className="text-center mt-20 text-red-600">
        영상 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">강의 영상</h1>

      <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
        <iframe
          src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
          width="100%"
          height="100%"
          allowFullScreen
          allow="encrypted-media"
        />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">강의 소개</h2>
        <p className="text-gray-700 leading-relaxed">
          이 강의는 VdoCipher 기반 보안 스트리밍으로 제공되며, 기기 2대까지 시청 가능합니다.
        </p>
      </section>
    </main>
  );
}
