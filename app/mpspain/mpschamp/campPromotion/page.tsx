export default function Page() {
  return (
    <main className="w-full bg-white flex justify-center">
      <div className="relative w-full max-w-[393px]">
        {/* 전체 이미지 */}
        <img
          src="/Frame 1.png"
          alt="MPS 캠프 홍보 페이지"
          className="w-full h-auto block"
        />

        {/* 오른쪽 아래 버튼 */}
        <a
          href="https://mpspain.co.kr/mpspain/mpschamp/26"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-[120px] right-[20px] px-5 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition"
        >
          이동
        </a>
      </div>
    </main>
  );
}