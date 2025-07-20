export default function TestVideoPlayer() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>테스트 영상</h2>
      <video
        controls
        width={720}
        src="/테스팅영상.mp4" // public 폴더 기준 경로
        style={{ border: "1px solid #ccc" }}
      >
        브라우저가 video 태그를 지원하지 않습니다.
      </video>
    </div>
  );
}
