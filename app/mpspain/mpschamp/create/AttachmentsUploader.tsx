'use client';

import { useState } from 'react';

interface AttachmentsUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const AttachmentsUploader: React.FC<AttachmentsUploaderProps> = ({
  files,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange([...files, ...Array.from(e.target.files || [])]);
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        첨부파일
      </label>
      <div
        className={`flex justify-center items-center h-[130px] sm:h-[140px] px-4 sm:px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
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
          const droppedFiles = e.dataTransfer.files;
          if (droppedFiles) {
            onChange([...files, ...Array.from(droppedFiles)]);
          }
        }}
      >
        <div className="space-y-2 text-center w-full">
          {files.length > 0 ? (
            <div className="w-full">
              <ul className="divide-y divide-gray-200 max-h-24 overflow-auto">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="py-1.5 sm:py-2 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[180px] sm:max-w-[220px] text-left">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors duration-200 flex-shrink-0"
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
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
              <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600 items-center justify-center gap-1 sm:gap-0">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <p className="sm:pl-3 text-[11px] sm:text-xs mt-1 sm:mt-0">
                  또는 드래그 앤 드롭
                </p>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500">
                PDF, 이미지 파일 등
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentsUploader;
