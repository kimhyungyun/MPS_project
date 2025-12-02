// app/services/fileUpload.ts

// .env 에서 NEXT_PUBLIC_API_URL = https://api.mpspain.co.kr 로 설정
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr';

export interface UploadedFileInfo {
  id?: number;
  key: string;        // S3 object key
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

/** 공통 인증 헤더 */
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token'); // 🔥 기존과 동일하게 'token' 사용
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** 업로드 응답(normalize) */
function normalizeUploadData(data: any, file: File): UploadedFileInfo {
  const key: string =
    data.key ||
    data.s3_key ||
    data.fileUrl ||
    data.file_url ||
    data.file_key ||
    data.path ||
    '';

  if (!key) {
    console.error('No S3 object key found in upload result:', data);
    throw new Error('업로드 결과에 S3 key가 없습니다.');
  }

  let size: number | undefined;
  if (typeof data.size === 'number') {
    size = data.size;
  } else if (typeof data.size === 'string') {
    const parsed = parseInt(data.size, 10);
    if (!Number.isNaN(parsed)) size = parsed;
  }

  return {
    id: data.id,
    key,
    fileName:
      data.name ||
      data.fileName ||
      data.originalName ||
      file.name,
    fileSize: size ?? file.size,
    mimeType: data.mimeType || data.type || file.type,
  };
}

/**
 * 📁 자료실 / 일반 첨부파일 업로드
 *   POST /api/files/upload
 */
export async function uploadFileToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  const encodedName = encodeURIComponent(file.name);
  formData.append('file', file, encodedName);

  const res = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    console.error('uploadFileToServer error:', await res.text());
    throw new Error('파일 업로드에 실패했습니다.');
  }

  const json = await res.json();
  const data = json.data ?? json;

  return normalizeUploadData(data, file);
}

/**
 * 🖼 공지 에디터 본문 이미지 업로드
 *   POST /api/files/notice-image
 *   (mpsnotices 버킷 사용)
 */
export async function uploadNoticeImageToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  const encodedName = encodeURIComponent(file.name);
  formData.append('file', file, encodedName);

  const res = await fetch(`${API_BASE_URL}/api/files/notice-image`, {
    method: 'POST',
    body: formData,
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    console.error('uploadNoticeImageToServer error:', await res.text());
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  const json = await res.json();
  const data = json.data ?? json;

  return normalizeUploadData(data, file);
}

/**
 * 🔗 프리사인드 다운로드 URL
 *   GET /api/files/presigned?key=...
 */
export async function getPresignedDownloadUrl(
  key: string,
): Promise<string> {
  const url = new URL(`${API_BASE_URL}/api/files/presigned`);
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
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
