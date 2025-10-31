'use client';

import { useState, useEffect } from 'react';
import HlsPlayer from './HlsPlayer';


interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string;
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CF_STREAM_DOMAIN =
  process.env.NEXT_PUBLIC_STREAM_DOMAIN || 'media.mps-admin.com';

export default function MpsLecture() {
  console.log("✅ MpsLecture 렌더됨");

  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  // selected & streamUrl 상태 추적
  console.log("🎯 selected =", selected);
  console.log("🎯 streamUrl =", streamUrl);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`);
        const data = await res.json();
        setCourses(data);
      } catch {
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const preparePlay = async (course: Course) => {
    console.log("🟥 카드 클릭됨:", course.title);

    setSelected(course);
    setStreamUrl('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      const urlFromServer = data?.streamUrl;
      const fallback = `https://${CF_STREAM_DOMAIN}/${encodeURI(course.video_url)}/index.m3u8`;
      const finalUrl = urlFromServer || fallback;

      console.log('🎯 [FINAL STREAM URL]', finalUrl);
      setStreamUrl(finalUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('영상 재생 오류 발생');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">MPS 강의실</h1>

        <button 
          className="bg-red-500 text-white px-3 py-2 rounded mb-4"
          onClick={() => {
            setSelected({title:'TEST' } as any);
            setStreamUrl("https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8");
          }}
        >
          ✅ 플레이하기
        </button>

        {loadingList ? (
          <p className="text-center text-gray-500">강의 목록 로딩…</p>
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

              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
                <HlsPlayer src={streamUrl} />
              </div>

              {!streamUrl && (
                <p className="text-center text-gray-500 mb-4">
                  🔄 스트림 URL 준비중...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
