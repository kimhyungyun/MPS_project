'use client';
import React from 'react';
import Image from "next/image";

const mps = () => {
    return (
        <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* 상단 타이틀 */}
                <div className="text-center mb-20 mt-20">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">MPS 소개</h1>
                    <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
                </div>

                {/* Hero Section */}
                <div className="bg-white rounded-2xl p-10 mb-16 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">MPS 란?</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        근막통 증후군을 치료하는 전문적인 침법으로, 
                        한의학의 정교한 치료 방식을 통해 환자의 건강을 회복시킵니다.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-16">
                    {/* Section 1: MPS 전문가 소개 */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-2/5 p-8 bg-gray-50">
                                <div className="relative w-full aspect-square">
                                    <Image
                                        src="/mps.png"
                                        alt="MPS 전문가"
                                        fill
                                        className="object-cover rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="lg:w-3/5 p-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">1</span>
                                    MPS 전문가의 역할
                                </h3>
                                <p className="text-xl text-gray-700 leading-relaxed">
                                    외과의사들이 수술용 칼을 가지고 환부를 시술하듯이<br/>
                                    한의사는 침으로 근육과 인대 건을 치료하는 침구 전문가입니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: 전문가 과정 */}
                    <div className="bg-white rounded-2xl p-10 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">2</span>
                            전문가가 되기 위한 과정
                        </h3>
                        <div className="pl-14">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                침구 전문가가 되는 길은 해부학에서 신경·혈관·근육·인대·건들을 잘 숙지해야 합니다.<br/>
                                이를 통해 환자분들이 원하는 진단과 통증치료에 침과 뜸을 이용해서<br/>
                                치료율을 높일 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: 근막침 요법 */}
                    <div className="bg-white rounded-2xl p-10 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">3</span>
                            근막침 요법
                        </h3>
                        <div className="pl-14">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                경근근막(A-MPS)연구회에서 발간한 '근막침 요법'은<br/>
                                근막통 증후군을 치료하는 전문적인 침법입니다.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: 체형질환과 경혈 */}
                    <div className="bg-white rounded-2xl p-10 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">4</span>
                            체형질환과 경혈
                        </h3>
                        <div className="pl-14">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                만성적인 체형질환은 70%가 경혈과 같거나 관련이 있습니다.<br/>
                                '근막침 요법'을 통해 경혈을 쉽게 찾아갈 수 있으며<br/>
                                경혈치료의 원칙을 이해할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    {/* Section 5: 다양한 치료법 */}
                    <div className="bg-white rounded-2xl p-10 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">5</span>
                            다양한 치료법
                        </h3>
                        <div className="pl-14">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                추나, 봉침, 침도, 테이핑, 인대침, prolotherapy, IMS 등<br/>
                                다양한 치료법의 기본이 되는 근육·인대·건 교과서로서<br/>
                                의료인이라면 반드시 익혀야 할 기본서입니다.
                            </p>
                        </div>
                    </div>

                    {/* Section 6: 운동기질환 치료 */}
                    <div className="bg-white rounded-2xl p-10 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 text-lg">6</span>
                            운동기질환 치료
                        </h3>
                        <div className="pl-14">
                            <p className="text-xl text-gray-700 leading-relaxed">
                                운동기질환의 통증치료와 함께 근육을 조화롭게 강화시켜<br/>
                                의료인 삶의 질을 높이는데 필요한 침술 교과서입니다.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-20">
                        <p className="text-2xl text-gray-600 font-medium">
                            감사합니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default mps;