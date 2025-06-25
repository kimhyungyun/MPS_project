// src/app/components/VideoPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });
      hls.attachMedia(videoRef.current);
      hls.loadSource(videoUrl);
      hls.on(Hls.Events.ERROR, (_ev, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          setError('비디오 로딩 중 오류가 발생했습니다.');
          hls?.destroy();
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoUrl;
    } else {
      setError('이 브라우저는 HLS를 지원하지 않습니다.');
    }

    return () => {
      hls?.destroy();
    };
  }, [videoUrl]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      playsInline
      crossOrigin="use-credentials"  // ← 여기에 추가
      className="w-full h-auto"
    />
  );
};

export default VideoPlayer;
