'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ----------------------------
// 타입 정의
// ----------------------------
interface UserProfile {
  mb_no: number;
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

interface VideoAuthority {
  id: number;
  userId: number;
  classGroup: 'A' | 'B' | 'S' | null;
  type: 'single' | 'packageA' | 'packageB' | 'packageC' | 'packageD' | 'packageE';
  createdAt?: string;
}

interface VideoDevice {
  id: number;
  userId: number;
  deviceId: string;
  deviceName: string | null;
  registeredAt: string;
}

// ----------------------------
// 컴포넌트
// ----------------------------
export default function AuthorityAdminPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [searchUserId, setSearchUserId] = useState<string>('');
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  const [authorities, setAuthorities] = useState<VideoAuthority[]>([]);
  const [devices, setDevices] = useState<VideoDevice[]>([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 권한 편집용
  const [classGroups, setClassGroups] = useState<string[]>([]);
  const [videoTypes, setVideoTypes] = useState<string[]>([]);

  // ----------------------------
  // 로그인한 관리자 정보 확인
  // ----------------------------
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) return;

        const json = await res.json();
        console.log('🔥 profile json:', json);

        if (!json?.success || !json.data) return;

        const profile: UserProfile = json.data;

        setCurrentUser(profile);
      } catch (e) {
        console.error(e);
      }
    };

    init();
  }, []);

  // ----------------------------
  // 유저 검색 (mb_no 기준)
  // ----------------------------
  const handleSearchUser = async () => {
    setMsg('');
    setError('');
    setAuthorities([]);
    setDevices([]);
    setTargetUser(null);

    const idNum = Number(searchUserId);
    if (!idNum || Number.isNaN(idNum)) {
      setError('mb_no(회원번호)를 숫자로 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인 토큰이 없습니다.');
        return;
      }

      // 1) 프로필 대신, mb_no로 조회하는 간단한 API가 따로 있으면 그걸 쓰는 게 베스트고,
      //    없다면 일단 auth/profile을 재사용해서 현재 로그인 정보를 기준으로만 관리하도록 사용해도 됨.
      //    여기서는 "해당 mb_no의 권한/기기만 불러온다"에 집중.
      const userProfile: UserProfile = {
        mb_no: idNum,
        mb_id: `user#${idNum}`,
        mb_name: '',
        mb_nick: '',
        mb_level: 0,
      };
      setTargetUser(userProfile);

      // 2) 권한 목록
      const authRes = await fetch(
        `${API_BASE_URL}/api/video-authorities?userId=${idNum}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (authRes.ok) {
        const authJson = await authRes.json();
        setAuthorities(authJson || []);
      } else {
        console.error('Failed to load authorities', authRes.status);
      }

      // 3) 기기 목록
      const devRes = await fetch(
        `${API_BASE_URL}/api/video-authorities/devices?userId=${idNum}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (devRes.ok) {
        const devJson = await devRes.json();
        setDevices(devJson || []);
      } else {
        console.error('Failed to load devices', devRes.status);
      }

      setMsg('회원 정보를 불러왔습니다.');
    } catch (e: any) {
      console.error(e);
      setError('회원 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 체크박스 토글 유틸
  // ----------------------------
  const toggleInArray = (list: string[], value: string) => {
    if (list.includes(value)) {
      return list.filter((v) => v !== value);
    }
    return [...list, value];
  };

  // ----------------------------
  // 권한 저장
  // ----------------------------
  const handleSaveAuthorities = async () => {
    if (!targetUser) {
      setError('먼저 회원을 조회해 주세요.');
      return;
    }

    try {
      setLoading(true);
      setMsg('');
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인 토큰이 없습니다.');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/video-authorities`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: targetUser.mb_no,
          classGroups,
          videoTypes,
        }),
      });

      if (!res.ok) {
        console.error('save authorities failed', res.status);
        setError('권한 저장에 실패했습니다.');
        return;
      }

      await handleSearchUser();
      setMsg('권한이 저장되었습니다.');
    } catch (e: any) {
      console.error(e);
      setError('권한 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 기기 초기화
  // ----------------------------
  const handleResetDevices = async () => {
    if (!targetUser) {
      setError('먼저 회원을 조회해 주세요.');
      return;
    }

    if (!confirm('정말 이 사용자의 등록 기기를 모두 초기화하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setMsg('');
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인 토큰이 없습니다.');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/video-authorities/devices/reset`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: targetUser.mb_no,
        }),
      });

      if (!res.ok) {
        console.error('reset devices failed', res.status);
        setError('기기 초기화에 실패했습니다.');
        return;
      }

      setMsg('기기 등록 내역을 초기화했습니다.');
      setDevices([]);
    } catch (e: any) {
      console.error(e);
      setError('기기 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  const isAdmin = currentUser && currentUser.mb_level >= 8;

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-800 text-sm">
            관리자만 접근할 수 있는 페이지입니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl mt-24 px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              수강 권한 &amp; 기기 관리
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              회원별 강의 수강 권한과 등록 기기를 관리합니다.
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>관리자: {currentUser?.mb_id}</div>
            <div>레벨: {currentUser?.mb_level}</div>
          </div>
        </header>

        {/* 메시지 영역 */}
        {msg && (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* 검색 영역 */}
        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            회원 조회 (mb_no 기준)
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="회원번호(mb_no)를 입력하세요"
              className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSearchUser}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? '조회 중…' : '조회'}
            </button>
            {targetUser && (
              <div className="text-xs text-slate-600">
                현재 대상 회원번호: <b>{targetUser.mb_no}</b>
              </div>
            )}
          </div>
        </section>

        {/* 권한 편집 */}
        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              수강 권한 설정
            </h2>
            <button
              type="button"
              onClick={handleSaveAuthorities}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              disabled={loading || !targetUser}
            >
              권한 저장
            </button>
          </div>

          {!targetUser ? (
            <p className="text-xs text-slate-500">
              먼저 회원을 조회해 주세요.
            </p>
          ) : (
            <>
              <div className="mb-4">
                <p className="mb-1 text-xs font-medium text-slate-700">
                  클래스 그룹 (A / B / S)
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                  {['A', 'B', 'S'].map((g) => (
                    <label key={g} className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={classGroups.includes(g)}
                        onChange={() =>
                          setClassGroups((prev) => toggleInArray(prev, g))
                        }
                      />
                      <span>{g}반</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-slate-700">
                  패키지 권한
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-700">
                  {['packageC', 'packageD', 'packageE'].map((t) => (
                    <label key={t} className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={videoTypes.includes(t)}
                        onChange={() =>
                          setVideoTypes((prev) => toggleInArray(prev, t))
                        }
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 기존 저장된 권한 리스트 간단히 보여주기 */}
              <div className="mt-4">
                <p className="mb-1 text-xs font-semibold text-slate-700">
                  현재 저장된 권한 목록
                </p>
                {authorities.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    저장된 권한이 없습니다.
                  </p>
                ) : (
                  <ul className="text-xs text-slate-700 list-disc pl-4 space-y-0.5">
                    {authorities.map((a) => (
                      <li key={a.id}>
                        #{a.id} / userId: {a.userId} / classGroup:{' '}
                        {a.classGroup ?? '-'} / type: {a.type}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        {/* 기기 관리 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              등록 기기 관리 (최대 2대)
            </h2>
            <button
              type="button"
              onClick={handleResetDevices}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
              disabled={loading || !targetUser}
            >
              기기 전체 초기화
            </button>
          </div>

          {!targetUser ? (
            <p className="text-xs text-slate-500">
              먼저 회원을 조회해 주세요.
            </p>
          ) : devices.length === 0 ? (
            <p className="text-xs text-slate-400">
              등록된 기기가 없습니다. (첫 재생 시 자동 등록)
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Device ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Device Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      등록일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">{d.id}</td>
                      <td className="px-3 py-2">{d.deviceId}</td>
                      <td className="px-3 py-2">
                        {d.deviceName || '(이름 없음)'}
                      </td>
                      <td className="px-3 py-2">
                        {d.registeredAt
                          ? new Date(d.registeredAt).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
