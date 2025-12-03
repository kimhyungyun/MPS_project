import Menuheader from "./Menuheader";

const HEADER_HEIGHT = 100; // Menuheader 실제 높이에 맞게 숫자만 조정

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* fixed 헤더는 그냥 바로 렌더 */}
      <Menuheader />

      {/* 헤더 높이만큼 아래로 밀어서 컨텐츠가 안 가려지게 */}
      <main style={{ paddingTop: HEADER_HEIGHT }}>
        {children}
      </main>
    </>
  );
}
