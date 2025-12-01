// app/services/noticeService.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BASE_URL = `${API_URL}/api`;

// ✅ 백엔드에서 내려주는 첨부파일(조회용) 타입
export interface NoticeAttachment {
  id: number;
  name: string;
  url: string;
}

// ✅ 프론트에서 사용하는 Notice 타입
export interface Notice {
  id: number;
  title: string;
  content: string;
  isImportant: boolean;
  date: string;
  writer_id: number;
  user?: {
    mb_name: string;
  };
  attachments?: NoticeAttachment[];
}

// ✅ 생성/수정 요청에 실어 보낼 첨부파일 타입 (백엔드 DTO랑 맞춤)
export interface NoticeAttachmentRequest {
  id?: number;               // 기존 첨부파일이면 id 존재
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

  // 대표 이미지 URL
  coverImageUrl?: string;

  // 첨부파일 목록
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
        // 필요하면 쿠키도 같이
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
        withCredentials: true,
      });
      return response.data as Notice;
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  async updateNotice(id: number, data: {
    title?: string;
    content?: string;
    isImportant?: boolean;
    coverImageUrl?: string;
    attachments?: NoticeAttachmentRequest[];
    deleteAttachmentIds?: number[];   // 🔥 새로 추가
    removeCoverImage?: boolean;       // 🔥 새로 추가
  }) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 백엔드 UpdateNoticeDto는 is_important / coverImageUrl / attachments 구조이므로 거기에 맞게 변환
    const requestData: CreateNoticeDto = {
      title: data.title ?? '',
      content: data.content ?? '',
      is_important: data.isImportant,
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
            Authorization: token ? `Bearer ${token}` : '',
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
