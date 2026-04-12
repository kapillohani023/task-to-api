import { T2ACard } from "@/components/ui/T2ACard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 py-10 px-4">
      <T2ACard variant="default" padding="lg" className="w-full max-w-2xl">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Terms of Service
        </h1>

        <p className="text-sm text-zinc-500 mb-6">Last updated: April 12, 2026</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">1. Acceptance of Terms</h2>
            <p className="text-base text-black leading-relaxed">
              By accessing or using T2A (Task to API), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">2. Description of Service</h2>
            <p className="text-base text-black leading-relaxed">
              T2A allows users to create AI-powered API agents by defining tasks, input/output
              schemas, and configuration. These agents are accessible via generated API endpoints
              authenticated with bearer tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">3. User Accounts</h2>
            <p className="text-base text-black leading-relaxed">
              You must sign in with a valid Google account. You are responsible for all activity
              under your account and for keeping your API keys and agent tokens secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">4. API Keys</h2>
            <p className="text-base text-black leading-relaxed">
              T2A requires you to provide your own Gemini API key. You are solely responsible for
              any charges incurred through the use of your API key. T2A stores your key securely
              but does not assume liability for unauthorized usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">5. Acceptable Use</h2>
            <p className="text-base text-black leading-relaxed">You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-base text-black">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to other users&apos; agents or data</li>
              <li>Abuse or overload the service infrastructure</li>
              <li>Generate content that violates third-party rights or applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">6. Intellectual Property</h2>
            <p className="text-base text-black leading-relaxed">
              You retain ownership of the tasks, schemas, and configurations you create. T2A
              retains ownership of the platform, its code, and its design.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">7. Limitation of Liability</h2>
            <p className="text-base text-black leading-relaxed">
              T2A is provided &quot;as is&quot; without warranties of any kind. We are not liable
              for any damages arising from your use of the service, including but not limited to
              costs incurred through third-party API usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">8. Termination</h2>
            <p className="text-base text-black leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation
              of these terms. You may delete your account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-black mb-2">9. Changes to Terms</h2>
            <p className="text-base text-black leading-relaxed">
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </T2ACard>
    </div>
  );
}
