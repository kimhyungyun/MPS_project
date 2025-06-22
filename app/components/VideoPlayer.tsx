'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);  // Hls.js 인스턴스를 저장할 ref

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    // 기존 Hls 인스턴스가 있으면 이를 파괴하고 새로 생성
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // Hls.js로 HLS 스트리밍 지원 처리
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      // 오류 처리
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          setError('비디오 로딩 중 오류가 발생했습니다.');
          hls.destroy();
        }
      });

      hls.loadSource(videoUrl); // CloudFront URL 사용
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch((err) => {
          console.error('Error playing video:', err);
          setError('비디오 재생에 실패했습니다.');
        });
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari의 경우 직접 m3u8 URL을 src로 설정
      videoRef.current.src = videoUrl; // CloudFront URL 사용
      videoRef.current.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setError('비디오 로딩 중 오류가 발생했습니다.');
      });
    } else {
      setError('이 브라우저는 HLS 비디오를 지원하지 않습니다.');
    }
  }, [videoUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-full rounded-lg"
      playsInline
    />
  );
};

export default VideoPlayer;
