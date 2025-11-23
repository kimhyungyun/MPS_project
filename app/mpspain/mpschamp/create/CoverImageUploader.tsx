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
            onChange(files[0]);
          }
        }}
      >
        <div className="space-y-2 text-center">
          {image ? (
            <div className="relative">
              <Image
                src={URL.createObjectURL(image)}
                alt="Preview"
                width={300}
                height={200}
                className="rounded-lg"
              />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
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
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="cover-image-upload"
                  className="relative cursor-pointer bg-white rounded-xl font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-400 px-6 py-3 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
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
                <p className="pl-3 self-center">또는 드래그 앤 드롭</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF 등</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverImageUploader;
