'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type ClassGroup = 'A' | 'B' | 'S';

type LectureType =
  | 'single'
  | 'packageA'
  | 'packageB'
  | 'packageC'
  | 'packageD'
  | 'packageE';

interface Lecture {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  type: LectureType;
  classGroup: ClassGroup;
  categoryId: number | null;
  instructorId: number | null;
  video_folder?: string | null;
  video_name?: string | null;
}

export default function LectureManagementPage() {
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLectures();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchLectures = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      const response = await fetch(`${apiUrl}/api/lectures`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lectures');
      }

      const data = await response.json();
      setLectures(data);
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error('API URL is not defined');

      await axios.delete(`${apiUrl}/api/lectures/${id}`, {
        headers: getAuthHeaders(),
      });

      await fetchLectures();
    } catch (error) {
      console.error('Failed to delete lecture:', error);
      alert('삭제 실패');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 mt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            강의 관리
          </h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {lectures.map((lecture) => (
              <li key={lecture.id}>
                <div className="px-3 sm:px-4 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">ID: {lecture.id}</p>

                      <p className="text-sm sm:text-base font-medium text-blue-600 truncate">
                        {lecture.title}
                      </p>

                      <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                        {lecture.description}
                      </p>

                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>
                          categoryId: {lecture.categoryId ?? '-'} / instructorId:{' '}
                          {lecture.instructorId ?? '-'} / classGroup:{' '}
                          {lecture.classGroup}
                        </p>
                        <p>
                          video_folder: {lecture.video_folder ?? '-'} /
                          video_name: {lecture.video_name ?? '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/lectures/${lecture.id}`)
                        }
                        className="bg-white text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md text-xs sm:text-sm font-medium border border-gray-200"
                      >
                        수정
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/mpslecture/testroom?lectureId=${lecture.id}`,
                          )
                        }
                        className="bg-green-100 text-green-600 hover:text-green-900 px-3 py-1 rounded-md text-xs sm:text-sm font-medium"
                      >
                        보기
                      </button>

                      <button
                        onClick={() => handleDelete(lecture.id)}
                        className="bg-red-100 text-red-600 hover:text-red-900 px-3 py-1 rounded-md text-xs sm:text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}

            {lectures.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">
                등록된 강의가 없습니다.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}