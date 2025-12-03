const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex flex-col sm:flex-row justify-between gap-8">

          {/* left */}
          <div className="text-gray-700 text-sm leading-relaxed text-center sm:text-left">
            <p>(c)Copyright 2006 경근근막침(A-MPS)연구회.</p>
            <p>대표 : 문대원 | 사업자번호 : 402-86-04244</p>
            <p>전화 : 063.284.0707</p>
            <p>주소 : 전라북도 전주시 용머리로 34 5층 | E-Mail : mdw36@hanmail.net</p>
            <p>통신판매신고번호 : 제2013-4650077-30-2-00234</p>
          </div>

          {/* right */}
          <div className="flex items-center justify-center sm:justify-end text-gray-700 text-sm mt-2 sm:mt-0">
            <p className="cursor-pointer hover:underline whitespace-nowrap">
              이용약관 및 개인정보보호방침
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
