'use client';
import React from 'react';
import Image from "next/image";

const mps = () => {
    return (
        <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">MPS 캠프 소개</h1>
                    <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                </div>

                {/* Main Content */}
                <div className="space-y-12">
                    {/* Introduction Section */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">현재의 한방진료</h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-4">
                            한방진료의 근골격계 환자비율은 갈수록 증가하고 있습니다. 2021년 자료에 따르면 한방진료를 이용하는 72%에 달한다고 합니다.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            이러한 경향은 앞으로도 더욱 지속될 것이라고 생각합니다. 이에 맞추어 한의사들도 여러 가지 변화를 시도하고 있습니다. 
                            현재 가장 이슈가 되고 있는 X-ray와 같은 의료기기에 대한 것부터, 약침, 추나는 당연하게 해야하는 시대가 되었습니다.
                        </p>
                    </div>

                    {/* MPS Importance Section */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">MPS의 중요성</h2>
                        <div className="space-y-4">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                MPS는 기본입니다. 축구 선수가 축구를 잘하기 위해서는 일단 달리기를 잘해야합니다. 그것이 기본의 중요성입니다. 
                                MPS는 현대 해부학을 기반으로 한 가장 기본적인 침술입니다.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                때문에 근 골격계 환자에게 약침을 놓기 위해서는, 추나를 하기 위해서는 MPS를 알아야합니다. 
                                기본이 탄탄해야 더 심화된 치료도 배울 수 있는 것입니다. MPS를 잘 익혀놓은 사람과 아닌 사람의 차이는 
                                치료과정에서 반드시 드러납니다.
                            </p>
                        </div>
                    </div>

                    {/* Camp Benefits Section */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">MPS 캠프의 장점</h2>
                        <div className="space-y-4">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                MPS 캠프는 이러한 MPS-A를 익히는데 가장 빠른 방법입니다. 책으로 동영상으로 배우는 것 보다 가장 빠르게 
                                배울 수 있는 방법이 바로 실습을 하면서 실시간으로 피드백을 받는 것입니다.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                이 방법은 빠르게 진도를 나가야하는 현재의 한의대 시스템에서는 굉장히 시도하기 어렵습니다. 
                                그렇기 때문에 여러분들이 MPS 캠프를 참가해야하는 것입니다.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                MPS 4일 간의 캠프 동안 여러분이 배우는 것은 여러분의 임상에서의 탄탄한 기본기가 되어 줄 것이라 확신합니다.
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">문의사항</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            캠프에 대한 문의사항은 캠프 운영진에게 언제든 해주시면 감사하겠습니다.
                            저희 MPS 캠프 연구진은 캠프 실습의 질을 높이기 위해서 끊임없이 노력하겠습니다.
                        </p>
                    </div>

                    {/* Closing Message */}
                    <div className="text-center mt-12">
                        <p className="text-xl text-gray-600 font-medium">
                            감사합니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default mps;