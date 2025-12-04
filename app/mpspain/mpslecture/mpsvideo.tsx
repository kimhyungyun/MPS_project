// src/app/.../mpsvideo/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import HlsPlayer from './hlsplayer';

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

interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type GroupKey = 'A' | 'B' | 'C' | 'D' | 'E';

const GROUP_META: Record<GroupKey, { label: string }> = {
  A: { label: 'A반' },
  B: { label: 'B반' },
  C: { label: '패키지 C' },
  D: { label: '패키지 D' },
  E: { label: '패키지 E' },
};

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
        } catch {
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
      } finally {
        setLoadingList(false);
      }
    };

    init();
  }, [router]);

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

      const res = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 403) {
        setErrorMsg('동영상 재생 권한이 없습니다.');
        setLoadingPlay(false);
        return;
      }

      const data = await res.json();
      setStreamUrl(data.streamUrl);
    } catch {
      setErrorMsg('영상 재생 중 오류 발생');
    } finally {
      setLoadingPlay(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (selectedGroup === 'A') return c.classGroup === 'A';
    if (selectedGroup === 'B') return c.classGroup === 'B';
    if (selectedGroup === 'C') return c.type === 'packageC';
    if (selectedGroup === 'D') return c.type === 'packageD';
    if (selectedGroup === 'E') return c.type === 'packageE';
    return false;
  });

  if (!user && !loadingList) return null;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-5xl mt-20 px-4 py-10 lg:py-12">

        {/* 탭 */}
        <section className="mb-6 flex flex-wrap items-center justify-center gap-3">
          {(Object.keys(GROUP_META) as GroupKey[]).map((key) => {
            const active = selectedGroup === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectGroup(key)}
                className={`flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium transition ${
                  active
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-700'
                }`}
              >
                {GROUP_META[key].label}
              </button>
            );
          })}
        </section>

        {/* 목록 */}
        <section ref={listRef}>
          {loadingList ? (
            <p>로딩중…</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {filteredCourses.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>{c.title}</td>
                      <td>
                        <button onClick={() => preparePlay(c)}>재생</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 모달 */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-5 shadow-xl">
              <button
                onClick={() => {
                  setSelected(null);
                  setStreamUrl('');
                  setErrorMsg('');
                }}
              >
                ✕
              </button>

              <h2>{selected.title}</h2>

              <div className="mb-4">
                {errorMsg ? (
                  <div>{errorMsg}</div>
                ) : (
                  <HlsPlayer src={streamUrl} />
                )}
              </div>

              {loadingPlay && !errorMsg && (
                <p>재생 준비...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
