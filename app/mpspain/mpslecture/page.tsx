'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string; // 예: "facemusclefinal/1 안면근 최종" (폴더 경로까지만 저장)
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CF_STREAM_DOMAIN =
  process.env.NEXT_PUBLIC_STREAM_DOMAIN || 'media.mps-admin.com';

function HlsPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('🎯 [HLS PLAYER INIT] src =', src);

    const video = ref.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
        console.log("🚨 HLS LOAD STARTED, SRC = ", src); // <= 여기!
      // Hls 내부 요청 URL/상태를 전부 로그
      Hls.DefaultConfig.debug = true;

      // 모든 HLS 요청(m3u8/ts/key)에 쿠키 포함
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
        console.log('🍪 [HLS xhrSetup] document.cookie =', document.cookie);
      };

      const hls = new Hls();

      // Hls 이벤트 훅(원인 추적용)
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.log('🚨 HLS ERROR RAW EVENT', data);
        console.log('❌ [HLS ERROR]', JSON.stringify({
          type: data?.type,
          details: data?.details,
          fatal: data?.fatal,
          response: {
            code: (data as any)?.response?.code,
            text: (data as any)?.response?.text,
            url: (data as any)?.response?.url,
          }
        }));
      });

      hls.on(Hls.Events.MANIFEST_LOADING, (_evt, data) => {
        console.log('📥 [MANIFEST_LOADING]', data?.url);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        console.log('✅ [MANIFEST_PARSED] levels:', data?.levels?.length);
      });
      hls.on(Hls.Events.FRAG_LOADING, (_evt, data) => {
        console.log('📦 [FRAG_LOADING]', data?.frag?.url);
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => hls.destroy();
    } else {
      // Safari 등 네이티브 HLS
      (video as HTMLVideoElement).src = src;
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

  // 진단 로그
  console.log('✅ API_BASE_URL:', API_BASE_URL);
  console.log('✅ 강의 목록 요청 URL:', `${API_BASE_URL}/api/lectures`);

  // 강의 목록
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Course[];
        console.log('📚 [COURSES]', data);
        setCourses(data);
      } catch (e: any) {
        console.error('❌ [LECTURE LIST ERROR]', e);
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // 재생 준비 (쿠키 발급 → streamUrl 세팅)
  const preparePlay = async (course: Course) => {
    console.log('👆 [CLICK COURSE]', course.id, course.title);
    console.log('📦 [RAW video_url from DB]', course.video_url);

    setSelected(course);
    setLoadingPlay(true);
    setErrorMsg('');
    setStreamUrl('');

    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      console.log('🔑 [TOKEN]', token ? '[present]' : '[missing]');
      console.log('🌐 [AUTH CALL]', `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`);

      if (!token) {
        alert('로그인이 필요합니다.');
        setLoadingPlay(false);
        return;
      }

      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include', // 쿠키 저장
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📡 [AUTH STATUS]', playAuth.status);
      console.log('🍪 [AFTER AUTH] document.cookie =', document.cookie);

      if (!playAuth.ok) {
        const t = await playAuth.text();
        console.error('🔥 [AUTH FAIL BODY]', t);
        throw new Error(`play-auth failed: ${playAuth.status} ${t}`);
      }

      const data = await playAuth.json();
      console.log('✅ [SERVER DATA]', data);

      const urlFromServer = data?.streamUrl as string | undefined;
      // 혹시 서버가 못 주면 폴더 경로 + index.m3u8로 fallback
      const fallback = `https://${CF_STREAM_DOMAIN}/${encodeURI(course.video_url)}/index.m3u8`;

      const finalUrl = urlFromServer || fallback;
      console.log('🎯 [FINAL STREAM URL]', finalUrl);

      setStreamUrl(finalUrl);
    } catch (err) {
      console.error('❌ [PREPARE PLAY ERROR]', err);
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder.png'; // 썸네일 없을 때 폴백
                  }}
                />
                <h2 className="text-lg font-semibold mb-2">{c.title}</h2>
                <p className="text-gray-600 text-sm">{c.description}</p>
              </div>
            ))}
          </div>
        )}
        {(() => {
          console.log("🎯 최종 렌더 직전 streamUrl =", streamUrl);
          console.log("🎯 selected =", selected);
          console.log("🎯 typeof selected =", typeof selected);
          return null;
        })()}
        {true && (
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
              <h2 className="text-2xl font-bold mb-4">{selected?.title}</h2>

              {loadingPlay ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-500">영상 준비 중...</p>
                </div>
              ) : errorMsg || !streamUrl ? (
                <p className="text-center text-red-600 mt-20">
                  {errorMsg || '영상 준비 실패'}
                </p>
              ) : (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
                  <HlsPlayer src={streamUrl} />
                </div>
              )}

              <p className="text-gray-700 mt-4">{selected?.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
