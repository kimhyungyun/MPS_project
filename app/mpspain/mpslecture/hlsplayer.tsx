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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
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
        <div
          ref={wrapperRef}
          className="group relative w-full h-full bg-black"
        >
          {/* VIDEO */}
          <video
            ref={videoRef}
            controls
            playsInline
            controlsList="nofullscreen"
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
              color: '#fff',
              textShadow: '0 0 3px rgba(0,0,0,0.65)',
              pointerEvents: 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              zIndex: 20,
            }}
          >
            {watermarkText}
          </div>

          <button
            type="button"
            aria-label="전체화면"
            onClick={() => {
              if (!wrapperRef.current) return;
              if (!document.fullscreenElement) {
                wrapperRef.current.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="
              absolute z-50
              right-[55px] bottom-[27px]
              h-[29px] w-[29px]
              inline-flex items-center justify-center
              rounded
              text-white/90
              opacity-90
              transition
              hover:bg-black/50 hover:opacity-100
              focus:outline-none
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>

        </div>
      );
}
