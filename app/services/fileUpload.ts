// app/services/fileUpload.ts

// .env 에는 이렇게 들어있다고 가정
// NEXT_PUBLIC_API_URL=https://api.mpspain.co.kr
// NEXT_PUBLIC_CLOUDFRONT_DOMAIN=media.mpspain.co.kr
// NEXT_PUBLIC_S3_BUCKET_NAME=mpsnotices
// NEXT_PUBLIC_S3_REGION=ap-northeast-2

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr';

// 🔥 Nest globalPrefix("api") 때문에 여기까지 포함
const API_PREFIX = `${API_BASE_URL}/api`;

export interface UploadedFileInfo {
  id?: number;
  key: string;       // S3 object key
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

// 공통 토큰 헬퍼 (로그인 시 localStorage.setItem('token', ...) 기준)
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * 📌 공지 첨부파일 / 자료실 파일 업로드
 * → 백엔드: POST /api/files/upload  (dataroom 버킷 / File 테이블 기록)
 */
export async function uploadFileToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();

  const res = await fetch(`${API_PREFIX}/files/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    console.error('uploadFileToServer error:', await res.text());
    throw new Error('파일 업로드에 실패했습니다.');
  }

  const json = await res.json();
  const data = json.data ?? json;

  const key =
    data.s3_key ||
    data.key ||
    data.fileUrl ||
    data.file_key ||
    data.path;

  if (!key) {
    console.error('No S3 object key found in upload result:', data);
    throw new Error('업로드 결과에 S3 key가 없습니다.');
  }

  return {
    id: data.id,
    key,
    fileName: data.name || data.fileName || file.name,
    fileSize:
      typeof data.size === 'string'
        ? Number(data.size)
        : data.size ?? file.size,
    mimeType: data.type || data.mimeType || file.type,
  };
}

/**
 * 📌 공지 에디터 "본문 이미지" 업로드
 * → 백엔드: POST /api/files/notice-image  (mpsnotices 버킷, DB 기록 X)
 *    반환: { success: true, data: { key, fileName, fileSize, mimeType } }
 */
export async function uploadNoticeImageToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();

  const res = await fetch(`${API_PREFIX}/files/notice-image`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    console.error('uploadNoticeImageToServer error:', await res.text());
    throw new Error('공지 이미지 업로드에 실패했습니다.');
  }

  const json = await res.json();
  const data = json.data ?? json;

  if (!data.key) {
    console.error('No S3 object key found in notice-image result:', data);
    throw new Error('공지 이미지 업로드 결과에 key가 없습니다.');
  }

  return {
    key: data.key,
    fileName: data.fileName || file.name,
    fileSize: data.fileSize ?? file.size,
    mimeType: data.mimeType || file.type,
  };
}

/**
 * 📌 프리사인드 다운로드 URL (자료실/첨부 다운로드용)
 * → 백엔드: GET /api/files/presigned?key=...
 */
export async function getPresignedDownloadUrl(
  key: string,
): Promise<string> {
  const token = getToken();

  const url = new URL(`${API_PREFIX}/files/presigned`);
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    console.error('getPresignedDownloadUrl error:', await res.text());
    throw new Error('다운로드 URL 생성에 실패했습니다.');
  }

  const json = await res.json();
  const presigned = json.data?.url ?? json.url;

  if (!presigned) {
    throw new Error('프리사인드 URL이 응답에 없습니다.');
  }

  return presigned;
}
