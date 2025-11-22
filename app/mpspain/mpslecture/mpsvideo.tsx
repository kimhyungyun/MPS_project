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
      Hls.DefaultConfig.debug = false;
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
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
      className="w-full rounded-xl border bg-black"
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

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`);
        const data = await res.json();
        setCourses(data);
      } catch (e) {
        console.error(e);
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const handleSelectGroup = (key: GroupKey) => {
    setSelectedGroup(key);

    // 구성 선택 후 아래 강의 목록으로 스무스 스크롤
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 0);
  };

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
      setErrorMsg('영상 재생 중 오류가 발생했습니다.');
    } finally {
      setLoadingPlay(false);
    }
  };

  // 선택된 구성 기준으로 필터링
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
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col justify-between rounded-2xl border p-4 text-left transition 
      ${active ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md'}`}
    >
      <div>
        <p
          className={`text-[11px] font-medium tracking-wide ${
            active ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          {subtitle}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        <p
          className={`mt-2 text-sm ${
            active ? 'text-indigo-50' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      </div>
      <div className="mt-3 flex items-center text-xs font-medium">
        <span className="mr-1">{active ? '선택됨' : '구성 보기'}</span>
        <span>{active ? '👀' : '▶️'}</span>
      </div>
    </button>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
        {/* 헤더 */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            MPS 강의실
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            캠프 수강생용 강의와 부위별 유료 패키지 강의를 한 곳에서 관리합니다.
          </p>
        </header>

        {/* 상단 구성 선택 영역 */}
        <section className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* A/B반 */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              캠프 수강생 전용 강의
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A/B반 캠프 수강생만 시청 가능한 강의 구성입니다.
            </p>

            <div className="mt-4 space-y-3">
              <GroupCard
                active={selectedGroup === 'A_CLASS'}
                title="A반 강의영상"
                subtitle="CLASS GROUP A"
                description="A반 수강생을 위한 강의 모음입니다."
                onClick={() => handleSelectGroup('A_CLASS')}
              />
              <GroupCard
                active={selectedGroup === 'B_CLASS'}
                title="B반 강의영상"
                subtitle="CLASS GROUP B"
                description="B반 수강생을 위한 강의 모음입니다."
                onClick={() => handleSelectGroup('B_CLASS')}
              />
            </div>
          </div>

          {/* C/D/E 패키지 */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              유료 패키지 강의 모음
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              부위별로 구성된 패키지 강의입니다. 해당 패키지 결제 후 시청 가능합니다.
            </p>

            <div className="mt-4 space-y-3">
              <GroupCard
                active={selectedGroup === 'PKG_C'}
                title="안면부, 어깨, 경추 강의 모음"
                subtitle="PACKAGE C"
                description="안면부, 어깨, 경추 영역을 묶은 패키지 구성입니다."
                onClick={() => handleSelectGroup('PKG_C')}
              />
              <GroupCard
                active={selectedGroup === 'PKG_D'}
                title="허리, 대퇴부 강의 모음"
                subtitle="PACKAGE D"
                description="허리 및 대퇴부에 초점을 맞춘 패키지입니다."
                onClick={() => handleSelectGroup('PKG_D')}
              />
              <GroupCard
                active={selectedGroup === 'PKG_E'}
                title="상지, 가슴, 슬하부 강의 모음"
                subtitle="PACKAGE E"
                description="상지, 가슴, 슬하부를 통합한 패키지 구성입니다."
                onClick={() => handleSelectGroup('PKG_E')}
              />
            </div>
          </div>
        </section>

        {/* 목록 / 에러 / 로딩 */}
        {loadingList ? (
          <p className="text-center text-sm text-slate-500">
            강의 목록을 불러오는 중입니다…
          </p>
        ) : errorMsg ? (
          <p className="text-center text-sm text-red-600">{errorMsg}</p>
        ) : (
          <section ref={listRef}>
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                선택된 구성의 강의 목록
              </h3>
              <p className="text-xs text-slate-500">
                총{' '}
                <span className="font-semibold">
                  {filteredCourses.length}
                </span>
                개 강의
              </p>
            </div>

            {filteredCourses.length === 0 ? (
              <p className="text-center text-sm text-slate-500">
                선택한 구성에 해당하는 강의가 없습니다.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((c) => (
                  <article
                    key={c.id}
                    className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                    onClick={() => preparePlay(c)}
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={c.thumbnail_url}
                        alt={c.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {c.title}
                      </h4>
                      <p className="mt-2 line-clamp-3 text-xs text-slate-600">
                        {c.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 영상 모달 */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-5 shadow-xl">
              <button
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
                onClick={() => {
                  setSelected(null);
                  setStreamUrl('');
                }}
              >
                ✕
              </button>

              <h2 className="mb-4 pr-8 text-xl font-semibold text-slate-900">
                {selected.title}
              </h2>

              <div className="mb-4 overflow-hidden rounded-xl border">
                <div className="aspect-video w-full bg-black">
                  <HlsPlayer src={streamUrl} />
                </div>
              </div>

              {!streamUrl && (
                <p className="mb-3 text-center text-xs text-slate-500">
                  🔄 스트림 URL 준비중...
                </p>
              )}

              {loadingPlay && (
                <p className="mb-2 text-center text-xs text-slate-500">
                  재생 인증 처리 중입니다…
                </p>
              )}

              <p className="text-sm text-slate-700">{selected.description}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
