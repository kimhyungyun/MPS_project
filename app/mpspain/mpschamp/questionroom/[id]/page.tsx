'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface InquiryDetail {
    id: number;
    name: string;
    subject: string;
    message: string;
    date: string;
    phone: string;
    response?: string;
    responseDate?: string;
}

const InquiryDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id?.toString();

    const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState('');
    const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인 (실제로는 로그인 상태나 권한 체크 필요)

    const getSubjectLabel = (subject: string) => {
        const subjectLabels: { [key: string]: string } = {
            'course': '강의 관련',
            'payment': '결제 관련',
            'technical': '기술적 문의',
            'other': '기타'
        };
        return subjectLabels[subject] || subject;
    };

    const formatPhoneNumber = (phone: string) => {
        // 숫자만 추출
        const numbers = phone.replace(/[^0-9]/g, '');
        
        // 11자리 숫자인 경우에만 포맷팅
        if (numbers.length === 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
        
        // 10자리 숫자인 경우 (010으로 시작하는 경우)
        if (numbers.length === 10 && numbers.startsWith('010')) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
        }
        
        // 그 외의 경우 원본 반환
        return phone;
    };

    useEffect(() => {
        if (!id) return;

        const storedInquiries = localStorage.getItem('inquiries');
        if (storedInquiries) {
            const inquiries = JSON.parse(storedInquiries);
            const foundInquiry = inquiries.find((inq: InquiryDetail) => inq.id.toString() === id);
            if (foundInquiry) {
                setInquiry(foundInquiry);
                setResponse(foundInquiry.response || '');
            }
        }
        setLoading(false);
    }, [id]);

    const handleSubmitResponse = () => {
        if (!response.trim()) return;

        const storedInquiries = localStorage.getItem('inquiries');
        if (storedInquiries) {
            const inquiries = JSON.parse(storedInquiries);
            const updatedInquiries = inquiries.map((inq: InquiryDetail) => {
                if (inq.id.toString() === id) {
                    return {
                        ...inq,
                        response: response,
                        responseDate: new Date().toLocaleDateString()
                    };
                }
                return inq;
            });

            localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
            setInquiry(prev => prev ? {
                ...prev,
                response: response,
                responseDate: new Date().toLocaleDateString()
            } : null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-10"></div>
                        <div className="space-y-6">
                            <div className="h-5 bg-gray-200 rounded-lg w-4/5"></div>
                            <div className="h-5 bg-gray-200 rounded-lg w-2/3"></div>
                            <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!inquiry) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="bg-white rounded-xl shadow-sm p-10">
                        <h1 className="text-3xl font-semibold text-gray-900 mb-6">문의를 찾을 수 없습니다</h1>
                        <p className="text-gray-600 text-lg mb-8">요청하신 문의가 존재하지 않거나 삭제되었습니다.</p>
                        <button
                            onClick={() => router.push('/mpspain/mpschamp/questionroom')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                        >
                            문의 목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-24 mt-20 mb-20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-xl shadow-sm p-10">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-semibold text-gray-900">문의 상세</h1>
                        <button
                            onClick={() => router.push('/mpspain/mpschamp/questionroom')}
                            className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                        >
                            ← 목록으로
                        </button>
                    </div>

                    <div className="space-y-8">
                        <div className="border-b border-gray-200 pb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">문의 정보</h2>
                            <div className="grid grid-cols-3 gap-8">
                                <div className="bg-gray-100 p-6 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-2">작성자</p>
                                    <p className="text-lg text-gray-900">{inquiry.name}</p>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-2">작성일</p>
                                    <p className="text-lg text-gray-900">{inquiry.date}</p>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 mb-2">연락처</p>
                                    <p className="text-lg text-gray-900">{formatPhoneNumber(inquiry.phone)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">문의 내용</h2>
                                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-medium">
                                    {getSubjectLabel(inquiry.subject)}
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-8">
                                <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                            </div>
                        </div>

                        {/* 답변 섹션 */}
                        <div className="border-t border-gray-200 pt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">답변</h2>
                            
                            {inquiry.response ? (
                                <div className="bg-blue-100 rounded-lg p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-sm font-medium text-blue-600">관리자 답변</p>
                                        <p className="text-sm text-gray-500">{inquiry.responseDate}</p>
                                    </div>
                                    <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">{inquiry.response}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-8">
                                    <p className="text-gray-500 text-center">아직 답변이 등록되지 않았습니다.</p>
                                </div>
                            )}

                            {/* 관리자 답변 입력 폼 */}
                            {isAdmin && (
                                <div className="mt-6">
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="답변을 입력하세요"
                                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleSubmitResponse}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        >
                                            답변 등록
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InquiryDetailPage;
