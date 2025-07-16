// // components/VideoPlayer.tsx
// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Hls from 'hls.js';

// interface VideoPlayerProps {
//   videoUrl: string;
// }

// const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!videoUrl || !videoRef.current) return;

//     let hls: Hls | null = null;

//     // 기존 인스턴스 정리
//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }

//     if (Hls.isSupported()) {
//       hls = new Hls({
//         xhrSetup: (xhr) => {
//           xhr.withCredentials = true; // ✅ 쿠키 인증 활성화
//         },
//         debug: false,
//         enableWorker: true,
//         lowLatencyMode: true,
//       });

//       hlsRef.current = hls;

//       hls.attachMedia(videoRef.current);
//       hls.loadSource(videoUrl);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         videoRef.current?.play().catch((err) => {
//           console.error('자동 재생 실패:', err);
//           setError('비디오 자동 재생에 실패했습니다.');
//         });
//       });

//       hls.on(Hls.Events.ERROR, (event, data) => {
//         if (data.fatal) {
//           console.error('HLS fatal error:', data);
//           setError(`비디오 로딩 중 오류가 발생했습니다. (${data.type})`);
//           hls?.destroy();
//         } else {
//           console.warn('HLS non-fatal error:', data);
//         }
//       });
//     }
//     // Safari 등 네이티브 HLS 지원 브라우저
//     else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
//       videoRef.current.src = videoUrl;

//       videoRef.current.addEventListener('error', (e) => {
//         console.error('Native HLS video error:', e);
//         setError('비디오 로딩 중 오류가 발생했습니다.');
//       });

//       videoRef.current.load();
//       videoRef.current.play().catch((err) => {
//         console.error('Safari 자동 재생 실패:', err);
//         setError('비디오 자동 재생에 실패했습니다.');
//       });
//     } else {
//       setError('이 브라우저는 HLS 비디오를 지원하지 않습니다.');
//     }

//     return () => {
//       hls?.destroy();
//     };
//   }, [videoUrl]);

//   if (error) {
//     return (
//       <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
//         <p className="text-red-500 text-sm">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <video
//       ref={videoRef}
//       controls
//       playsInline
//       className="w-full h-full rounded-lg"
//       autoPlay
//       muted // ⚠️ 일부 브라우저 자동재생 허용 위해 필요
//     />
//   );
// };

// export default VideoPlayer;
