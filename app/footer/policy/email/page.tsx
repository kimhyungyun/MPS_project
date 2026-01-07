// app/policy/email/page.tsx

import EmailRejectContent from "../EmailRejectContent";


export default function EmailRejectPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        이메일 무단수집거부
      </h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <EmailRejectContent />
      </div>
    </main>
  );
}
