'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

export default function ProfileIntro() {
  useEffect(() => {
    const items = gsap.utils.toArray('.profile-item') as HTMLElement[]
    const images = gsap.utils.toArray('.profile-image') as HTMLElement[]

    items.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            end: 'bottom center',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: img,
            start: 'top 80%',
            end: 'bottom center',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })}, [])

  return (
    <section className="w-full px-4 lg:px-24 py-12 bg-gray-100">
      {/* 상단 타이틀 이미지 */}
      <div className="w-full flex border-b border-gray-300 pb-6 mb-8 mt-30">
        <Image
          src="/next.svg"
          alt="MPS"
          width={220}
          height={60}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-12 text-center">MPS 연구회 강사진 소개</h1>
        
        <div className="space-y-6">
          {/* 문대원 원장 프로필 */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/3">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="문대원 원장"
                    fill
                    className="profile-image rounded-lg object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">문대원</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">(전) 남경한의원 원장</p>
                    <p className="text-gray-600">(전) 동신대학교 외래교수</p>
                    <p className="text-gray-600">(현) 효사랑 가족요양병원 한방과 과장</p>
                    <p className="text-gray-600">(현) MPS연구회 회장</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 정종길 교수 프로필 */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/3">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="정종길 교수"
                    fill
                    className="profile-image rounded-lg object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">정종길</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">(현) 동신대학교 정교수</p>
                    <p className="text-gray-600">(현) MPS 연구회 전임강사</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 김건모 수습 강사 프로필 */}
          <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/3">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="김건모 수습 강사"
                    fill
                    className="profile-image rounded-lg object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">김건모</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600">(현) 전라남도 화순군 공중보건의사</p>
                    <p className="text-gray-600">(현) MPS 연구회 수습강사</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
