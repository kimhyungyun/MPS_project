import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  attachments?: {
    id: number;
    name: string;
    url: string;
  }[];
}

export interface CreateNoticeDto {
  title: string;
  content: string;
  is_important?: boolean;
}

class NoticeService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async createNotice(data: CreateNoticeDto) {
    try {
      const response = await axios.post(`${API_URL}/api/notices`, data, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async getNotices() {
    try {
      const response = await axios.get(`${API_URL}/api/notices`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notices:', error);
      throw error;
    }
  }

  async getNotice(id: number) {
    try {
      const response = await axios.get(`${API_URL}/api/notices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw error;
    }
  }

  async updateNotice(id: number, data: {
    title?: string;
    content?: string;
    isImportant?: boolean;
  }) {
    const token = localStorage.getItem('token');
    const requestData = {
      title: data.title,
      content: data.content,
      isImportant: data.isImportant
    };
    console.log('Updating notice with data:', requestData);
    
    try {
      const response = await axios.put(`${API_URL}/api/notices/${id}`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
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
      const response = await axios.delete(`${API_URL}/api/notices/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }
}

export const noticeService = new NoticeService(); 