// app/services/noticeService.ts

import axios from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.mpspain.co.kr';
const BASE_URL = `${API_URL}/api`;

// ✅ 백엔드에서 내려주는 첨부파일(조회용) 타입
export interface NoticeAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
}

// ✅ 백엔드에서 내려주는 Notice(post) 타입
export interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
  coverImageUrl?: string | null;
  userId: number | null;

  // 🔥 둘 다 optional 로 둔다 (어디서는 user, 어디서는 g5_member 사용)
  user?: {
    mb_name: string;
  };

  g5_member?: {
    mb_name: string;
  };

  attachments?: NoticeAttachment[];
}

// ✅ 생성/수정 요청에 실어 보낼 첨부파일 타입 (백엔드 DTO랑 맞춤)
export interface NoticeAttachmentRequest {
  id?: number;               // 기존 첨부파일이면 id 존재 (지금은 안 써도 됨)
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}

// ✅ 백엔드 CreateNoticeDto랑 맞춘 요청 DTO
export interface CreateNoticeDto {
  title: string;
  content: string;
  is_important?: boolean;
  coverImageUrl?: string;
  attachments?: NoticeAttachmentRequest[];
}

class NoticeService {
  private getAuthHeader() {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createNotice(data: CreateNoticeDto) {
    try {
      const response = await axios.post(`${BASE_URL}/notices`, data, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data as Notice;
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async getNotices() {
    try {
      const response = await axios.get(`${BASE_URL}/notices`, {
        headers: {
          ...this.getAuthHeader(),
        },
        withCredentials: true,
      });
      return response.data as Notice[];
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  async getNotice(id: number) {
    try {
      const response = await axios.get(`${BASE_URL}/notices/${id}`, {
        headers: {
          ...this.getAuthHeader(),
        },
        withCredentials: true,
      });
      return response.data as Notice;
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  async updateNotice(
    id: number,
    data: {
      title?: string;
      content?: string;
      is_important?: boolean;           // 🔥 snake_case 로 통일
      coverImageUrl?: string;
      attachments?: NoticeAttachmentRequest[];
      deleteAttachmentIds?: number[];
      removeCoverImage?: boolean;
    },
  ) {
    const requestData: CreateNoticeDto = {
      title: data.title ?? '',
      content: data.content ?? '',
      is_important: data.is_important,
      coverImageUrl: data.coverImageUrl,
      attachments: data.attachments,
    };

    console.log('Updating notice with data:', requestData);

    try {
      const response = await axios.patch(
        `${BASE_URL}/notices/${id}`,
        requestData,
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      );
      return response.data as Notice;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
      }
      throw error;
    }
  }

  async deleteNotice(id: number) {
    try {
      const response = await axios.delete(`${BASE_URL}/notices/${id}`, {
        headers: this.getAuthHeader(),
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }
}

export const noticeService = new NoticeService();
