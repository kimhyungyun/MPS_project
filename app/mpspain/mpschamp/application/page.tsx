'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const application = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        hospital: '',
        position: '',
        experience: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add form submission logic
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 ">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">MPS 캠프 신청</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        MPS 전문가가 되기 위한 첫 걸음을 시작하세요.<br/>
                        체계적인 교육과 실습을 통해 전문성을 키워보세요.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Camp Information */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">캠프 일정</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">1</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">1기 (정원) 4/30</h3>
                                        <p className="text-gray-600">2024년 3월 15일 - 3월 17일</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">2</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">심화 과정</h3>
                                        <p className="text-gray-600">2024년 4월 15일 - 4월 17일</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">교육 내용</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">근막통 증후군의 이해와 진단</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">MPS 치료 기법 실습</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">임상 사례 연구 및 토론</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">참가 혜택</h2>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">MPS 연구회 정회원 자격</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">수료증 발급</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">후속 교육 참가 우선권</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">신청하기</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">학교</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">소속 병원</label>
                                <input
                                    type="text"
                                    id="hospital"
                                    name="hospital"
                                    value={formData.hospital}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">직위</label>
                                <select
                                    id="position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">선택해주세요</option>
                                    <option value="의사">의사</option>
                                    <option value="한의사">한의사</option>
                                    <option value="물리치료사">물리치료사</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">경력</label>
                                <select
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">선택해주세요</option>
                                    <option value="1년 미만">1년 미만</option>
                                    <option value="1-3년">1-3년</option>
                                    <option value="3-5년">3-5년</option>
                                    <option value="5년 이상">5년 이상</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">추가 메시지</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                            >
                                신청하기
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default application;
