"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We&apos;d love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { icon: Mail, label: "Email", value: "hello@openbox.com", desc: "We respond within 24 hours" },
            { icon: Phone, label: "Phone", value: "+234 800 123 4567", desc: "Mon-Fri, 8AM-6PM" },
            { icon: MapPin, label: "Office", value: "Lagos, Nigeria", desc: "Visit us by appointment" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-6 border border-border-light text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{item.label}</h3>
              <p className="text-sm font-medium text-brand-green mb-1">{item.value}</p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border-light p-6 md:p-8 max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-brand-green" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Message Sent!</h2>
              <p className="text-text-secondary">Thank you for reaching out. We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input id="name" label="Full Name" type="text" placeholder="Your name" required />
                  <Input id="email" label="Email" type="email" placeholder="you@example.com" required />
                </div>
                <Input id="subject" label="Subject" type="text" placeholder="How can we help?" required />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more..."
                    className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" icon={<Send className="h-4 w-4" />}>
                  Send Message
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
