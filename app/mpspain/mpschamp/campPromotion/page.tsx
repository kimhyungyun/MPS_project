export default function Page() {
  const pages = [
    "/페이지1.png",
    "/페이지2.png",
    "/페이지3.png",
    "/페이지4.png",
    "/페이지5.png",
    "/페이지6.png",
    "/페이지7.png",
    "/페이지8.png",
    "/페이지9.png",
    "/페이지10.png",
    "/페이지11.png",
    "/페이지12.png",
    "/페이지13.png",
    "/페이지14.png",
  ];

  return (
    <main className="w-full flex flex-col items-center bg-white">
      {pages.map((src, index) => (
        <section
          key={index}
          className="relative w-full max-w-[393px]"
        >
          {/* 이미지 */}
          <img
            src={src}
            alt={`page-${index + 1}`}
            className="w-full h-auto block"
          />

          {/* 👉 1페이지에만 버튼 */}
          {index === 0 && (
            <a
              href="https://mpspain.co.kr/mpspain/mpschamp/26"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-[30px] right-[20px] px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
            >
              신청하기
            </a>
          )}
        </section>
      ))}
    </main>
  );
}