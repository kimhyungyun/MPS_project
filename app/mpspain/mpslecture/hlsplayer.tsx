// src/components/HlsPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type HlsPlayerProps = {
  /** CloudFront 등에서 내려오는 m3u8 URL */
  src: string;
  /** true면 manifest 파싱 후 자동 재생 */
  autoPlay?: boolean;
  /** className 커스터마이징 */
  className?: string;
};

export default function HlsPlayer({
  src,
  autoPlay = false,
  className = '',
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    // 대부분 브라우저 (Chrome, Edge 등)
    if (Hls.isSupported()) {
      hls = new Hls();

      // 🔑 CloudFront Signed Cookie 같이 보내기
      hls.config.xhrSetup = (xhr, _url) => {
        xhr.withCredentials = true;
      };

      hls.attachMedia(video);
      hls.loadSource(src);

      if (autoPlay) {
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video
            .play()
            .catch(() => {
              // 자동재생 막힌 경우 무시
            });
        });
      }
    } else {
      // iOS Safari 등: video 태그가 HLS 직접 지원
      video.src = src;
      if (autoPlay) {
        video
          .play()
          .catch(() => {
            // 자동재생 막힌 경우 무시
            return;
          });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      crossOrigin="use-credentials"
      className={className || 'w-full rounded-lg shadow border bg-black'}
    />
  );
}
