// src/components/HlsPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type HlsPlayerProps = {
  src: string; // m3u8 URL (CloudFront / S3 등)
};

export default function HlsPlayer({ src }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const video = videoRef.current;
    if (!video) return;

    // Hls.js 지원 브라우저 (대부분 Chrome/Edge 등)
    if (Hls.isSupported()) {
      const hls = new Hls({
        // ❗ 여기서 withCredentials 설정해서 CloudFront 서명 쿠키 같이 보내기
        xhrSetup: (xhr /*, url*/) => {
          xhr.withCredentials = true;
        },
      });

      hls.attachMedia(video);
      hls.loadSource(src);

      // 선택 사항: manifest 파싱 후 자동 재생
      // hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //   video.play().catch(() => {});
      // });

      return () => {
        hls.destroy();
      };
    }

    // iOS Safari / 일부 브라우저는 video 태그에서 HLS 직접 지원
    video.src = src;

    return () => {
      // fallback 경로에서는 별도 정리할 건 없음
    };
  }, [src]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl overflow-hidden">
      {/* 상단 상태바 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-wide">Player</span>
        </div>
        <span className="text-xs font-medium text-slate-300">MPS Video</span>
      </div>

      {/* 비디오 영역 */}
      <div className="relative aspect-video bg-black">
        {!src && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            동영상 준비 중입니다…
          </div>
        )}

        <video
          ref={videoRef}
          controls
          playsInline
          // ❗ 서명 쿠키를 함께 쓰는 구조면 이거 걸어두는 게 안전함
          crossOrigin="use-credentials"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
