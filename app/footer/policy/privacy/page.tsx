// app/policy/privacy/page.tsx

import PrivacyPolicyContent from "@/app/components/policy/PrivacyPolicyContent";




export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <PrivacyPolicyContent />
      </div>
    </main>
  );
}
