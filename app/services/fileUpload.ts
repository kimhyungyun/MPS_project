// app/services/fileUpload.ts

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr') + '/api';

export interface UploadedFileInfo {
  key: string;        // S3 object key (예: "dataroom/....png")
  fileName: string;   // 원본 파일명
  fileSize?: number;
  mimeType?: string;
}

// ✅ 항상 Record<string, string> 리턴
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
  // 파일명 인코딩해서 보내기 (한글 깨짐 방지)
  const encodedName = encodeURIComponent(file.name);
  formData.append('file', file, encodedName);

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('upload error:', text);
    throw new Error('파일 업로드 실패');
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    console.error('upload invalid response:', json);
    throw new Error('파일 업로드 응답이 올바르지 않습니다.');
  }

  const result = json.data as any;

  // 🔥 백엔드가 주는 여러 키 지원 (key / s3_key / fileUrl ...)
  const key: string =
    result.key ||
    result.s3_key ||
    result.fileUrl ||
    result.file_url ||
    '';

  if (!key) {
    console.error('No S3 object key found in upload result:', result);
    throw new Error('이미지 업로드 결과에 파일 경로가 없습니다.');
  }

  const fileName: string =
    result.fileName ||
    result.originalName ||
    result.name ||
    file.name;

  let fileSize: number | undefined;
  if (typeof result.size === 'number') {
    fileSize = result.size;
  } else if (typeof result.size === 'string') {
    const parsed = parseInt(result.size, 10);
    fileSize = isNaN(parsed) ? undefined : parsed;
  }

  const mimeType: string | undefined =
    result.mimeType ||
    result.type ||
    file.type;

  const normalized: UploadedFileInfo = {
    key,
    fileName,
    fileSize,
    mimeType,
  };

  return normalized;
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
        ...getAuthHeader(),
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
    console.error('presigned invalid response:', json);
    throw new Error('다운로드 URL 응답이 올바르지 않습니다.');
  }

  return json.data.url as string;
}
