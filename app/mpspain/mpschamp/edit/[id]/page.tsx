'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface NoticeForm {
  title: string;
  desc: string;
  content: string;
  isImportant: boolean;
  attachments: File[];
  existingAttachments?: { name: string; url: string }[];
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const EditNotice = ({ params }: PageProps) => {
  const router = useRouter();
  const [form, setForm] = useState<NoticeForm>({
    title: '',
    desc: '',
    content: '',
    isImportant: false,
    attachments: [],
    existingAttachments: [],
  });

  useEffect(() => {
    // 실제로는 API 호출로 데이터를 가져와야 합니다
    const fetchNotice = async () => {
      // 임시 데이터
      setForm({
        title: "2025년 MPS 정회원 가입신청 안내",
        desc: "MPS연구회에서 정회원을 모집합니다.",
        content: "상세 내용...",
        isImportant: true,
        attachments: [],
        existingAttachments: [
          { name: "가입신청서.pdf", url: "/files/application.pdf" }
        ]
      });
    };

    fetchNotice();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 API 호출로 데이터를 저장해야 합니다
    console.log('Form submitted:', form);
    router.push('/mpspain/mpschamp');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const removeFile = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const removeExistingFile = (index: number) => {
    setForm(prev => ({
      ...prev,
      existingAttachments: prev.existingAttachments?.filter((_, i) => i !== index)
    }));
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">공지사항 수정</h1>
            <p className="mt-2 text-sm text-gray-600">필수 항목을 모두 입력해주세요.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="desc" className="block text-sm font-semibold text-gray-700 mb-2">
                설명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="desc"
                value={form.desc}
                onChange={(e) => setForm(prev => ({ ...prev, desc: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            {/* 본문 */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                본문 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
              />
            </div>

            {/* 중요 공지 여부 */}
            <div className="flex items-center bg-gray-50 p-4 rounded-xl">
              <input
                type="checkbox"
                id="isImportant"
                checked={form.isImportant}
                onChange={(e) => setForm(prev => ({ ...prev, isImportant: e.target.checked }))}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isImportant" className="ml-3 block text-sm font-medium text-gray-700">
                중요 공지로 설정
              </label>
            </div>

            {/* 기존 첨부파일 */}
            {form.existingAttachments && form.existingAttachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">기존 첨부파일</h3>
                <ul className="divide-y divide-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                  {form.existingAttachments.map((file, index) => (
                    <li key={index} className="py-3 px-4 flex items-center justify-between hover:bg-gray-100 transition duration-150">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(index)}
                        className="text-red-500 hover:text-red-700 transition duration-150"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 새 첨부파일 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                새 첨부파일
              </label>
              <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition duration-150">
                <div className="space-y-3 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>파일 업로드</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, 이미지 파일 등</p>
                </div>
              </div>
            </div>

            {/* 새로 첨부된 파일 목록 */}
            {form.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">새로 첨부된 파일</h3>
                <ul className="divide-y divide-gray-200 bg-gray-50 rounded-xl overflow-hidden">
                  {form.attachments.map((file, index) => (
                    <li key={index} className="py-3 px-4 flex items-center justify-between hover:bg-gray-100 transition duration-150">
                      <div className="flex items-center space-x-3">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition duration-150"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/mpspain/mpschamp')}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                수정하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditNotice; 