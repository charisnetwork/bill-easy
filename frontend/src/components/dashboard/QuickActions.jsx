import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Users, Package, ShoppingCart, Wallet, CreditCard, Truck } from 'lucide-react';

const ActionCard = ({ icon: Icon, label, path, description, color, index }) => {
  const bgColors = {
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-500/30",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-purple-500/30",
    cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:shadow-cyan-500/30",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-emerald-500/30",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-orange-500/30",
  };

  return (
    <Link to={path}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 + (index * 0.05), duration: 0.3 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 shadow-lg shadow-transparent ${bgColors[color]}`}>
          <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm text-center mb-1 group-hover:text-indigo-600 transition-colors">{label}</h4>
        <p className="text-[10px] text-slate-400 text-center font-medium px-2">{description}</p>
      </motion.div>
    </Link>
  );
};

export const QuickActions = () => {
  const actions = [
    { icon: FileText, label: 'Create Invoice', path: '/invoices/new', description: 'B2B/B2C GST Invoice', color: 'indigo' },
    { icon: Users, label: 'Add Customer', path: '/customers', description: 'Client directory', color: 'purple' },
    { icon: Package, label: 'Add Product', path: '/products', description: 'Inventory item', color: 'cyan' },
    { icon: ShoppingCart, label: 'Purchase Entry', path: '/purchases/new', description: 'Record a bill', color: 'emerald' },
    { icon: Wallet, label: 'Record Expense', path: '/expenses', description: 'Track outgoings', color: 'orange' },
    { icon: Truck, label: 'E-Way Bill', path: '/eway-bills/new', description: 'Generate document', color: 'indigo' },
  ];

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {actions.map((action, idx) => (
          <ActionCard key={action.label} {...action} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
