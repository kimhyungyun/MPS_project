import Image from "next/image";

const HamburgerButton = () => {
    return (
      <button className="flex flex-col justify-between w-12 h-12 z-50">
        <Image
         src="/로그인로고.png"
         alt=""
         width={150}
         height={150} />
      </button>
    );
  };
  
  export default HamburgerButton;
  