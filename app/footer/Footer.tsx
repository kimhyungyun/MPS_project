const Footer = () => {
    return (
      <footer
        className={`w-screen h-[300px] py-16 px-20 bg-gray-100`}
      >
        <div className="flex flex-row mt-5">
        <div className="w-full h-full ml-30">
          <p className="text-black ">(c)Copyright 2006 경근근막침(A-MPS)연구회.</p>
          <p className="text-black ">대표 : 문대원 | 사업자번호 : 402-86-04244</p>
          <p className="text-black ">전화 : 063.284.0707</p>
          <p className="text-black ">주소 : 전라북도 전주시 용머리로 34 5층 | E-Mail : mdw36@hanmail.net </p>
          <p className="text-black ">통신판매신고번호 : 제2013-4650077-30-2-00234</p>
        </div>
        <div className="w-full h-full ml-30">
          <p className="text-black text-xl">
            이용약관 및 개인정보보호방침
          </p>
        </div>
        </div>
      </footer>
    );
  };
 
export default Footer;