'use client';
import React from 'react';
import Image from "next/image";

const mps = () => {
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

            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">MPS 란?</h1>
                <p className="text-gray-600 leading-relaxed">
                    근막통 증후군을 치료하는 전문적인 침법으로, 
                    한의학의 정교한 치료 방식을 통해 환자의 건강을 회복시킵니다.
                </p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Section 1: MPS 전문가 소개 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="lg:w-1/3">
                            <Image
                                src="/mps.png"
                                alt="MPS 전문가"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />
                        </div>
                        <div className="lg:w-2/3">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">MPS 전문가의 역할</h2>
                            <p className="text-gray-600">
                                외과의사들이 수술용 칼을 가지고 환부를 시술하듯이<br/>
                                한의사는 침으로 근육과 인대 건을 치료하는 침구 전문가입니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: 전문가 과정 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">전문가가 되기 위한 과정</h2>
                    <p className="text-gray-600">
                        침구 전문가가 되는 길은 해부학에서 신경·혈관·근육·인대·건들을 잘 숙지해야 합니다.<br/>
                        이를 통해 환자분들이 원하는 진단과 통증치료에 침과 뜸을 이용해서<br/>
                        치료율을 높일 수 있습니다.
                    </p>
                </div>

                {/* Section 3: 근막침 요법 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">근막침 요법</h2>
                    <p className="text-gray-600">
                        경근근막(A-MPS)연구회에서 발간한 '근막침 요법'은<br/>
                        근막통 증후군을 치료하는 전문적인 침법입니다.
                    </p>
                </div>

                {/* Section 4: 체형질환과 경혈 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">체형질환과 경혈</h2>
                    <p className="text-gray-600">
                        만성적인 체형질환은 70%가 경혈과 같거나 관련이 있습니다.<br/>
                        '근막침 요법'을 통해 경혈을 쉽게 찾아갈 수 있으며<br/>
                        경혈치료의 원칙을 이해할 수 있습니다.
                    </p>
                </div>

                {/* Section 5: 다양한 치료법 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">다양한 치료법</h2>
                    <p className="text-gray-600">
                        추나, 봉침, 침도, 테이핑, 인대침, prolotherapy, IMS 등<br/>
                        다양한 치료법의 기본이 되는 근육·인대·건 교과서로서<br/>
                        의료인이라면 반드시 익혀야 할 기본서입니다.
                    </p>
                </div>

                {/* Section 6: 운동기질환 치료 */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">운동기질환 치료</h2>
                    <p className="text-gray-600">
                        운동기질환의 통증치료와 함께 근육을 조화롭게 강화시켜<br/>
                        의료인 삶의 질을 높이는데 필요한 침술 교과서입니다.
                    </p>
                </div>

                <div className="text-center text-gray-500 text-sm mt-8">
                    감사합니다.
                </div>
            </div>
        </section>
    );
}

export default mps;