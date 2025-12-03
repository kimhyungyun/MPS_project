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
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 헤더 섹션 */}
      <div className="w-full bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-24 py-16">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              MPS 연구회 강사진 소개
            </h1>
            <p className="text-lg text-gray-600">
              전문적인 의료진과 함께하는 MPS 연구회
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-24 py-8">
        <div className="space-y-12">
          {/* 문대원 원장 프로필 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="문대원 원장"
                    fill
                    className="profile-image rounded-xl object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">문대원 원장</h2>
                  <div className="space-y-3">
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (전) 남경한의원 원장
                    </p>
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (전) 동신대학교 외래교수
                    </p>
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) 효사랑 가족요양병원 한방과 과장
                    </p>
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) MPS연구회 회장
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 정종길 교수 프로필 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="정종길 교수"
                    fill
                    className="profile-image rounded-xl object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">정종길 교수</h2>
                  <div className="space-y-3">
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) 동신대학교 정교수
                    </p>
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) MPS 연구회 전임강사
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 김건모 수습 강사 프로필 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative w-[300px] h-[300px]">
                  <Image
                    src="/빈배경로고1.png"
                    alt="김건모 수습 강사"
                    fill
                    className="profile-image rounded-xl object-contain"
                  />
                </div>
              </div>
              <div className="lg:w-2/3">
                <div className="profile-item text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">김건모 수습 강사</h2>
                  <div className="space-y-3">
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) 전라남도 화순군 공중보건의사
                    </p>
                    <p className="text-gray-700 flex items-center lg:justify-start justify-center">
                      <span className="font-medium mr-2">•</span>
                      (현) MPS 연구회 수습강사
                    </p>
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
