'use client';

import React from 'react';
import Image from 'next/image';

const Mps = () => {
  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      
      {/* 가운데 정렬 + 좌우 여백 */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* 이미지 */}
        <div className="relative w-full">
          <Image
            src="/Mps란.jpg" // public 폴더에 이미지 넣기
            alt="MPS란?"
            width={1200}
            height={2000}
            priority
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>

      </div>
    </section>
  );
};

export default Mps;