// app/mpspain/mpslecture/mpsvideo.tsx
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
type GroupKey = 'A' | 'B' | 'C' | 'D' | 'E';
type DayKey = 1 | 2 | 3;

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
  day?: number | null;
  sortOrder?: number | null;
}

interface User {
  mb_no: number;
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const GROUP_META: Record<
  GroupKey,
  { label: string; subtitle: string; description: string }
> = {
  A: {
    label: '상지반',
    subtitle: 'CLASS GROUP A',
    description: '상지반 캠프 수강생을 위한 강의 모음입니다.',
  },
  B: {
    label: '하지반',
    subtitle: 'CLASS GROUP B',
    description: '하지반 캠프 수강생을 위한 강의 모음입니다.',
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

function getDeviceId() {
  if (typeof window === 'undefined') return 'unknown-device';

  let id = localStorage.getItem('device_id');
  if (!id) {
    if ('crypto' in window && 'randomUUID' in crypto) {
      id = crypto.randomUUID();
    } else {
      id = `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    }
    localStorage.setItem('device_id', id);
  }
  return id;
}

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
  const [selectedDay, setSelectedDay] = useState<DayKey>(1);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
          router.push('/form/login');
          return;
        }

        const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        if (profileRes.status === 401) {
          router.push('/form/login');
          return;
        }

        if (!profileRes.ok) {
          throw new Error('프로필 조회 실패');
        }

        const profileJson: { success: boolean; data: any } =
          await profileRes.json();

        const profile = profileJson.data;

        if (!profile || typeof profile.mb_no !== 'number') {
          throw new Error('프로필에 mb_no 정보가 없습니다.');
        }

        const normalizedUser: User = {
          mb_no: profile.mb_no,
          mb_id: profile.mb_id,
          mb_name: profile.mb_name,
          mb_nick: profile.mb_nick,
          mb_level: Number(profile.mb_level ?? 0),
        };

        setUser(normalizedUser);

        const lecturesRes = await fetch(`${API_BASE_URL}/api/lectures`, {
          credentials: 'include',
        });

        if (!lecturesRes.ok) throw new Error('강의 목록 API 실패');

        const data: Course[] = await lecturesRes.json();
        setCourses(data);
      } catch (e) {
        console.error(e);
        setErrorMsg('강의 목록을 불러오지 못했습니다.');
      } finally {
        setLoadingList(false);
      }
    };

    init();
  }, [router]);

  const handleSelectGroup = (key: GroupKey) => {
    setSelectedGroup(key);
    setSelectedDay(1);
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

  const handleSelectDay = (day: DayKey) => {
    setSelectedDay(day);
    setSelected(null);
    setStreamUrl('');
    setErrorMsg('');
  };

  const preparePlay = async (course: Course) => {
    setSelected(null);
    setStreamUrl('');
    setErrorMsg('');
    setLoadingPlay(true);

    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        router.push('/form/login');
        return;
      }

      if (!user || !user.mb_no) {
        throw new Error('유저 정보가 올바르지 않습니다. (mb_no 없음)');
      }

      const userId = user.mb_no;
      const deviceId = getDeviceId();
      const deviceName =
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : 'Unknown Device';

      const deviceCheckRes = await fetch(
        `${API_BASE_URL}/api/video-authorities/devices/check`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId,
            deviceId,
            deviceName,
          }),
        },
      );

      if (!deviceCheckRes.ok) {
        throw new Error('기기 인증에 실패했습니다.');
      }

      const deviceResult: {
        allowed: boolean;
        reason?: string;
        devices?: any[];
      } = await deviceCheckRes.json();

      if (!deviceResult.allowed) {
        const msg =
          deviceResult.reason === 'DEVICE_LIMIT_EXCEEDED'
            ? '등록 가능한 기기(2대)를 초과했습니다. 관리자에게 문의해 주세요.'
            : '이 기기에서는 영상을 재생할 수 없습니다.';

        setErrorMsg(msg);
        alert(msg);
        setLoadingPlay(false);
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
        setLoadingPlay(false);
        alert('이 강의를 시청할 권한이 없습니다.');
        return;
      }

      if (!playAuth.ok) {
        throw new Error('재생 인증 API 실패');
      }

      const data: { ok?: boolean; streamUrl: string } = await playAuth.json();

      setSelected(course);
      setStreamUrl(data.streamUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('영상 재생 중 오류가 발생했습니다.');
    } finally {
      setLoadingPlay(false);
    }
  };

  const isDayGroup = selectedGroup === 'A' || selectedGroup === 'B';

  const baseCourses = courses.filter((c) => {
    if (selectedGroup === 'A') return c.classGroup === 'A';
    if (selectedGroup === 'B') return c.classGroup === 'B';
    if (selectedGroup === 'C') return c.type === 'packageC';
    if (selectedGroup === 'D') return c.type === 'packageD';
    if (selectedGroup === 'E') return c.type === 'packageE';
    return false;
  });

  const filteredCourses = baseCourses
    .filter((c) => {
      if (!isDayGroup) return true;
      return Number(c.day) === selectedDay;
    })
    .sort((a, b) => {
      const aSort = a.sortOrder ?? 0;
      const bSort = b.sortOrder ?? 0;

      if (aSort !== bSort) return aSort - bSort;
      return a.id - b.id;
    });

  const dayCounts: Record<DayKey, number> = {
    1: baseCourses.filter((c) => Number(c.day) === 1).length,
    2: baseCourses.filter((c) => Number(c.day) === 2).length,
    3: baseCourses.filter((c) => Number(c.day) === 3).length,
  };

  if (!user && !loadingList) return null;

  const watermarkText = user
    ? `${user.mb_id} (${user.mb_name})`
    : 'unknown-user';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl mt-40 px-4 py-10 lg:py-12">
        {errorMsg && !selected && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

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

        {isDayGroup && (
          <section className="mb-6 flex justify-center">
            <div className="flex w-full max-w-md rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {([1, 2, 3] as DayKey[]).map((day) => {
                const active = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}일차
                    <span
                      className={`ml-1 text-xs ${
                        active ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      ({dayCounts[day]})
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section ref={listRef}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              {GROUP_META[selectedGroup].label}
              {isDayGroup && ` ${selectedDay}일차`} 강의 목록
            </h3>

            <p className="text-xs text-slate-500">
              총 <span className="font-semibold">{filteredCourses.length}</span>{' '}
              개 강의
            </p>
          </div>

          {loadingList ? (
            <p className="text-center text-sm text-slate-500">
              강의 목록을 불러오는 중입니다…
            </p>
          ) : filteredCourses.length === 0 ? (
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
                  {streamUrl ? (
                    <HlsPlayer
                      src={streamUrl}
                      autoPlay
                      watermarkText={watermarkText}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-200">
                      {errorMsg ? '재생할 수 없습니다.' : '스트림 URL 준비중...'}
                    </div>
                  )}
                </div>
              </div>

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