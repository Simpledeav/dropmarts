import { BRAND } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-300">Last updated: July 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose prose-gray max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p className="text-text-secondary leading-relaxed">
              By accessing or using {BRAND.name}, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. Platform Description</h2>
            <p className="text-text-secondary leading-relaxed">
              {BRAND.name} is a multi-vendor marketplace that connects buyers, vendors, and riders.
              We provide the platform and infrastructure but are not directly a party to transactions
              between buyers and sellers unless otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. User Accounts</h2>
            <p className="text-text-secondary leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities under your account. You must provide accurate information
              and keep it updated.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Vendor Responsibilities</h2>
            <p className="text-text-secondary leading-relaxed">
              Vendors agree to list accurate product information, maintain adequate stock levels,
              fulfill orders in a timely manner, and adhere to our quality standards.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Rider Responsibilities</h2>
            <p className="text-text-secondary leading-relaxed">
              Riders agree to provide reliable delivery services, handle packages with care,
              and maintain professional conduct while representing {BRAND.name}.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">6. Payment Terms</h2>
            <p className="text-text-secondary leading-relaxed">
              All transactions are processed securely through our payment partners. Vendors
              receive payouts according to the agreed schedule. Fees and commissions are
              clearly displayed before confirmation.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">7. Limitation of Liability</h2>
            <p className="text-text-secondary leading-relaxed">
              {BRAND.name} shall not be liable for any indirect, incidental, or consequential
              damages arising from the use of our platform. Our total liability is limited to
              the amount paid for the specific transaction giving rise to the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">8. Contact</h2>
            <p className="text-text-secondary leading-relaxed">
              For questions about these terms, please contact us at legal@dropmart.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
