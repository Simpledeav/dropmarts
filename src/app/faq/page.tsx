"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const faqData = [
  {
    category: "General",
    questions: [
      { q: "What is Dropmart?", a: "Dropmart is Nigeria's all-in-one marketplace connecting buyers, vendors, and riders. We provide a trusted platform for shopping, selling, and delivery services." },
      { q: "Is Dropmart free to use?", a: "Creating an account and browsing products is completely free. Vendors and riders can join for free, with competitive commission rates on successful sales." },
      { q: "How do I get started?", a: "Simply create an account, choose your role (buyer, vendor, or rider), and start exploring. Buyers can shop immediately, vendors can set up their store, and riders can start accepting deliveries." },
    ],
  },
  {
    category: "Buying",
    questions: [
      { q: "How do I place an order?", a: "Browse products, add items to your cart, proceed to checkout, and choose your delivery method. You can pay securely via our integrated payment providers." },
      { q: "Can I track my order?", a: "Yes! Once your order is placed and a rider picks it up, you can track the delivery in real-time through your order dashboard." },
      { q: "What payment methods are accepted?", a: "We accept various payment methods including bank transfers, cards, and mobile money through our secure payment partners." },
      { q: "What is OpenBox locker pickup?", a: "OpenBox is our convenient locker pickup service. You can have your orders delivered to a secure locker location near you and pick them up at your convenience." },
    ],
  },
  {
    category: "Selling",
    questions: [
      { q: "How do I become a vendor?", a: "Sign up for a vendor account, complete your business profile, and get approved. Once approved, you can start listing products immediately." },
      { q: "Are there any selling fees?", a: "Creating your store and listing products is free. We charge a competitive commission only on successful sales." },
      { q: "How do I manage my inventory?", a: "Use our vendor dashboard to add, edit, and manage your products. You can also use bulk import tools to add multiple products at once." },
      { q: "When do I get paid?", a: "Payouts are processed regularly for completed orders. You can track your earnings and payout history in the vendor dashboard." },
    ],
  },
  {
    category: "Riding",
    questions: [
      { q: "How do I become a rider?", a: "Sign up for a rider account, provide your details and vehicle information, and get approved. Once approved, you can start accepting delivery requests." },
      { q: "How much can I earn?", a: "Earnings depend on the number and distance of deliveries you complete. You keep a significant portion of each delivery fee." },
      { q: "Can I set my own schedule?", a: "Yes! Riders have full flexibility to go online/offline and accept deliveries when it suits their schedule." },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (categoryIdx: number, questionIdx: number) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaq = faqData
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-300 mb-8">
            Everything you need to know about Dropmart
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white/20 transition-all"
            />
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {filteredFaq.map((cat, catIdx) => (
          <div key={cat.category} className="mb-10">
            <h2 className="text-xl font-bold text-text-primary mb-4">{cat.category}</h2>
            <div className="space-y-2">
              {cat.questions.map((item, qIdx) => {
                const key = `${catIdx}-${qIdx}`;
                const isOpen = openItems[key];
                return (
                  <div
                    key={qIdx}
                    className="bg-white border border-border-light rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleItem(catIdx, qIdx)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-text-primary text-sm">{item.q}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-text-muted transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-text-secondary">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
