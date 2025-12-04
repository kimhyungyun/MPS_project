// src/components/HlsPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      Hls.DefaultConfig.debug = false;
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
      };

      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl overflow-hidden">
      {/* 상단 상태바 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-wide">Player</span>
        </div>
        <span className="text-xs font-medium text-slate-300">
          MPS Video
        </span>
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
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
