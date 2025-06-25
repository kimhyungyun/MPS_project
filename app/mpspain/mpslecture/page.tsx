// src/app/components/MpsLecture.tsx
'use client';

import VideoPlayer from '@/app/components/VideoPlayer';
import { useState, useEffect } from 'react';


interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string;
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

const MpsLecture = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`강의 목록 로드 실패: ${res.status}`);
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        console.error(err);
        setError('강의 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseSelect = async (course: Course) => {
    setError(null);
    try {
      // 1) 쿠키 발급
      const cookieRes = await fetch(
        `${API_BASE_URL}/api/lectures/${course.id}/signed-cookie`,
        { method: 'GET', credentials: 'include' }
      );
      if (!cookieRes.ok) {
        throw new Error(`쿠키 발급 실패 (${cookieRes.status})`);
      }

      // 2) 서명 URL 요청
      const urlRes = await fetch(
        `${API_BASE_URL}/api/lectures/${course.id}/signed-url`,
        { credentials: 'include' }
      );
      if (!urlRes.ok) {
        throw new Error(`URL 요청 실패 (${urlRes.status})`);
      }
      const { signedUrl } = await urlRes.json();

      // 3) 상태 업데이트
      setSelectedCourse(course);
      setVideoUrl(signedUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '강의 선택 중 오류가 발생했습니다.');
      // 선택 초기화
      setSelectedCourse(null);
      setVideoUrl('');
    }
  };

  if (isLoading) {
    return <p>강의 목록을 불러오는 중...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  if (courses.length === 0) {
    return <p>등록된 강의가 없습니다.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-4 border rounded cursor-pointer"
            onClick={() => handleCourseSelect(course)}
          >
            <h3>{course.title}</h3>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="mt-6">
          <h2>{selectedCourse.title}</h2>
          <VideoPlayer videoUrl={videoUrl} />
          <button onClick={() => setSelectedCourse(null)}>닫기</button>
        </div>
      )}
    </div>
  );
};

export default MpsLecture;
