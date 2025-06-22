import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Video.js CSS 파일 로드

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) {
      setError('비디오 URL이 없습니다.');
      return;
    }

    // Video.js 초기화 및 비디오 설정
    const player = videojs(videoRef.current, {
      sources: [
        {
          src: videoUrl, // CloudFront URL (m3u8 파일)
          type: 'application/x-mpegURL',
        },
      ],
      controls: true,
      autoplay: true,
      preload: 'auto',
    });

    player.ready(() => {
      console.log('Video.js player is ready!');
    });

    // 오류 처리
    player.on('error', (e: any) => {  // 여기에서 e의 타입을 `any`로 설정
      console.error('Video.js error:', e);
      setError('비디오 로딩 중 오류가 발생했습니다.');
    });

    // 컴포넌트가 언마운트되었을 때 Video.js 플레이어 제거
    return () => {
      player.dispose();
    };
  }, [videoUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <video ref={videoRef} className="video-js vjs-default-skin w-full h-full rounded-lg"></video>;
};

export default VideoPlayer;
