'use client';
import React, { useState, useEffect } from 'react';
import VideoPlayer from '@/app/components/VideoPlayer';

interface Course {
    id: number;
    title: string;
    description: string;
    s3Url: string;
}

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">로딩 중...</div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">등록된 강의가 없습니다.</div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8 text-center">MPS 강의 목록</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg transition"
                            onClick={() => setSelectedCourse(course)}
                        >
                            <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
                            <p className="text-gray-600 mb-2">{course.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Video Player Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
                            <button
                                className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors z-10"
                                onClick={() => {
                                    setSelectedCourse(null);
                                    setVideoUrl('');
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="aspect-video mb-4">
                                {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
                            </div>
                            <h2 className="text-xl font-bold mb-2">{selectedCourse.title}</h2>
                            <p className="text-gray-700">{selectedCourse.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MpsLecture;