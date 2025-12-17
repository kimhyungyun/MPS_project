'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

type HlsPlayerProps = {
  src: string;
  autoPlay?: boolean;
  className?: string;

  /** 워터마크용 */
  watermarkText: string; // ex: user.mb_id or mb_no
};

export default function HlsPlayer({
  src,
  autoPlay = false,
  className = '',
  watermarkText,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wmRef = useRef<HTMLDivElement | null>(null);
  const [wmPos, setWmPos] = useState({ x: 20, y: 20 });

  // -----------------------------
  // HLS 로딩
  // -----------------------------
  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup(xhr) {
          xhr.withCredentials = true;
        },
      });

      hls.attachMedia(video);
      hls.loadSource(src);

      if (autoPlay) {
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      }
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, autoPlay]);

  // -----------------------------
  // 워터마크 위치 랜덤 이동
  // -----------------------------
  useEffect(() => {
    const move = () => {
      if (!wmRef.current) return;

      const parent = wmRef.current.parentElement;
      if (!parent) return;

      const { clientWidth, clientHeight } = parent;

      setWmPos({
        x: Math.random() * (clientWidth - 220),
        y: Math.random() * (clientHeight - 40),
      });
    };

    move();
    const t = setInterval(move, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* VIDEO */}
      <video
        ref={videoRef}
        controls
        playsInline
        crossOrigin="use-credentials"
        className={className || 'w-full h-full'}
      />

      {/* WATERMARK */}
      <div
        ref={wmRef}
        style={{
          position: 'absolute',
          left: wmPos.x,
          top: wmPos.y,
          opacity: 0.28,
          fontSize: 18,
          fontWeight: 700,
          transform: 'none',
          color: '#fff',
          textShadow: '0 0 3px rgba(0,0,0,0.65)',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {watermarkText} · {new Date().toLocaleString()}
      </div>
    </div>
  );
}
