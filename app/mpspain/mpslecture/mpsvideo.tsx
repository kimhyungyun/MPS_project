'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
  video_folder?: string;
  video_name?: string;
  type: 'single' | 'packageA' | 'packageB' | 'packageC' | 'packageD' | 'packageE';
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function HlsPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    console.log("🎯 [HLS INIT] src =", src);

    if (Hls.isSupported()) {
      Hls.DefaultConfig.debug = true;
      Hls.DefaultConfig.xhrSetup = function (xhr) {
        xhr.withCredentials = true;
        console.log(" 🍪 [xhrSetup cookie]", document.cookie);
      };

      const hls = new Hls();

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.log("❌ [HLS ERROR]", data);
      });

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
      className="w-full rounded-lg shadow border"
    />
  );
}

// export default function Mpsvideo() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [selected, setSelected] = useState<Course | null>(null);
//   const [loadingList, setLoadingList] = useState(true);
//   const [loadingPlay, setLoadingPlay] = useState(false);
//   const [streamUrl, setStreamUrl] = useState('');
//   const [errorMsg, setErrorMsg] = useState('');

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/lectures`);
//         const data = await res.json();
//         setCourses(data);
//       } catch (e) {
//         setErrorMsg("강의 목록을 불러오지 못했습니다.");
//       } finally {
//         setLoadingList(false);
//       }
//     })();
//   }, []);

//   const preparePlay = async (course: Course) => {
//     setSelected(course);
//     setStreamUrl("");
//     setErrorMsg("");
//     setLoadingPlay(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         alert("로그인이 필요합니다.");
//         return;
//       }

//       const playAuth = await fetch(
//         `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
//         {
//           method: "GET",
//           credentials: "include",
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (!playAuth.ok) throw new Error("Auth failed");
//       const data = await playAuth.json();

//       console.log("🎯 [FINAL STREAM URL]", data.streamUrl);

//       // ✅ 서버에서 내려준 URL만 사용
//       setStreamUrl(data.streamUrl);
//     } catch (err) {
//       console.error(err);
//       setErrorMsg("영상 재생 중 오류");
//     } finally {
//       setLoadingPlay(false);
//     }
//   };

//   return (
//     <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <h1 className="text-4xl font-bold text-center mb-8">MPS 강의실</h1>

//         {loadingList ? (
//           <p className="text-center text-gray-500">강의 목록을 불러오는 중…</p>
//         ) : errorMsg ? (
//           <p className="text-center text-red-600">{errorMsg}</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {courses.map((c) => (
//               <div
//                 key={c.id}
//                 className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl"
//                 onClick={() => preparePlay(c)}
//               >
//                 <img
//                   src={c.thumbnail_url}
//                   alt={c.title}
//                   className="w-full h-40 object-cover rounded-lg mb-4"
//                 />
//                 <h2 className="text-lg font-semibold mb-2">{c.title}</h2>
//                 <p className="text-gray-600 text-sm">{c.description}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {selected && (
//           <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg max-w-4xl w-full relative">
//               <button
//                 className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
//                 onClick={() => {
//                   setSelected(null);
//                   setStreamUrl("");
//                 }}
//               >
//                 ✕
//               </button>

//               <h2 className="text-2xl font-bold mb-4">{selected.title}</h2>

//               <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
//                 <HlsPlayer src={streamUrl} />
//               </div>

//               {!streamUrl && (
//                 <p className="text-center text-gray-500 mb-4">🔄 스트림 URL 준비중...</p>
//               )}

//               <p className="text-gray-700">{selected.description}</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
export default function Mpsvideo() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPlay, setLoadingPlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ 선택된 패키지 (all: 전체 패키지)
  const [selectedPackage, setSelectedPackage] = useState<
    'all' | 'packageA' | 'packageB' | 'packageC' | 'packageD' | 'packageE'
  >('packageA');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures`);
        const data = await res.json();
        setCourses(data);
      } catch (e) {
        setErrorMsg("강의 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const preparePlay = async (course: Course) => {
    setSelected(course);
    setStreamUrl("");
    setErrorMsg("");
    setLoadingPlay(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const playAuth = await fetch(
        `${API_BASE_URL}/api/signed-urls/lecture/${course.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!playAuth.ok) throw new Error("Auth failed");
      const data = await playAuth.json();
      setStreamUrl(data.streamUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg("영상 재생 중 오류");
    } finally {
      setLoadingPlay(false);
    }
  };

  // ✅ 선택된 패키지 기준으로 필터링
  const filteredCourses = courses.filter((c) => {
    // 싱글 강의는 패키지 목록에서 제외하고 싶으면 여기서 걸러줌
    if (c.type === 'single') return false;

    if (selectedPackage === 'all') return true;
    return c.type === selectedPackage;
  });

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">MPS 강의실</h1>

        {/* ✅ 패키지 선택 탭/버튼 영역 */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: 'packageA', label: '패키지 A' },
            { key: 'packageB', label: '패키지 B' },
            { key: 'packageC', label: '패키지 C' },
            { key: 'packageD', label: '패키지 D' },
            { key: 'packageE', label: '패키지 E' },
            { key: 'all',      label: '전체 패키지' },
          ].map((pkg) => (
            <button
              key={pkg.key}
              onClick={() => setSelectedPackage(pkg.key as any)}
              className={`px-4 py-2 rounded-full text-sm border ${
                selectedPackage === pkg.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {pkg.label}
            </button>
          ))}
        </div>

        {loadingList ? (
          <p className="text-center text-gray-500">강의 목록을 불러오는 중…</p>
        ) : errorMsg ? (
          <p className="text-center text-red-600">{errorMsg}</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-500">해당 패키지에 강의가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl"
                onClick={() => preparePlay(c)}
              >
                <img
                  src={c.thumbnail_url}
                  alt={c.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold mb-2">{c.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setSelected(null);
                  setStreamUrl("");
                }}
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4">{selected.title}</h2>

              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-6 border">
                <HlsPlayer src={streamUrl} />
              </div>

              {!streamUrl && (
                <p className="text-center text-gray-500 mb-4">
                  🔄 스트림 URL 준비중...
                </p>
              )}

              <p className="text-gray-700">{selected.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
