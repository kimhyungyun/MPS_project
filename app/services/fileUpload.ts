// app/services/fileUpload.ts

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr') + '/api';

export interface UploadedFileInfo {
  id?: number;
  key: string;       // S3 object key
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

function getToken() {
  if (typeof window === 'undefined') return null;
  // 백엔드에서 jwt 쓰는 키가 'token' 이라서 이걸 기준으로 맞춤
  return localStorage.getItem('token');
}

/**
 * 📌 공지 첨부파일 / 자료실 파일 공용 업로드
 * → POST /api/files/upload  (자료실용 버킷 / DB 저장)
 */
export async function uploadFileToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
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
 * 📌 공지 에디터 이미지 업로드 전용
 * → POST /api/files/notice-image  (mpsnotices 버킷)
 */
export async function uploadNoticeImageToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();

  const res = await fetch(`${API_BASE_URL}/files/notice-image`, {
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

  const key =
    data.key ||
    data.s3_key ||
    data.fileUrl ||
    data.file_key ||
    data.path;

  if (!key) {
    console.error('No S3 object key found in notice image upload result:', data);
    throw new Error('공지 이미지 업로드 결과에 S3 key가 없습니다.');
  }

  return {
    key,
    fileName: data.fileName || file.name,
    fileSize: data.fileSize ?? file.size,
    mimeType: data.mimeType || file.type,
  };
}

/**
 * 📌 프리사인드 다운로드 URL
 * → GET /api/files/presigned?key=...
 */
export async function getPresignedDownloadUrl(
  key: string,
): Promise<string> {
  const token = getToken();

  const url = new URL(`${API_BASE_URL}/files/presigned`);
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
