'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string; // ✅ S3 출력 폴더명(videoId)만 저장
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CF_STREAM_DOMAIN = process.env.NEXT_PUBLIC_STREAM_DOMAIN || 'dookesj1vlw1l.cloudfront.net';

function HlsPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);

  return <video ref={ref} controls playsInline className="w-full rounded-lg shadow border" />;
}

export default function MpsLecture() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Course[];
        setCourses(data);
      } catch (e) {
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // ✅ 여기 수정 완료
  const preparePlay = async (course: Course) => {
    setSelected(course);
    setLoadingPlay(true);
    setErrorMsg('');
    setStreamUrl('');

    try {
      // ✅ 1) 토큰 안전 확보 (SSR / 초기 hydration 대비)
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        alert('로그인이 필요합니다.');
        setLoadingPlay(false);
        return;
      }
      console.log("🔥 PLAY REQUEST START");
      console.log("🔥 TOKEN SENT:", localStorage.getItem('token'));


      // ✅ 2) CloudFront 서명 쿠키 발급 요청
      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ 안전하게 보장된 token만 사용
          },
        }
      );

      if (!playAuth.ok) {
        const t = await playAuth.text();
        throw new Error(`play-auth failed: ${playAuth.status} ${t}`);
      }

      const data = await playAuth.json();
      const urlFromServer = data?.streamUrl;
      const fallback = `https://${CF_STREAM_DOMAIN}/${encodeURI(course.video_url)}/index.m3u8`;

      setStreamUrl(urlFromServer || fallback);
    } catch (err) {
      console.error(err);
      setErrorMsg('영상 재생 준비 중 문제가 발생했습니다.');
    } finally {
      setLoadingPlay(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 이하 기존 UI는 그대로 유지 */}
      ...
    </section>
  );
}
