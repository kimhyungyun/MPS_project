import Image from "next/image";

const Firstpage = () => {
  return (
    <section className="relative w-full h-screen">
      <Image
        src="/예시메인사진.png"
        alt=""
        fill
        quality={100}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/5 z-10" />
    </section>
  );
};

export default Firstpage;
