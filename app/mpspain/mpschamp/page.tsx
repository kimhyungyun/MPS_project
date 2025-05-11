import Image from "next/image";

const mpschamp = () => {
    return (<section className="w-full px-4 lg:px-24 py-12 bg-gray-100">
        {/* 상단 타이틀 이미지 */}
        <div className="w-full flex border-b border-gray-300 pb-6 mb-8 mt-30">
          <Image
            src="/next.svg"
            alt="Recruit"
            width={220}
            height={60}
          />
        </div>
      
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {[
            {
              label: "공지",
              title: "2025년 MPS 정회원 가입신청 안내",
              desc: "MPS연구회에서 정회원을 모집합니다.",
              date: "2025.04.21",
            },
            {
              label: "공지",
              title: "2025년 MPS 캠프 안내",
              desc: "MPS 캠프 안내사항.",
              date: "2025.04.20",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between border-b pb-4 hover:bg-gray-50 transition p-2 rounded-md"
            >
              {/* 왼쪽: NEW 아이콘 및 본문 */}
              <div className="flex items-start gap-4">
                <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full h-fit mt-1">
                  {item.label}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
      
              {/* 오른쪽: 날짜 */}
              <span className="text-sm text-gray-400 whitespace-nowrap">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </section>
      
    )}
 
export default mpschamp;