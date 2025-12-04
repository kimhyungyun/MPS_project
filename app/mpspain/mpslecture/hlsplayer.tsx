// src/app/.../mpsvideo/hlsplayer.tsx

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
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      return () => hls.destroy();
    } else {
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="w-full rounded-lg shadow border bg-black"
    />
  );
}
