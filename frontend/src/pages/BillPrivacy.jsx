import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Bell, UserCheck, Cookie, Database, Globe } from 'lucide-react';
import Footer from '../components/Footer';

const BillPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Privacy Policy
            </h1>
          </div>
          <span className="text-xs text-slate-500 font-medium">Last Updated: June 2026</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                Introduction
              </h2>
              <p className="text-slate-600 leading-relaxed">
                At <strong>Bill Easy</strong> (operated by <strong>Charis Network</strong>), we take your privacy seriously.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                SaaS billing and inventory management platform. By using our service, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                Information We Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Personal Data</h3>
                  <p className="text-sm text-slate-600">Name, email address, mobile number, and business details provided during registration and account setup.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Business Data</h3>
                  <p className="text-sm text-slate-600">Inventory records, customer lists, supplier information, invoice history, and transaction data you create on our platform.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Usage Data</h3>
                  <p className="text-sm text-slate-600">IP address, browser type, pages visited, features used, and access timestamps for security and product improvement.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Payment Data</h3>
                  <p className="text-sm text-slate-600">Subscription payment information is processed by <strong>Razorpay</strong>. We do not store your card or UPI credentials on our servers.</p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                Data Security
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We implement industry-standard security measures to protect your information. Your data is encrypted in
                transit (TLS/HTTPS) and at rest. Access to personal data is restricted to authorised personnel only.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 text-sm">
                <li>Passwords are hashed using bcrypt (cost factor 12) — we cannot read your password.</li>
                <li>JWT authentication with token versioning and single-use refresh tokens.</li>
                <li>Brute-force protection and login attempt monitoring.</li>
                <li>Security events (failed logins, suspicious activity) are logged and audited.</li>
                <li>Continuous monitoring on Railway infrastructure with automatic failover.</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Cookie className="w-4 h-4 text-blue-600" />
                </div>
                Cookies & Analytics
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We use a small number of cookies essential to the operation of the service (e.g., a secure HttpOnly
                refresh token cookie for keeping you logged in). We do not use advertising cookies or sell your data.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We use <strong>Google Analytics 4</strong> (anonymous, aggregated) to understand how users interact with our
                platform so we can improve it. You can opt out via your browser's Do Not Track setting or a browser extension.
              </p>
            </section>

            {/* Third-party Services */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                Third-Party Services
              </h2>
              <div className="space-y-3">
                {[
                  { name: 'Razorpay', purpose: 'Payment processing for subscriptions. Their privacy policy applies to payment data.' },
                  { name: 'Cloudinary', purpose: 'Cloud storage for business logos and signatures uploaded to the platform.' },
                  { name: 'Brevo (Sendinblue)', purpose: 'Transactional email delivery (OTPs, password resets, invoices).' },
                  { name: 'Google Analytics 4', purpose: 'Anonymous usage analytics to improve the platform.' },
                  { name: 'Railway', purpose: 'Backend hosting and PostgreSQL database infrastructure.' }
                ].map((s) => (
                  <div key={s.name} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800 min-w-[120px] text-sm">{s.name}</span>
                    <span className="text-sm text-slate-600">{s.purpose}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                Data Retention
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We retain your business data for the duration of your active subscription plus 90 days after account
                closure, to allow data export. After this period, your data is permanently deleted from our servers.
                You can request immediate deletion by contacting us.
              </p>
            </section>

            {/* Your Rights */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                Your Rights
              </h2>
              <p className="text-slate-600 leading-relaxed">
                You have the right to access, correct, export, or delete your data at any time. You can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 text-sm">
                <li>Export all your business data as PDF or Excel through the Reports section.</li>
                <li>Update personal details from the Settings page.</li>
                <li>Request full account deletion by emailing us.</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500 italic">
                For any questions about this Privacy Policy, contact us at{' '}
                <a href="mailto:support@charisbilleasy.store" className="text-blue-600 underline">
                  support@charisbilleasy.store
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillPrivacy;
