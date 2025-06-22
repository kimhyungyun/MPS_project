'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/app/components/VideoPlayer';

interface Course {
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_url: string;
  type: string;
}

// ✅ 환경변수에서 API 주소를 불러옴
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MpsLecture = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // 강의 목록을 가져오는 함수
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lectures`, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCourses(
          data.map((lecture: any) => ({
            title: lecture.title,
            description: lecture.description,
            price: lecture.price,
            thumbnail_url: lecture.thumbnail_url,
            video_url: lecture.video_url,
            type: lecture.type,
          }))
        );
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // 비디오 URL을 가져오는 함수
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!selectedCourse) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/videos/signed-url?filename=${selectedCourse.video_url}`
        );
        if (!response.ok) throw new Error('Failed to get signed URL');
        const { url } = await response.json();
        setVideoUrl(url); // 여기서 CloudFront URL을 setVideoUrl에 설정
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [selectedCourse]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">강의 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">등록된 강의가 없습니다</h3>
          <p className="text-gray-600">새로운 강의가 업로드될 때까지 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* UI 코드 생략 */}
      {selectedCourse && videoUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 animate-in fade-in duration-300">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                  <button
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors duration-200"
                    onClick={() => {
                      setSelectedCourse(null);
                      setVideoUrl('');
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="aspect-video mb-6 bg-gray-100 rounded-xl overflow-hidden">
                  <VideoPlayer videoUrl={videoUrl} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">강의 설명</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MpsLecture;
