'use client';

import { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL is not defined");

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

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL is not defined");

      // 1️⃣ VdoCipher 업로드 권한 및 videoId 요청
      const uploadRes = await fetch(`${apiUrl}/api/vdocipher/upload-url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const { videoId, uploadLink } = await uploadRes.json();

      // 2️⃣ VdoCipher에 직접 영상 업로드
      await fetch(uploadLink, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/octet-stream" }
      });

      // 3️⃣ 백엔드에 강의 등록 (videoId 전달)
      const lectureData = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "Uploaded via VdoCipher",
        video_url: `https://player.vdocipher.com/v2/?video=${videoId}`,
        thumbnail_url: "/default-thumbnail.jpg",
        price: 0,
        type: "PAID",
        categoryId: 1
      };

      const lectureRes = await axios.post(`${apiUrl}/api/lectures`, lectureData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (lectureRes.data) await fetchLectures();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">강의 관리</h1>
          <div className="flex items-center space-x-4">
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <span>{isUploading ? "업로드 중..." : "강의 업로드"}</span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

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
                        onClick={() => router.push(`/mpslecture/testroom?lectureId=${lecture.id}`)}
                        className="bg-green-100 text-green-600 hover:text-green-900 px-3 py-1 rounded-md text-sm font-medium"
                      >
                        보기
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
