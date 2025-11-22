'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

type LectureType =
  | 'single'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

type ClassGroup = 'A' | 'B' | 'S';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_folder?: string;
  video_name?: string;
  type: LectureType;
  classGroup: ClassGroup;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function HlsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      Hls.DefaultConfig.debug = true;
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
        console.log(' 🍪 [xhrSetup cookie]', document.cookie);
      };

      const hls = new Hls();

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.log('❌ [HLS ERROR]', data);
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="w-full rounded-lg shadow border"
    />
  );
}

type GroupKey = 'A_CLASS' | 'B_CLASS' | 'PKG_C' | 'PKG_D' | 'PKG_E' | null;

export default function Mpsvideo() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>('A_CLASS'); // 기본 A반

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`);
        const data = await res.json();
        setCourses(data);
      } catch (e) {
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const preparePlay = async (course: Course) => {
    setSelected(course);
    setStreamUrl('');
    setErrorMsg('');
    setLoadingPlay(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!playAuth.ok) throw new Error('Auth failed');
      const data = await playAuth.json();

      setStreamUrl(data.streamUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('영상 재생 중 오류');
    } finally {
      setLoadingPlay(false);
    }
  };

  // 선택된 그룹 기준으로 강의 필터
  const filteredCourses = courses.filter((c) => {
    if (!selectedGroup) return false;

    if (selectedGroup === 'A_CLASS') return c.classGroup === 'A';
    if (selectedGroup === 'B_CLASS') return c.classGroup === 'B';
    if (selectedGroup === 'PKG_C') return c.type === 'packageC';
    if (selectedGroup === 'PKG_D') return c.type === 'packageD';
    if (selectedGroup === 'PKG_E') return c.type === 'packageE';

    return false;
  });

  const GroupCard = ({
    active,
    title,
    subtitle,
    description,
    onClick,
  }: {
    active: boolean;
    title: string;
    subtitle: string;
    description: string;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm cursor-pointer transition 
      ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-[1.01]' : 'bg-white hover:shadow-md'}`}
    >
      <div>
        <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
          {subtitle}
        </p>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className={`text-sm ${active ? 'opacity-90' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      <div className="mt-4 text-sm font-medium flex items-center gap-1">
        {active ? '선택됨 • 강의 목록 아래에서 확인' : '구성 보기'}
        <span>{active ? '👀' : '▶️'}</span>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">MPS 강의실</h1>

        {/* 상단: A/B반 vs 패키지 모음 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* A/B반 영역 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">캠프 수강생 전용 강의</h2>
            <p className="text-sm text-gray-600 mb-4">
              A/B반으로 나뉜 캠프 강의 구성입니다. 캠프 수강 권한이 있는 경우 재생 가능합니다.
            </p>
            <div className="space-y-4">
              <GroupCard
                active={selectedGroup === 'A_CLASS'}
                title="A반 강의영상"
                subtitle="CLASS GROUP A"
                description="A반 수강생을 위한 강의 모음입니다."
                onClick={() => setSelectedGroup('A_CLASS')}
              />
              <GroupCard
                active={selectedGroup === 'B_CLASS'}
                title="B반 강의영상"
                subtitle="CLASS GROUP B"
                description="B반 수강생을 위한 강의 모음입니다."
                onClick={() => setSelectedGroup('B_CLASS')}
              />
            </div>
          </div>

          {/* C/D/E 패키지 영역 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">유료 패키지 강의 모음</h2>
            <p className="text-sm text-gray-600 mb-4">
              부위별로 나뉜 유료 패키지 강의 구성입니다. 해당 패키지 결제 후 시청 가능합니다.
            </p>
            <div className="space-y-4">
              <GroupCard
                active={selectedGroup === 'PKG_C'}
                title="안면부, 어깨, 경추 강의 모음"
                subtitle="PACKAGE C"
                description="안면부, 어깨, 경추 영역을 집중 구성한 패키지입니다."
                onClick={() => setSelectedGroup('PKG_C')}
              />
              <GroupCard
                active={selectedGroup === 'PKG_D'}
                title="허리, 대퇴부 강의 모음"
                subtitle="PACKAGE D"
                description="허리와 대퇴부에 특화된 강의 패키지입니다."
                onClick={() => setSelectedGroup('PKG_D')}
              />
              <GroupCard
                active={selectedGroup === 'PKG_E'}
                title="상지, 가슴, 슬하부 강의 모음"
                subtitle="PACKAGE E"
                description="상지, 가슴, 슬하부를 묶은 패키지 구성입니다."
                onClick={() => setSelectedGroup('PKG_E')}
              />
            </div>
          </div>
        </div>

        {/* 목록 / 에러 / 로딩 */}
        {loadingList ? (
          <p className="text-center text-gray-500">강의 목록을 불러오는 중…</p>
        ) : errorMsg ? (
          <p className="text-center text-red-600">{errorMsg}</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-500">
            선택한 구성에 해당하는 강의가 없습니다.
          </p>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4">
              선택된 구성의 강의 목록 ({filteredCourses.length}개)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl transition"
                  onClick={() => preparePlay(c)}
                >
                  <img
                    src={c.thumbnail_url}
                    alt={c.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                    {c.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 영상 모달 */}
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

              <p className="text-gray-700">{selected.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
