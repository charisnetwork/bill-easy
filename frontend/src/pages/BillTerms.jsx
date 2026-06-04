import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText, Scale, Zap, Ban, Globe, AlertTriangle, Gavel } from 'lucide-react';
import Footer from '../components/Footer';

const BillTerms = () => {
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
              <Scale className="w-5 h-5 text-blue-600" />
              Terms of Service
            </h1>
          </div>
          <span className="text-xs text-slate-500 font-medium">Effective Date: June 2026</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-10">

            {/* Agreement */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                Agreement to Terms
              </h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing or using <strong>Bill Easy</strong> (operated by <strong>Charis Network</strong>), you agree
                to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our
                services. These terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            {/* Subscription Plans */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                Subscription Plans & Billing
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Bill Easy offers the following subscription plans:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-slate-700">Plan</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Price</th>
                      <th className="text-left p-3 font-semibold text-slate-700">Key Limits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 text-slate-700 font-medium">Free Account</td>
                      <td className="p-3 text-slate-600">₹0 / Lifetime</td>
                      <td className="p-3 text-slate-600">50 invoices/month · 1 user · 1 business</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="p-3 text-slate-700 font-medium">Premium</td>
                      <td className="p-3 text-slate-600">₹499 + tax / 3 months</td>
                      <td className="p-3 text-slate-600">Unlimited invoices · 5 users · 2 businesses · E-way Bills</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-700 font-medium">Enterprise</td>
                      <td className="p-3 text-slate-600">₹699 + tax / 3 months</td>
                      <td className="p-3 text-slate-600">Unlimited invoices · 20 users · 3 businesses · All features</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li><strong>Cancellation:</strong> You may cancel your subscription at any time through Settings. No new billing cycle will begin.</li>
                  <li><strong>Refunds:</strong> Subscription fees are non-refundable except as required by applicable law or at our discretion for service outages exceeding 48 hours.</li>
                  <li><strong>Upgrades/Downgrades:</strong> Plan changes take effect at the start of the next billing cycle.</li>
                  <li><strong>Auto-downgrade:</strong> Expired paid plans automatically revert to Free Account without data loss.</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                User Responsibilities
              </h2>
              <p className="text-slate-600 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 text-sm">
                <li>Provide accurate business and GST information during registration.</li>
                <li>Not share your account credentials with unauthorised persons.</li>
                <li>Notify us immediately at{' '}
                  <a href="mailto:support@charisbilleasy.store" className="text-blue-600 underline">
                    support@charisbilleasy.store
                  </a>{' '}
                  if you suspect any unauthorised access.
                </li>
                <li>Use the platform only for lawful business activities in compliance with Indian law, including GST regulations.</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Ban className="w-4 h-4 text-blue-600" />
                </div>
                Prohibited Activities
              </h2>
              <p className="text-slate-600 leading-relaxed">
                You may not use Bill Easy to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 text-sm">
                <li>Generate fraudulent invoices or misrepresent GST amounts.</li>
                <li>Attempt to reverse-engineer, scrape, or overload our platform.</li>
                <li>Resell access to the platform without explicit written permission.</li>
                <li>Upload malicious files, scripts, or content.</li>
              </ul>
              <p className="text-slate-600 text-sm">
                We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                </div>
                Limitation of Liability
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Bill Easy is provided "as is" without warranty of any kind. To the maximum extent permitted by Indian law,
                Charis Network shall not be liable for any indirect, incidental, or consequential damages arising from
                your use of the service, including data loss. Our total liability is limited to the amount you paid in the
                3 months preceding the claim.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-blue-600" />
                </div>
                Governing Law & Disputes
              </h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms are governed by the laws of <strong>India</strong>. Any disputes arising out of or relating to
                these Terms or the use of Bill Easy shall be subject to the exclusive jurisdiction of the courts in
                <strong> Tamil Nadu, India</strong>.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Before filing any legal action, both parties agree to attempt resolution by email within 30 days. Contact:{' '}
                <a href="mailto:support@charisbilleasy.store" className="text-blue-600 underline">
                  support@charisbilleasy.store
                </a>
              </p>
            </section>

            {/* Footer */}
            <section className="pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 italic">
                Copyright © 2026 Charis Network. All rights reserved. · Bill Easy is a product of Charis Network.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillTerms;
