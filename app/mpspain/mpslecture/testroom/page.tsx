'use client';
import { useState } from "react";

const VIDEO_LIST = [
  {
    title: "1 안면근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/1+%EC%95%88%EB%A9%B4%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    title: "2 흉쇄유돌근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/2+%ED%9D%89%EC%87%84%EC%9C%A0%EB%8F%8C%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    title: "3 교근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/3+%EA%B5%90%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    title: "4 측두근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/4+%EC%B8%A1%EB%91%90%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    title: "5 내익상근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/5+%EB%82%B4%EC%9D%B5%EC%83%81%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
];

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  return (
    <div style={{ padding: "20px" }}>
      <h1>영상 리스트</h1>

      {/* 리스트 영역 */}
      <div style={{ marginBottom: "20px" }}>
        {VIDEO_LIST.map((video, index) => (
          <button
            key={index}
            style={{
              display: "block",
              marginBottom: "10px",
              padding: "10px 16px",
              cursor: "pointer",
              background: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
            onClick={() => setCurrentVideo(video.url)}
          >
            {video.title}
          </button>
        ))}
      </div>

      {/* 영상 재생 영역 */}
      {currentVideo && (
        <video
          key={currentVideo} // URL 바뀔 때마다 완전히 리랜더 → 자동재생 보장
          src={currentVideo}
          controls
          autoPlay
          style={{ width: "100%", maxWidth: "900px", borderRadius: "8px" }}
        />
      )}
    </div>
  );
}
