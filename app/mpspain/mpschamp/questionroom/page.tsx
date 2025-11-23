'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 👤 사용자 타입
interface User {
  mb_id: string;
  mb_name: string;
  mb_nick: string;
  mb_level: number;
}

const QuestionRoom = () => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [selectedInquiry, setSelectedInquiry] = useState<{
    id: number;
    name: string;
    subject: string;
    message: string;
    date: string;
    password: string;
  } | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const getSubjectLabel = (subject: string) => {
    const subjectLabels: { [key: string]: string } = {
      course: '강의 관련',
      payment: '결제 관련',
      champ: '캠프 관련',
      other: '기타',
    };
    return subjectLabels[subject] || subject;
  };

  const [inquiries, setInquiries] = useState<
    Array<{
      id: number;
      name: string;
      subject: string;
      message: string;
      date: string;
      password: string;
    }>
  >([]);

  // ✅ 로그인 체크 + 문의 리스트 로드
  useEffect(() => {
    const init = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          alert('로그인이 필요합니다.');
          router.push('/form/login');
          return;
        }

        let parsedUser: User;
        try {
          parsedUser = JSON.parse(raw) as User;
        } catch (e) {
          console.error('user parse error:', e);
          alert('로그인 정보가 올바르지 않습니다. 다시 로그인 해주세요.');
          router.push('/form/login');
          return;
        }

        setUser(parsedUser);

        // 문의 내역 로드
        const storedInquiries = localStorage.getItem('inquiries');
        if (storedInquiries) {
          setInquiries(JSON.parse(storedInquiries));
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry = {
      id: Date.now(),
      name: formData.name,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleDateString('ko-KR'),
      password: formData.password,
      phone: formData.phone,
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    // Store in localStorage
    const updatedInquiries = [newInquiry, ...inquiries];
    localStorage.setItem('inquiries', JSON.stringify(updatedInquiries));
    setFormData({
      name: '',
      password: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleInquiryClick = (inquiry: (typeof inquiries)[0]) => {
    setSelectedInquiry(inquiry);
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInquiry && passwordInput === selectedInquiry.password) {
      setShowPasswordModal(false);
      router.push(`/mpspain/mpschamp/questionroom/${selectedInquiry.id}`);
    } else {
      setPasswordError(true);
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // 숫자만 남기기
      const numbers = value.replace(/[^\d]/g, '');

      // 전화번호 포맷팅
      let formattedNumber = '';
      if (numbers.length > 0) {
        formattedNumber = numbers.substring(0, 3);
        if (numbers.length > 3) {
          formattedNumber += '-' + numbers.substring(3, 7);
        }
        if (numbers.length > 7) {
          formattedNumber += '-' + numbers.substring(7, 11);
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: formattedNumber,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </section>
    );
  }

  // 로그인 체크 후 리다이렉트 중이면 렌더 안 함
  if (!user) {
    return null;
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 mt-40">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-medium text-gray-900 ">문의하기</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Inquiry Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              문의 양식
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이름
                </label>
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="문의 확인시 사용할 비밀번호"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  연락처
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="010-0000-0000"
                  maxLength={13}
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  문의 유형
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">선택해 주세요</option>
                  <option value="course">강의 관련</option>
                  <option value="payment">결제 관련</option>
                  <option value="champ">캠프 문의</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  문의 내용
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                문의하기
              </button>
            </form>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-8">
            {/* Phone Contact Box */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">연락처 안내</h2>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">대표원장</span>
                      <span className="text-lg font-semibold text-gray-900">
                        010-3651-3280
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">수습원장</span>
                      <span className="text-lg font-semibold text-gray-900">
                        010-7942-5854
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
                  </p>
                </div>
              </div>
            </div>

            {/* SNS Contact Box */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">SNS 문의</h2>
              </div>
              <div className="space-y-6">
                <a
                  href="https://www.instagram.com/mpspain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 text-gray-700 hover:text-pink-600 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-3 rounded-lg">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">Instagram</span>
                </a>
                <a
                  href="https://open.kakao.com/mpspain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 text-gray-700 hover:text-yellow-600 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-lg">
                    <img src="/kakao.png" alt="KakaoTalk" className="w-12 h-12" />
                  </div>
                  <span className="text-lg font-semibold">오픈 카카오톡</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulletin Board Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">
            문의 게시판
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    제목
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작성자
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleInquiryClick(inquiry)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiries.length - index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {getSubjectLabel(inquiry.subject)}
                        </span>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          비공개
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.date}
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      등록된 문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              비밀번호 확인
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="modal-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  임시 비밀번호를 입력하세요
                </label>
                <input
                  type="password"
                  id="modal-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default QuestionRoom;
