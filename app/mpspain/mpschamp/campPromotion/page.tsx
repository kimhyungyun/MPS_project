'use client';

import React from 'react';

const Mps = () => {
  const pages = [
    "/페이지1.png",
    "/페이지2.png",
    "/페이지3.png",
    "/페이지4.png",
    "/페이지5.png",
    "/페이지6.png",
    "/페이지7.png",
    "/페이지8.png",
    "/페이지9.png",
    "/페이지10.png",
    "/페이지11.png",
    "/페이지12.png",
    "/페이지13.png",
    "/페이지14.png",
  ];

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full flex flex-col items-center">
        {pages.map((src, index) => (
          <div key={index} className="relative w-full">
            <img
              src={src}
              alt={`페이지 ${index + 1}`}
              className="w-full h-auto block"
            />

            {index === 0 && (
              <a
                href="https://mpspain.co.kr/mpspain/mpschamp/26"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-[40px] right-[40px] px-6 py-3 rounded-lg bg-black text-white text-base font-semibold hover:bg-gray-800 transition"
              >
                신청하기
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mps;