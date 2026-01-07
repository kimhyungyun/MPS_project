// app/footer/policy/privacy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-32 max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">개인정보 처리방침</h1>
          <p className="mt-2 text-sm text-slate-600">
            경근근막엠피에스(MPS연구회)는 이용자의 개인정보보호를 중요시합니다.
          </p>
        </header>

        <section className="rounded-3xl border bg-white p-7 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-bold text-slate-900">1. 총칙</h2>
          <p className="mt-2">
            "경근근막엠피에스(MPS연구회)"는 이용자들의 개인정보보호를 매우 중요시하며,
            이용자가 회사의 서비스를 이용함과 동시에 온라인상에서 회사에 제공한 개인정보가
            보호 받을 수 있도록 최선을 다하고 있습니다. 이에 "경근근막엠피에스(MPS연구회)"는
            통신비밀보호법, 전기통신사업법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등
            정보통신서비스제공자가 준수하여야 할 관련 법규상의 개인정보보호 규정 및 정보통신부가
            제정한 개인정보보호지침을 준수하고 있습니다. "경근근막엠피에스(MPS연구회)"는 개인정보
            취급방침을 통하여 이용자들이 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며
            개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려 드립니다.
          </p>
          <p className="mt-2">
            "경근근막엠피에스(MPS연구회)"의 개인정보 취급방침은 정부의 법률 및 지침 변경이나
            내부 방침 변경 등으로 인하여 수시로 변경될 수 있고, 이에 따른 지속적인 개선을 위하여
            필요한 절차를 정하고 있습니다. 개인정보 취급방침을 개정하는 경우 쇼핑몰의 첫 페이지의
            개인정보취급방침을 통해 고지하고 있습니다. 이용자들께서는 사이트 방문 시 수시로 확인하시기 바랍니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">2. 개인정보 수집에 대한 동의</h2>
          <p className="mt-2">
            "경근근막엠피에스(MPS연구회)"는 개인정보보호방침 또는 이용약관의 내용에 대해
            「동의합니다」버튼 또는 「동의하지 않습니다」버튼을 클릭할 수 있는 절차를 마련하여,
            「동의합니다」버튼을 클릭하면 개인정보 수집에 대해 동의한 것으로 봅니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">3. 개인정보의 수집목적 및 이용목적</h2>
          <p className="mt-2">
            "개인정보"라 함은 생존하는 개인에 관한 정보로서 성명, 휴대폰번호 등의 사항에 의하여
            개인을 식별할 수 있는 정보(다른 정보와 쉽게 결합하여 식별할 수 있는 것을 포함)를 말합니다.
            "경근근막엠피에스(MPS연구회)"는 회원서비스 제공을 위해 다음과 같은 목적으로 정보를 수집·이용합니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>이름, 아이디, 비밀번호, 성별, 학교, 생년월일 : 본인 확인</li>
            <li>이메일, 휴대폰번호 : 고지사항 전달, 불만처리, 이벤트 안내</li>
            <li>기타 선택항목(우편번호, 주소) : 개인맞춤 서비스 제공</li>
            <li>IP Address : 부정 이용 방지 및 비인가 사용 방지</li>
          </ul>
          <p className="mt-2">
            위 수집 정보를 이용하여 계약이행 및 요금정산, 회원관리, 마케팅 및 광고에 활용할 수 있습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">4. 수집하는 개인정보 항목 및 수집방법</h2>
          <p className="mt-2">
            회원가입 시 아이디, 비밀번호, 이름, 닉네임, 성별, 생년월일, 이메일, 주소, 핸드폰번호, 전화번호 등을
            온라인상에서 입력 받습니다. 설문조사나 이벤트 시 선별적으로 개인정보 입력을 요청할 수 있습니다.
            민감한 개인정보는 수집하지 않으며, 부득이한 경우 사전 동의를 구합니다.
            어떤 경우에도 사전에 밝힌 목적 이외로 사용하지 않으며, 사전 동의 없이 외부 공개/유출하지 않습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">
            5. 개인정보 자동수집 장치의 설치, 운영 및 그 거부에 관한 사항
          </h2>
          <p className="mt-2">
            맞춤서비스 제공을 위해 세션(session) 방식을 사용합니다. 세션정보는 로그아웃 시 자동 삭제됩니다.
            로그인 필요 서비스의 경우 운영 서버에서 자동 생성됩니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">6. 수집한 개인정보 공유 및 제공</h2>
          <p className="mt-2">
            고지한 범위 내에서만 사용하며, 사전 동의 없이 초과 이용하거나 외부에 공개하지 않습니다.
            다만 아래 경우 예외가 있을 수 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>이용자가 사전에 공개에 동의한 경우</li>
            <li>계약 이행을 위해 통상적 동의가 곤란한 경우</li>
            <li>요금정산을 위해 필요한 경우</li>
            <li>법적 조치가 필요하다고 판단되는 충분한 근거가 있는 경우</li>
            <li>관계법령에 따른 적법한 절차의 요청이 있는 경우</li>
            <li>통계/학술연구/시장조사 등 특정 개인 식별 불가 형태로 제공하는 경우</li>
          </ul>

          <h2 className="mt-6 text-lg font-bold text-slate-900">7. 개인정보의 열람, 정정, 삭제</h2>
          <p className="mt-2">
            이용자는 언제라도 개인정보를 열람/수정할 수 있으며, 추가 정보는 열람/수정/삭제가 가능합니다.
            변경 및 삭제, 회원탈퇴는 고객센터에서 로그인 후 이용할 수 있습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">8. 개인정보의 보유기간 및 이용기간</h2>
          <p className="mt-2">
            서비스 제공을 위해 개인정보를 보유하며, 이용자 요청에 따라 삭제/수정/해지 시 재생 불가능한 방법으로 삭제됩니다.
            또한 관계법령에 따라 일정 기간 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>계약 또는 청약철회 등에 관한 기록 : 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
          </ul>

          <h2 className="mt-6 text-lg font-bold text-slate-900">9. 게시물 보호</h2>
          <p className="mt-2">
            게시물은 변조, 훼손, 삭제되지 않도록 보호하나, 스팸성 게시물/명예훼손/권리침해 등은 예외일 수 있습니다.
            게시물 관련 권리와 책임은 작성자에게 있으며, 자발적 공개 정보는 보호가 어려울 수 있습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">10. 수집한 개인정보의 위탁</h2>
          <p className="mt-2">
            서비스 향상을 위해 필요한 경우 법률상 요건을 구비하여 외부에 위탁할 수 있습니다.
            최소한의 정보에 한하며, 안전한 관리를 위해 계약상 필요한 사항을 규정합니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>위탁 대상자 : 토츠 페이먼츠</li>
            <li>위탁업무 내용 : 카드결제 대행</li>
          </ul>

          <h2 className="mt-6 text-lg font-bold text-slate-900">11. 이용자의 권리와 의무</h2>
          <p className="mt-2">
            이용자는 개인정보를 최신/정확하게 입력해야 하며, 허위정보 입력 또는 타인 정보 도용 시 회원자격이 상실될 수 있습니다.
            비밀번호를 포함한 개인정보 유출 방지에 유의해야 합니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">
            12. 개인정보 관련 의견수렴 및 불만처리
          </h2>
          <p className="mt-2">
            개인정보보호 관련 의견을 수렴하며, 불만 처리 절차를 마련하고 있습니다.
            하단의 개인정보관리 책임자/담당자 연락처로 신고할 수 있습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">13. 개인정보관리 책임자 및 담당자</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>소속 / 직위 : 개인정보관리책임자</li>
            <li>E-M A I L : pimang_235@naver,com</li>
            <li>전 화 번 호 : 010-7942-5854</li>
          </ul>

          <h2 className="mt-6 text-lg font-bold text-slate-900">15. 아동의 개인정보보호</h2>
          <p className="mt-2">
            만 14세 미만 어린이는 법정대리인의 동의가 없는 한 회원으로 가입할 수 없습니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">15. 고지의 의무</h2>
          <p className="mt-2">
            본 방침은 정책/기술 변경 등에 따라 변경될 수 있으며, 변경 시 공지사항을 통해 고지합니다.
          </p>

          <div className="mt-8 rounded-2xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              개인정보취급방침 시행일자: <span className="font-semibold">2026-01-01</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
