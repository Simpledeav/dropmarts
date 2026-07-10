import { BRAND } from "@/lib/constants";
import { Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-300">Last updated: July 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Shield, label: "Data Protection" },
            { icon: Eye, label: "Transparency" },
            { icon: Lock, label: "Secure Storage" },
            { icon: Database, label: "Data Control" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-4 border border-border-light text-center">
              <item.icon className="h-6 w-6 mx-auto text-brand-green mb-2" />
              <span className="text-xs font-medium text-text-primary">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Information We Collect</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              We collect information you provide when creating an account, making purchases,
              or communicating with us. This includes:
            </p>
            <ul className="list-disc pl-5 text-text-secondary space-y-1">
              <li>Name, email address, phone number</li>
              <li>Delivery addresses and preferences</li>
              <li>Payment information (processed securely by our payment partners)</li>
              <li>Communication history</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. How We Use Your Data</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              We use your data to:
            </p>
            <ul className="list-disc pl-5 text-text-secondary space-y-1">
              <li>Process and deliver your orders</li>
              <li>Improve our platform and services</li>
              <li>Send important updates and notifications</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Data Security</h2>
            <p className="text-text-secondary leading-relaxed">
              We implement industry-standard security measures to protect your data.
              This includes encryption, secure servers, and regular security audits.
              We never share your personal data with third parties for their marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Your Rights</h2>
            <p className="text-text-secondary leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time.
              You can manage your data through your account settings or contact us for assistance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Contact</h2>
            <p className="text-text-secondary leading-relaxed">
              For privacy-related inquiries, contact us at privacy@openbox.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
