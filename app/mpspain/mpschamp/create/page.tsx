'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

interface NoticeForm {
  title: string;
  content: string;
  isImportant: boolean;
  image: File | null;
  attachments: File[];
}

const CreateNotice = () => {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [form, setForm] = useState<NoticeForm>({
    title: '',
    content: '',
    isImportant: false,
    image: null,
    attachments: [],
  });

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new notice object
    const newNotice = {
      id: Date.now(), // Use timestamp as temporary ID
      label: "공지",
      title: form.title,
      content: form.content,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace('.', ''),
      isImportant: form.isImportant,
      image: form.image ? URL.createObjectURL(form.image) : null,
      attachments: form.attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
    };

    // Get existing notices from localStorage
    const existingNotices = JSON.parse(localStorage.getItem('notices') || '[]');
    
    // Add new notice to the beginning of the array
    const updatedNotices = [newNotice, ...existingNotices];
    
    // Save to localStorage
    localStorage.setItem('notices', JSON.stringify(updatedNotices));

    // Navigate back to the list
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

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen mt-20">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">공지사항 작성</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 제목 */}
          <div className="group">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
              required
            />
          </div>

          {/* 본문 */}
          <div className="group">
            <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              본문
            </label>
            <div className="space-y-4">
            {/* <Toolbar editor={editor} /> */}
              <div className="bg-white rounded-xl border border-gray-200 p-2 min-h-[200px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* 이미지와 첨부파일 영역 */}
          <div className="flex gap-6">
            {/* 본문 이미지 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                본문 이미지
              </label>
              <div 
                className={`flex justify-center items-center h-[140px] px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80'
                } shadow-sm hover:shadow-md`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const files = e.dataTransfer.files;
                  if (files && files[0] && files[0].type.startsWith('image/')) {
                    setForm(prev => ({ ...prev, image: files[0] }));
                  }
                }}
              >
                <div className="space-y-2 text-center">
                  {form.image ? (
                    <div className="relative">
                      <Image
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image: null }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
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
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-6 py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <span>본문 이미지 업로드</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setForm(prev => ({ ...prev, image: e.target.files![0] }));
                              }
                            }}
                          />
                        </label>
                        <p className="pl-3 self-center">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF 등</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 첨부파일 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                첨부파일
              </label>
              <div 
                className={`flex justify-center items-center h-[140px] px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isFileDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80'
                } shadow-sm hover:shadow-md`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFileDragging(false);
                  const files = e.dataTransfer.files;
                  if (files) {
                    setForm(prev => ({
                      ...prev,
                      attachments: [...prev.attachments, ...Array.from(files)]
                    }));
                  }
                }}
              >
                <div className="space-y-2 text-center">
                  {form.attachments.length > 0 ? (
                    <div className="w-full">
                      <ul className="divide-y divide-gray-200">
                        {form.attachments.map((file, index) => (
                          <li key={index} className="py-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600 truncate max-w-[200px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            >
                              삭제
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
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
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-6 py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
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
                        <p className="pl-3 self-center">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, 이미지 파일 등</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isImportant"
                checked={form.isImportant}
                onChange={(e) => setForm(prev => ({ ...prev, isImportant: e.target.checked }))}
                className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded-md transition-all duration-200"
              />
              <label htmlFor="isImportant" className="ml-3 block text-sm font-medium text-gray-700">
                중요 공지로 설정
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/mpspain/mpschamp')}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                작성하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateNotice; 