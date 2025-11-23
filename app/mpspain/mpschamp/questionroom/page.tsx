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

// ✅ 문의 타입 공통 정의
interface Inquiry {
  id: number;
  name: string;
  subject: string;
  message: string;
  date: string;
  password: string;
  phone: string;
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

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const getSubjectLabel = (subject: string) => {
    const subjectLabels: { [key: string]: string } = {
      course: '강의 관련',
      payment: '결제 관련',
      champ: '캠프 관련',
      other: '기타',
    };
    return subjectLabels[subject] || subject;
  };

  // ✅ 이름 마스킹: 김문의 -> 김O의, 홍길동 -> 홍O동
  const maskName = (name: string) => {
    if (!name) return '';
    const chars = Array.from(name); // 유니코드 안전
    if (chars.length === 1) return name;
    if (chars.length === 2) return `${chars[0]}O`;
    return `${chars[0]}O${chars.slice(2).join('')}`;
  };

  // ✅ 연락처 마스킹: 010-1234-5678 -> 010-xxxx-5678
  const maskPhone = (phone: string) => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 7) return phone; // 이상한 값 들어오면 그냥 원본
    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    return `${head}-xxxx-${tail}`;
  };

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
    const newInquiry: Inquiry = {
      id: Date.now(),
      name: formData.name,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleDateString('ko-KR'),
      password: formData.password,
      phone: formData.phone,
    };

    setInquiries((prev) => {
      const updated = [newInquiry, ...prev];
      localStorage.setItem('inquiries', JSON.stringify(updated));
      return updated;
    });

    setFormData({
      name: '',
      password: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const handleInquiryClick = (inquiry: Inquiry) => {
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

      {/* ... 위쪽 폼 / 연락처 / SNS 부분은 그대로 ... */}

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
                    연락처
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
                      {maskName(inquiry.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maskPhone(inquiry.phone)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.date}
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
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

      {/* Password Modal 그대로 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* ... 생략 ... */}
        </div>
      )}
    </section>
  );
};

export default QuestionRoom;
