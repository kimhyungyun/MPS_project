import Image from "next/image";
import Link from "next/link";

const HamburgerButton = () => {
    return (
      <Link href="/form/login">
        <button className="flex flex-col justify-between w-12 h-12 z-50 cursor-pointer">
          <Image
           src="/로그인로고.png"
           alt="로그인"
           width={150}
           height={150} />
        </button>
      </Link>
    );
  };
  
  export default HamburgerButton;
  