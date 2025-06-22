'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Lecture {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  price: number;
  type: string;
  categoryId: number;
}

export default function LectureManagementPage() {
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
      if (!apiUrl) {
        throw new Error("API URL is not defined");
      }

      const response = await fetch(`${apiUrl}/api/lectures`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLectures(data);
      }
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; // API URL을 환경변수에서 가져오기
      if (!apiUrl) {
        throw new Error("API URL is not defined");
      }

      // First upload the file
      const uploadResponse = await axios.post(`${apiUrl}/api/files/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        }
      });

      if (uploadResponse.data.success) {
        // After successful upload, create the lecture
        const lectureData = {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          description: "Uploaded lecture",
          video_url: uploadResponse.data.data.download_url,
          thumbnail_url: "/default-thumbnail.jpg", // You might want to handle thumbnail separately
          price: 0,
          type: "VIDEO",
          categoryId: 1 // Default category
        };

        const lectureResponse = await axios.post(`${apiUrl}/api/lectures`, lectureData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (lectureResponse.data) {
          await fetchLectures(); // Refresh the lecture list
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">강의 관리</h1>
          <div className="flex items-center space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <span>강의 업로드</span>
              <input
                type="file"
                className="hidden"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {isUploading && (
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">업로드 중... {uploadProgress}%</p>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {lectures.map((lecture) => (
              <li key={lecture.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {lecture.title}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="truncate">{lecture.description}</span>
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-4">
                      <button
                        onClick={() => router.push(`/admin/lectures/${lecture.id}`)}
                        className="bg-white text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => {/* Handle delete */}}
                        className="bg-red-100 text-red-600 hover:text-red-900 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
