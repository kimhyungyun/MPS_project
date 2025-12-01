// app/services/fileUpload.ts

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://api.mps-admin.com') + '/api';

export interface UploadedFileInfo {
  key: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

// ✅ 항상 Record<string, string> 리턴하도록 타입 고정
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * S3 업로드 (공지 첨부, 커버, 본문 이미지 공통)
 * 백엔드: POST /api/files/upload
 */
export async function uploadFileToServer(file: File): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include', // 쿠키 포함
    headers: {
      ...getAuthHeader(), // ✅ 이제 타입 에러 안 남
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('upload error:', text);
    throw new Error('파일 업로드 실패');
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error('파일 업로드 응답이 올바르지 않습니다.');
  }

  return json.data as UploadedFileInfo;
}

/**
 * 다운로드용 presigned URL 요청
 * 백엔드: GET /api/files/presigned?key=...
 */
export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const res = await fetch(
    `${API_BASE_URL}/files/presigned?key=${encodeURIComponent(key)}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...getAuthHeader(), // ✅ 여기도 동일
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('presigned error:', text);
    throw new Error('다운로드 URL 생성 실패');
  }

  const json = await res.json();
  if (!json.success || !json.data || !json.data.url) {
    throw new Error('다운로드 URL 응답이 올바르지 않습니다.');
  }

  return json.data.url as string;
}
