// app/footer/policy/email/page.tsx
export default function EmailRejectPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto mt-32 max-w-4xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">이메일 무단수집거부</h1>
          <p className="mt-2 text-sm text-slate-600">
            본 사이트는 이메일 주소의 무단 수집을 거부합니다.
          </p>
        </header>

        <section className="rounded-3xl border bg-white p-7 text-sm leading-relaxed text-slate-700">
          <p>
            본 사이트에 게시된 이메일 주소가 전자우편 수집프로그램이나 그 밖의 기술적 장치를
            이용하여 무단으로 수집되는 것을 거부하며, 이를 위반시 정보통신망법에 의해 형사처벌 됨을
            유념하시기 바랍니다.
          </p>

          <h2 className="mt-6 text-lg font-bold text-slate-900">
            정보통신망법 제 50조의 2(전자우편주소의 무단 수집행위 등 금지)
          </h2>

          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              누구든지 전자우편주소의 수집을 거부하는 의사가 명시된 인터넷 홈페이지에서 자동으로
              전자우편주소를 수집하는 프로그램 그 밖의 기술적 장치를 이용하여 전자우편주소를 수집하여서는
              아니된다.
            </li>
            <li>
              누구든지 제1항의 규정을 위반하여 수집된 전자우편주소를 판매, 유통하여서는 아니된다.
            </li>
            <li>
              누구든지 제1항 및 제2항의 규정에 의하여 수집, 판매 및 유통이 금지된 전자우편주소임 을 알고
              이를 정보전송에 이용하여서는 아니된다.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}
