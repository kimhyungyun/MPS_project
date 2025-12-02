// app/services/fileUpload.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr';

export interface UploadedFileInfo {
  id?: number;
  key: string; // S3 object key
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * 공지 첨부파일 / 자료실 파일 업로드
 * → 백엔드: POST /api/files/upload
 */
export async function uploadFileToServer(
  file: File,
): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

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
 * 공지 에디터 본문 이미지 업로드
 * - 일단 동일한 /files/upload 엔드포인트를 쓰되,
 *   프론트에서 CloudFront / 버킷 도메인으로 src 구성
 */
export async function uploadNoticeImageToServer(
  file: File,
): Promise<UploadedFileInfo> {
  // 지금은 로직 동일하게 사용
  return uploadFileToServer(file);
}

/**
 * 프리사인드 다운로드 URL 가져오기
 * → 백엔드: GET /api/files/presigned?key=...
 */
export async function getPresignedDownloadUrl(
  key: string,
): Promise<string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

  const url = new URL(`${API_BASE_URL}/files/presigned`);
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
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
