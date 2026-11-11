import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COMPANY } from '../config/company';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-400 py-4 px-6 mt-auto print:hidden">
      <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium">
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center">
            <span className="text-white font-black text-[8px]">BE</span>
          </div>
          <span className="text-slate-300 font-semibold">Bill Easy</span>
          <span className="text-slate-600">|</span>
          <span>© {currentYear} {COMPANY.brand} · {COMPANY.legalName}</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-200 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-200 transition-colors">Terms</Link>
          <Link to="/delete-account" className="hover:text-slate-200 transition-colors">Delete account</Link>
          <Link to="/contact" className="hover:text-slate-200 transition-colors">Contact</Link>
          <span className="text-slate-700">|</span>
          <span>Powered by <span className="text-slate-300 font-semibold">{COMPANY.brand}</span></span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
