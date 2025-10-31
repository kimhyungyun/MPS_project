
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsPlayer({ src }: { src: string }) {
  console.log("🎥 HlsPlayer 렌더되지 src =", src);

  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    console.log("⚙️ HLS useEffect 실행됨 src =", src);

    const video = ref.current;
    if (!video) return;

    if (Hls.isSupported()) {
      Hls.DefaultConfig.debug = true;
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
        console.log('🍪 cookie =', document.cookie);
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
    <video
      ref={ref}
      controls
      playsInline
      className="w-full rounded-lg shadow border bg-black"
    />
  );
}
