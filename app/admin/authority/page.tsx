import { useState } from 'react';

type UserDevice = {
  id: number;
  userId: number;
  deviceId: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export default function Authority() {
  const [userId, setUserId] = useState('');
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDevices = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch(`${API_BASE_URL}/api/admin/devices/${userId}`, {
        credentials: 'include', // 쿠키 기반 관리자 인증 쓴다면
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || '기기 목록 조회 실패');
      }
      const data = await res.json();
      setDevices(data);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDevices = async () => {
    if (!userId) return;
    if (!confirm('이 유저의 모든 기기를 초기화할까요?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/devices/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || '초기화 실패');
      }
      setMessage('모든 기기를 초기화했습니다.');
      setDevices([]);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!userId) return;
    if (!confirm(`이 기기를 삭제할까요? (${deviceId})`)) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/admin/devices/${userId}/${deviceId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || '기기 삭제 실패');
      }
      setMessage('기기를 삭제했습니다.');
      // 목록 갱신
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>유저 기기 관리</h1>

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <input
          type="number"
          placeholder="User ID 입력"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        <button onClick={fetchDevices} disabled={loading || !userId}>
          {loading ? '불러오는 중...' : '기기 조회'}
        </button>
        <button
          onClick={resetDevices}
          disabled={loading || !userId || devices.length === 0}
          style={{ marginLeft: 8 }}
        >
          전체 초기화
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: 16, color: 'red' }}>{message}</div>
      )}

      {devices.length === 0 ? (
        <p>등록된 기기가 없습니다.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 16,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                ID
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                Device ID
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                이름
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                등록일
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                마지막 사용
              </th>
              <th style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id}>
                <td
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: 8,
                    textAlign: 'center',
                  }}
                >
                  {d.id}
                </td>
                <td
                  style={{ borderBottom: '1px solid #eee', padding: 8 }}
                  title={d.deviceId}
                >
                  {d.deviceId}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {d.deviceName || '-'}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {new Date(d.createdAt).toLocaleString()}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {new Date(d.lastUsedAt).toLocaleString()}
                </td>
                <td
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: 8,
                    textAlign: 'center',
                  }}
                >
                  <button onClick={() => deleteDevice(d.deviceId)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
