     'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string; // ✅ S3 출력 폴더명(videoId)만 저장 (예: "facemusclefinal")
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // 예: https://api.mps-admin.com
const CF_STREAM_DOMAIN = process.env.NEXT_PUBLIC_STREAM_DOMAIN || 'dookesj1vlw1l.cloudfront.net'; 
// 나중에 media.mps-admin.com으로 바꾸면 .env만 바꿔 끼우면 됨

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
      // Safari (HLS 네이티브)
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={ref}
      controls
      playsInline
      className="w-full rounded-lg shadow border"
    />
  );
}

export default function MpsLecture() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 강의 목록
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' },
          // 목록은 쿠키 불필요
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Course[];
        setCourses(data);
      } catch (e: any) {
        console.error(e);
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // 재생 준비 (쿠키 발급 → streamUrl 세팅)
  const preparePlay = async (course: Course) => {
    setSelected(course);
    setLoadingPlay(true);
    setErrorMsg('');
    setStreamUrl('');

    try {
      // 1) CloudFront 서명 쿠키 발급
      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include', // ✅ 중요: 쿠키를 브라우저에 저장
        }
      );

      if (!playAuth.ok) {
        const t = await playAuth.text();
        throw new Error(`play-auth failed: ${playAuth.status} ${t}`);
      }

      const data = await playAuth.json();
      // 2) 서버가 리턴한 streamUrl 사용 (권장)
      const urlFromServer = data?.streamUrl as string | undefined;

      // 혹시 직접 조립이 필요하면 아래처럼 fallback 가능 (video_url = videoId)
     const fallback = `https://${CF_STREAM_DOMAIN}/${encodeURI(course.video_url)}/index.m3u8`;

      setStreamUrl(urlFromServer || fallback);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('영상 재생 준비 중 문제가 발생했습니다.');
    } finally {
      setLoadingPlay(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">MPS 강의실</h1>

        {loadingList ? (
          <p className="text-center text-gray-500">강의 목록을 불러오는 중입니다...</p>
        ) : errorMsg ? (
          <p className="text-center text-red-600">{errorMsg}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl"
                onClick={() => preparePlay(c)}
              >
                <img
                  src={c.thumbnail_url}
                  alt={c.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold mb-2">{c.title}</h2>
                <p className="text-gray-600 text-sm">{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setSelected(null);
                  setStreamUrl('');
                }}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4">{selected.title}</h2>

              {loadingPlay ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-500">영상 준비 중...</p>
                </div>
              ) : errorMsg || !streamUrl ? (
                <p className="text-center text-red-600 mt-20">{errorMsg || '영상 준비 실패'}</p>
              ) : (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
                  <HlsPlayer src={streamUrl} />
                </div>
              )}

              <p className="text-gray-700 mt-4">{selected.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
