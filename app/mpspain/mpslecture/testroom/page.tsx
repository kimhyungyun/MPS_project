'use client';
import { useEffect, useMemo, useRef, useState } from "react";

type VideoItem = {
  no: number;
  title: string;
  type: "s3";
  url: string;
};

const VIDEO_LIST: VideoItem[] = [
  {
    no: 1,
    title: "1 안면근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/1+%EC%95%88%EB%A9%B4%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    no: 2,
    title: "2 흉쇄유돌근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/2+%ED%9D%89%EC%87%84%EC%9C%A0%EB%8F%8C%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    no: 3,
    title: "3 교근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/3+%EA%B5%90%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    no: 4,
    title: "4 측두근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/4+%EC%B8%A1%EB%91%90%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
  {
    no: 5,
    title: "5 내익상근 최종",
    type: "s3",
    url: "https://mpsbuckets.s3.ap-northeast-2.amazonaws.com/5+%EB%82%B4%EC%9D%B5%EC%83%81%EA%B7%BC+%EC%B5%9C%EC%A2%85.mp4",
  },
];

export default function IndexPage() {
  const [current, setCurrent] = useState<VideoItem | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 선택 시 자동재생 보조 (브라우저 정책 때문에 실패하면 무시)
  useEffect(() => {
    if (videoRef.current) {
      const v = videoRef.current;
      // 새 소스로 교체될 때 완전 리로드를 유도
      v.load();
      const tryPlay = async () => {
        try {
          await v.play();
        } catch {
          // 자동재생이 막히면 사용자 조작으로 재생되게 둠
        }
      };
      tryPlay();
    }
  }, [current?.url]);

  const headerTitle = useMemo(() => "강의 목록", []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {headerTitle}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            번호/제목 확인 후 ▶ 재생 버튼을 눌러 주세요.
          </p>
        </div>

        {/* 리스트 (카드형 게시글 스타일) */}
        <div className="space-y-3">
          {VIDEO_LIST.map((item) => {
            const isActive = current?.no === item.no;
            return (
              <div
                key={item.no}
                className={[
                  "flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm transition",
                  isActive
                    ? "border-indigo-300 ring-2 ring-indigo-100"
                    : "border-neutral-200 hover:shadow-md",
                ].join(" ")}
              >
                {/* 번호 + 제목 */}
                <div className="flex items-center gap-4">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-100 text-neutral-700",
                    ].join(" ")}
                    aria-label={`강의 ${item.no}번`}
                  >
                    {String(item.no).padStart(2, "0")}
                  </div>
                  <div className="text-base font-medium text-neutral-900">
                    {item.title}
                  </div>
                </div>

                {/* 재생 버튼 */}
                <button
                  onClick={() => setCurrent(item)}
                  className={[
                    "group inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400",
                  ].join(" ")}
                >
                  {/* Play 아이콘 (SVG) */}
                  <svg
                    className={[
                      "h-4 w-4 transition",
                      isActive
                        ? "fill-white"
                        : "fill-neutral-700 group-hover:fill-neutral-900",
                    ].join(" ")}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  재생
                </button>
              </div>
            );
          })}
        </div>

        {/* 고정 플레이어 영역 (항상 리스트 “아래”) */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-800">
              {current ? `${current.no}. ${current.title}` : "재생할 강의를 선택하세요"}
            </div>
            {current && (
              <span className="text-xs text-neutral-500">
                원본: {current.type.toUpperCase()}
              </span>
            )}
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            {current ? (
              <video
                key={current.url} // URL 변경 시 완전 리렌더
                ref={videoRef}
                src={current.url}
                controls
                autoPlay
                className="h-full w-full"
                // 모바일에서 전체화면 진입 허용
                playsInline
              />
            ) : (
              // 플레이어 자리 유지용 스켈레톤
              <div className="flex h-full w-full items-center justify-center">
                <div className="animate-pulse text-sm text-neutral-400">
                  선택한 강의가 여기에서 재생됩니다
                </div>
              </div>
            )}
          </div>

          {/* 간단 가이드 */}
          <p className="mt-3 text-xs text-neutral-500">
            자동재생이 차단될 수 있습니다. 이 경우 플레이 버튼을 한 번 눌러 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
