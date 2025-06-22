// MpsLecture 컴포넌트
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MpsLecture = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

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
            thumbnail_url: lecture.thumbnail_url, // 썸네일 URL
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

   const handleCourseSelect = async(course: Course) => {
    setSelectedCourse(course);
    const response = await fetch(`${API_BASE_URL}/api/lectures/${course.title}/signed-url`);
    const data = await response.json();
    setVideoUrl(data.signedUrl);  //
    };

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
            <img src="/path/to/default-thumbnail.png" alt="썸네일" className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">등록된 강의가 없습니다</h3>
          <p className="text-gray-600">새로운 강의가 업로드될 때까지 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              MPS 강의실
            </h1>
            <p className="text-gray-600 text-lg">전문적인 강의를 통해 지식을 습득하세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div
              key={index} // key를 index로 설정
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden"
              onClick={() => handleCourseSelect(course)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white font-medium">
                  강의 {index + 1}
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105">
                    강의 보기
                  </button>
                  <div className="text-xs text-gray-400">클릭하여 시청</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCourse && (
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
                  {videoUrl ? (
                    <VideoPlayer videoUrl={videoUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <div className="text-gray-600">비디오를 로딩하는 중...</div>
                      </div>
                    </div>
                  )}
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
