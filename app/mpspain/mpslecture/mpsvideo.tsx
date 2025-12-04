'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  description: string; // 🔥 영문 이름 포함 가능
  price: number;
  thumbnail_url: string;
  video_folder?: string;   // 🔥 복구
  video_name?: string;     // 🔥 복구
  type: LectureType;
  classGroup: ClassGroup;
}

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ------------------------------------------------------------
// HLS Player
// ------------------------------------------------------------

function HlsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();

      // 🔑 여기서 CloudFront 서명 쿠키 같이 보내도록 설정
      hls.config.xhrSetup = (xhr, url) => {
        xhr.withCredentials = true;
      };

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
      crossOrigin="use-credentials"   // 🔑 서명 쿠키 쓰는 구조면 이게 안전함
      className="w-full rounded-lg shadow border bg-black"
    />
  );
}

// ------------------------------------------------------------
// 탭 UI
// ------------------------------------------------------------

type GroupKey = 'A' | 'B' | 'C' | 'D' | 'E';

const GROUP_META: Record<
  GroupKey,
  { label: string; subtitle: string; description: string }
> = {
  A: {
    label: 'A반',
    subtitle: 'CLASS GROUP A',
    description: 'A반 캠프 수강생을 위한 강의 모음입니다.',
  },
  B: {
    label: 'B반',
    subtitle: 'CLASS GROUP B',
    description: 'B반 캠프 수강생을 위한 강의 모음입니다.',
  },
  C: {
    label: 'C 패키지',
    subtitle: 'PACKAGE C',
    description: '안면부, 어깨, 경추 영역을 묶은 패키지 강의입니다.',
  },
  D: {
    label: 'D 패키지',
    subtitle: 'PACKAGE D',
    description: '허리, 대퇴부에 초점을 맞춘 패키지입니다.',
  },
  E: {
    label: 'E 패키지',
    subtitle: 'PACKAGE E',
    description: '상지, 가슴, 슬하부를 통합한 패키지 구성입니다.',
  },
};

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------

export default function Mpsvideo() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>('A');

  const listRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------------------------------------
  // 로그인 + 강의목록
  // ------------------------------------------------------------

  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          router.push('/form/login');
          return;
        }

        let parsedUser: User;
        try {
          parsedUser = JSON.parse(raw) as User;
        } catch (e) {
          router.push('/form/login');
          return;
        }

        setUser(parsedUser);

        const res = await fetch(`${API_BASE_URL}/api/lectures`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('강의 목록 API 실패');

        const data = await res.json();
        setCourses(data);
      } catch (e) {
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    };

    init();
  }, [router]);

  // ------------------------------------------------------------
  // 탭 선택
  // ------------------------------------------------------------

  const handleSelectGroup = (key: GroupKey) => {
    setSelectedGroup(key);
    setSelected(null);
    setStreamUrl('');
    setErrorMsg('');

    setTimeout(() => {
      listRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  // ------------------------------------------------------------
  // 재생 준비
  // ------------------------------------------------------------

  const preparePlay = async (course: Course) => {
    setSelected(course);
    setStreamUrl('');
    setErrorMsg('');
    setLoadingPlay(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/form/login');
        return;
      }

      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (playAuth.status === 403) {
        setErrorMsg('이 강의를 시청할 권한이 없습니다.');
        setLoadingPlay(false);
        return;
      }

      if (!playAuth.ok) throw new Error('Auth failed');

      const data = await playAuth.json();
      setStreamUrl(data.streamUrl);
    } catch (err) {
      setErrorMsg('영상 재생 중 오류가 발생했습니다.');
    } finally {
      setLoadingPlay(false);
    }
  };

  // ------------------------------------------------------------
  // 강의 필터링
  // ------------------------------------------------------------

  const filteredCourses = courses.filter((c) => {
    if (selectedGroup === 'A') return c.classGroup === 'A';
    if (selectedGroup === 'B') return c.classGroup === 'B';
    if (selectedGroup === 'C') return c.type === 'packageC';
    if (selectedGroup === 'D') return c.type === 'packageD';
    if (selectedGroup === 'E') return c.type === 'packageE';
    return false;
  });

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  if (!user && !loadingList) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl mt-40 px-4 py-10 lg:py-12">

        {/* ------------------------------------------------------------ */}
        {/* 탭 */}
        {/* ------------------------------------------------------------ */}

        <section className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(GROUP_META) as GroupKey[]).map((key) => {
            const meta = GROUP_META[key];
            const active = selectedGroup === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectGroup(key)}
                className={`flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium transition ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 강의 목록 */}
        {/* ------------------------------------------------------------ */}

        <section ref={listRef}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              {GROUP_META[selectedGroup].label} 강의 목록
            </h3>
            <p className="text-xs text-slate-500">
              총 <span className="font-semibold">{filteredCourses.length}</span> 개 강의
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              선택한 구성에 해당하는 강의가 없습니다.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-16 px-4 py-3 text-center text-xs font-semibold text-slate-500">
                      번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      강의명
                    </th>
                    <th className="w-28 px-4 py-3 text-center text-xs font-semibold text-slate-500">
                      재생
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2.5 text-center text-xs text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-800">
                        {/* 🔥 title + (영문) */}
                        {c.title}
                        {c.description && (
                          <span className="ml-1 text-xs text-slate-500">
                            ({c.description})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => preparePlay(c)}
                          className="inline-flex items-center justify-center rounded-full border border-indigo-500 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          재생
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------ */}
        {/* 영상 모달 */}
        {/* ------------------------------------------------------------ */}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-5 shadow-xl">
              <button
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
                onClick={() => {
                  setSelected(null);
                  setStreamUrl('');
                  setErrorMsg('');
                }}
              >
                ✕
              </button>

              <h2 className="mb-4 pr-8 text-xl font-semibold text-slate-900">
                {selected.title}
                {selected.description && (
                  <span className="ml-2 text-sm text-slate-500">
                    ({selected.description})
                  </span>
                )}
              </h2>

              <div className="mb-4 overflow-hidden rounded-xl border">
                <div className="aspect-video w-full bg-black">
                  <HlsPlayer src={streamUrl} />
                </div>
              </div>

              {!streamUrl && !errorMsg && (
                <p className="mb-3 text-center text-xs text-slate-500">
                  🔄 스트림 URL 준비중...
                </p>
              )}

              {loadingPlay && (
                <p className="mb-2 text-center text-xs text-slate-500">
                  재생 인증 처리 중입니다…
                </p>
              )}

              {errorMsg && (
                <p className="mb-2 text-center text-xs text-red-600">
                  {errorMsg}
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
