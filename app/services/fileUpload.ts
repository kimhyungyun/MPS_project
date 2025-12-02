import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔥 자료실(Dataroom) 업로드용
export const uploadDataroomFileToServer = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(
    `${API_URL}/api/files/upload`,
    formData,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (!res.data?.success) {
    throw new Error(res.data?.message || '자료실 파일 업로드 실패');
  }

  return res.data.data as {
    id: number;
    name: string;
    type: string;
    size: string;
    upload_date: string;
    s3_key: string;
  };
};

// 🔥 공지사항 에디터 이미지 업로드용
export const uploadNoticeImageToServer = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(
    `${API_URL}/api/files/notice-image`,
    formData,
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (!res.data?.success) {
    throw new Error(res.data?.message || '공지 이미지 업로드 실패');
  }

  return res.data.data as {
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
};

// 🔥 (자료실/공지 첨부 다운로드용) 프리사인드 URL
export const getPresignedDownloadUrl = async (key: string) => {
  const res = await axios.get(`${API_URL}/api/files/presigned`, {
    params: { key },
    withCredentials: true,
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || '다운로드 URL 발급 실패');
  }

  return res.data.data.url as string;
};
