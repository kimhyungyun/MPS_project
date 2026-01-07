// components/policy/EmailRejectContent.tsx
export default function EmailRejectContent() {
  return (
    <div className="space-y-4 whitespace-pre-line text-gray-800 leading-relaxed text-sm sm:text-base">
      {`이메일 무단 수집 거부

본 사이트에 게시된 이메일 주소가 전자우편 수집프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반시 정보통신망법에 의해 형사처벌 됨을 유념하시기 바랍니다.

정보통신망법 제 50조의 2(전자우편주소의 무단 수집행위 등 금지)
누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로 전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는 아니된다.
누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를 판매, 유통하여서는 아니된다.
누구든지 제1항 및 제2항의 규정에 의하여 수집, 판매 및 유통이 금지된 전자우편주소임 을 알고 이를 정보전송에 이용하여서는 아니된다.`}
    </div>
  );
}
