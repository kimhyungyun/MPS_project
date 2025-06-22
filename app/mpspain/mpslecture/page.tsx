'use client';
import React, { useState, useEffect } from 'react';
import VideoPlayer from '@/app/components/VideoPlayer';

interface Course {
    id: number;
    title: string;
    description: string;
    s3Url: string;
}

// ✅ 환경변수에서 API 주소를 불러옴
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
                        id: lecture.id,
                        title: lecture.title,
                        description: lecture.description,
                        s3Url: lecture.s3Url,
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

    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (!selectedCourse) return;
            
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/videos/signed-url?filename=${selectedCourse.id}.m3u8`
                );
                if (!response.ok) throw new Error('Failed to get signed URL');
                const { url } = await response.json();
                setVideoUrl(url);
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
                            key={course.id}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 overflow-hidden"
                            onClick={() => setSelectedCourse(course)}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white font-medium">
                                    강의 {course.id}
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
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
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
