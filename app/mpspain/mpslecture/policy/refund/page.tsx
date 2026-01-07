import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-32 max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">환불 및 이용 정책</h1>
          <p className="mt-2 text-sm text-slate-600">
            결제 전 반드시 확인해주세요.
          </p>
        </header>

        <section className="rounded-3xl border bg-white p-7 text-sm leading-relaxed text-slate-700">
          {/* 환불 정책 */}
          <h2 className="text-lg font-bold text-slate-900">환불 정책</h2>
          <p className="mt-2">
            본 온라인 강의는 디지털 콘텐츠의 특성상 결제 완료와 동시에 서비스 제공이
            개시되므로, 강의 시청 여부와 관계없이 결제 완료 후에는 환불이 불가능합니다.
          </p>
          <p className="mt-2">
            단, 회사의 귀책 사유로 인해 강의가 정상적으로 제공되지 않거나 중대한
            시스템 장애 등으로 이용이 불가능한 경우에는 관련 법령에 따라 환불이
            진행될 수 있습니다.
          </p>
          <p className="mt-2">
            이용 기간이 개시된 이후에는 잔여 기간에 대한 부분 환불, 일할 계산 환불,
            패키지 일부 환불은 불가능합니다.
          </p>

          {/* 서비스 제공 기간 */}
          <h2 className="mt-6 text-lg font-bold text-slate-900">
            서비스 제공 기간
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              패키지 1개 구매 시: 결제 다음날부터 60일간 제공
              <br />
              <span className="text-slate-500">
                (동영상 시청은 결제 당일부터 가능, 이용 기간 산정은 익일부터 60일 적용)
              </span>
            </li>
            <li>패키지 2개 구매 시: 각 패키지별 4개월 적용</li>
            <li>패키지 3개 구매 시: 각 패키지별 6개월 적용</li>
            <li>
              패키지 1개 구매 후 60일 이내 다른 패키지를 추가 구매하는 경우,
              모든 패키지에 최초 구매일 기준 120일이 적용됩니다.
            </li>
            <li>
              최초 구매 후 60일이 경과한 뒤 추가 구매하는 경우에는 위 연장 규칙이
              적용되지 않습니다.
            </li>
          </ul>

          {/* 이용 기기 및 계정 제한 */}
          <h2 className="mt-6 text-lg font-bold text-slate-900">
            이용 기기 및 계정 제한
          </h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>동영상 강의는 최대 2대의 기기에서만 이용 가능합니다.</li>
            <li>
              기기 변경(리셋)은 문의 시 1회에 한해 가능하며, 사유에 따라 제한되거나
              거절될 수 있습니다.
            </li>
            <li>
              강의 이용은 구매자 본인에 한하여 가능하며, 계정 공유, 양도, 제3자
              이용은 엄격히 금지됩니다.
            </li>
            <li>
              위반 사항이 확인될 경우 사전 통보 없이 이용이 제한 또는 중단될 수
              있으며, 이 경우 환불은 불가능합니다.
            </li>
          </ul>

          {/* 저작권 */}
          <h2 className="mt-6 text-lg font-bold text-slate-900">
            저작권 및 콘텐츠 보호
          </h2>
          <p className="mt-2">
            본 강의의 모든 콘텐츠(영상, 음성, 자료, 이미지 등)는 저작권법에 의해
            보호됩니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>강의 영상 및 자료의 녹화, 캡처, 복제</li>
            <li>파일 다운로드, 재배포, 공유</li>
            <li>SNS, 커뮤니티, 메신저, 웹사이트 등을 통한 유출</li>
            <li>유료·무료를 불문한 제3자 제공</li>
          </ul>
          <p className="mt-2 font-semibold text-red-600">
            위와 같은 행위가 확인될 경우 민·형사상 법적 조치(손해배상 청구, 저작권
            침해 신고 등)가 진행될 수 있으며, 이용 정지 및 환불은 불가능합니다.
          </p>

          {/* 오프라인 캠프 */}
          <h2 className="mt-6 text-lg font-bold text-slate-900">
            오프라인 캠프 연계 규정
          </h2>
          <p className="mt-2">
            동영상 강의 구매자는 MPS 전주 캠프 참가를 위한 정회원 등록 시, 동영상
            강의 구매 금액만큼 참가비에서 차감 적용됩니다.
          </p>
          <p className="mt-2">
            이 경우 캠프 참가 환불 시에도 이미 구매한 동영상 강의 금액은 환불되지
            않습니다.
          </p>

          {/* 정책 변경 */}
          <h2 className="mt-6 text-lg font-bold text-slate-900">정책 변경</h2>
          <p className="mt-2">
            본 환불 및 이용 정책은 운영상 필요에 따라 변경될 수 있으며, 변경 사항은
            사전 공지를 통해 안내됩니다.
          </p>
          <p className="mt-2">
            변경 이후 서비스를 계속 이용하는 경우, 변경된 정책에 동의한 것으로
            간주합니다.
          </p>

          {/* 버튼 */}
          <div className="mt-8">
            <Link
              href="/mpspain/mpslecture/packages"
              className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              패키지 리스트로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
