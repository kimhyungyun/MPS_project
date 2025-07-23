'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TestVideoPlayer() {
  const [iframeSrc, setIframeSrc] = useState("");
  const searchParams = useSearchParams();

  const lectureId = Number(searchParams.get("lectureId"));
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.mb_id); // JWT에서 mb_id 추출
    } catch (e) {
      console.error("JWT 파싱 실패", e);
    }
  }, []);

  useEffect(() => {
    const fetchPlayToken = async () => {
      if (!lectureId || !userId) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_URL is not defined");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/lectures/${lectureId}/play-token?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch play token");

        const { otp, playbackInfo } = await res.json();

        const src = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}&player=9ae8bbe8dd964ddc9bdb932cca1cb59a`;
        setIframeSrc(src);
      } catch (err) {
        console.error("VdoCipher 영상 불러오기 실패", err);
      }
    };

    fetchPlayToken();
  }, [lectureId, userId]);

  if (!lectureId || !userId) return <p>잘못된 요청입니다.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>강의 영상</h2>
      {iframeSrc ? (
        <iframe
          src={iframeSrc}
          style={{ width: "100%", height: "480px", border: "none" }}
          allowFullScreen
          allow="encrypted-media"
        />
      ) : (
        <p>영상을 불러오는 중입니다...</p>
      )}
    </div>
  );
}
