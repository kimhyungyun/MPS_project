import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;  // videoUrl이나 videoRef가 없다면 실행하지 않음

    // Hls.js로 HLS 스트리밍 지원 처리
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: function (xhr) {
          xhr.withCredentials = false;
        },
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          setError('비디오 로딩 중 오류가 발생했습니다.');
          hls.destroy();
        }
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(console.error);
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari의 경우 직접 m3u8 URL을 src로 설정
      videoRef.current.src = videoUrl;
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
