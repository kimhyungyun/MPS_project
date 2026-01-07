// app/policy/email/page.tsx

import EmailRejectContent from "@/app/components/policy/EmailRejectContent";



export default function EmailRejectPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <EmailRejectContent />
      </div>
    </main>
  );
}
