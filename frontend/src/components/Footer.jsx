import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '../config/company';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const link = 'hover:text-slate-200 transition-colors whitespace-nowrap';

  return (
    <footer className="bg-slate-900 text-slate-400 py-4 px-4 sm:px-6 mt-auto print:hidden">
      <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center shrink-0">
            <span className="text-white font-black text-[8px]">BE</span>
          </div>
          <span className="text-slate-300 font-semibold whitespace-nowrap">Bill Easy</span>
          <span className="whitespace-nowrap">© {currentYear} {COMPANY.brand} · {COMPANY.legalName}</span>
        </div>

        <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/privacy" className={link}>Privacy</Link>
          <Link to="/terms" className={link}>Terms</Link>
          <Link to="/delete-account" className={link}>Delete account</Link>
          <Link to="/contact" className={link}>Contact</Link>
          <span className="whitespace-nowrap">Powered by <span className="text-slate-300 font-semibold">{COMPANY.brand}</span></span>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
