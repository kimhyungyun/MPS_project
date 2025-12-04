'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CoverImageUploaderProps {
  image: File | null;
  onChange: (file: File | null) => void;
}

const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({
  image,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        본문 이미지
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
          const files = e.dataTransfer.files;
          if (files && files[0] && files[0].type.startsWith('image/')) {
            onChange(files[0]);
          }
        }}
      >
        <div className="space-y-2 text-center w-full">
          {image ? (
            <div className="w-full">
              <ul className="divide-y divide-gray-200">
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[160px] sm:max-w-[200px]">
                      {image.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
                  >
                    삭제
                  </button>
                </li>
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
                  htmlFor="cover-image-upload"
                  className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>본문 이미지 업로드</span>
                  <input
                    id="cover-image-upload"
                    name="cover-image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="sm:pl-3 text-[11px] sm:text-xs mt-1 sm:mt-0">
                  또는 드래그 앤 드롭
                </p>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500">
                PNG, JPG, GIF 등
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverImageUploader;
