'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface Course {
    id: number;
    title: string;
    description: string;
    price: string;
    duration: string;
    lectures: number;
    thumbnail: string;
    instructor: string;
    level: string;
    features: string[];
}

const MpsLecture = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const courses: Course[] = [
        {
            id: 1,
            title: "MPS A반반 강의",
            description: "근막통 증후군의 이해와 기본 치료법",
            price: "150,000",
            duration: "4시간",
            lectures: 12,
            thumbnail: "/lecture1.jpg",
            instructor: "김민수 교수",
            level: "입문",
            features: [
                "근막통 증후군의 기초 이해",
                "기본 진단법 학습",
                "초보자를 위한 치료 기법",
                "실습 동영상 제공"
            ]
        },
        {
            id: 2,
            title: "MPS B반 강의",
            description: "전문가를 위한 고급 치료 기법",
            price: "250,000",
            duration: "6시간",
            lectures: 15,
            thumbnail: "/lecture2.jpg",
            instructor: "이지원 교수",
            level: "고급",
            features: [
                "복잡한 증례 분석",
                "고급 치료 기법",
                "임상 사례 연구",
                "실시간 Q&A 세션"
            ]
        },
    ];

    return ( 
        <section className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 opacity-70"></div>
                <div className="relative max-w-6xl mx-auto px-4 py-24">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-medium text-gray-900 mb-6 leading-tight">
                            MPS 전문가 과정
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            체계적인 교육으로 MPS 전문가가 되세요.<br/>
                            실전 중심의 커리큘럼으로 전문성을 키워보세요.
                        </p>
                    </div>
                </div>
            </div>

            {/* Course List */}
            <div className="max-w-6xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {courses.map((course) => (
                        <div 
                            key={course.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative h-56">
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                    {course.level}
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-medium text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-gray-600 mb-6 line-clamp-2">
                                    {course.description}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {course.duration}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        {course.lectures}강
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                    <span className="text-2xl font-medium text-gray-900">
                                        ₩{course.price}
                                    </span>
                                    <button 
                                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                                        onClick={() => setSelectedCourse(course)}
                                    >
                                        상세보기
                                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Course Detail Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative h-80">
                                <Image
                                    src={selectedCourse.thumbnail}
                                    alt={selectedCourse.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <button 
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                                    onClick={() => setSelectedCourse(null)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-medium text-gray-900 mb-3">
                                            {selectedCourse.title}
                                        </h2>
                                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {selectedCourse.instructor}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {selectedCourse.level}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-3xl font-medium text-blue-600">
                                        ₩{selectedCourse.price}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                    {selectedCourse.description}
                                </p>

                                <div className="mb-10">
                                    <h3 className="text-xl font-medium text-gray-900 mb-6">강의 특징</h3>
                                    <ul className="space-y-4">
                                        {selectedCourse.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-gray-600 text-lg">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl">
                                    구매하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
     );
};
 
export default MpsLecture;