import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import { COMPANY } from '../config/company';

/** Public page for app stores: how to delete a Bill Easy account and what is deleted. */
const DeleteAccountInfo = () => {
  const navigate = useNavigate();
  const Section = ({ title, children }) => (
    <section className="space-y-3"><h2 className="text-xl font-bold text-slate-900">{title}</h2>{children}</section>
  );
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full" aria-label="Back"><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Trash2 className="w-5 h-5 text-rose-600" />Delete your Bill Easy account</h1>
        </div>
      </div>
      <main className="flex-1 w-full max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed">
          <p>You can delete your Bill Easy account yourself at any time, in the app or on the website. Bill Easy is operated by {COMPANY.operator}.</p>
          <Section title="Delete it in the app">
            <ol className="list-decimal pl-6 space-y-1.5">
              <li><Link to="/login" className="text-blue-600 underline">Sign in</Link> and open <strong>Settings</strong>.</li>
              <li>Open <strong>Profile</strong> and scroll to <strong>Delete account</strong>.</li>
              <li>Select <strong>Delete my account</strong>, enter your password, type DELETE and confirm.</li>
            </ol>
          </Section>
          <Section title="What is deleted">
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Business owner:</strong> your login and every business you own are deleted at once and for good, with all their invoices, quotations, items and stock, customers, suppliers, purchases, payments, expenses, staff records, uploaded logos and signatures. Staff logins that belong only to those businesses are removed too.</li>
              <li><strong>Admin or staff member:</strong> your login is deleted. The business you work for keeps the records you entered.</li>
              <li>Records the law requires us to keep, such as our own invoices for your subscription payments, are kept only for the period the law sets.</li>
            </ul>
            <p>Deletion cannot be undone. Download any reports you need from Reports before you delete.</p>
          </Section>
          <Section title="Cannot sign in?">
            <p>
              Email <a href={`mailto:${COMPANY.email}`} className="text-blue-600 underline">{COMPANY.email}</a> from the email address registered on
              the account, with your business name. We confirm it is you and delete the account within 30 days.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeleteAccountInfo;
