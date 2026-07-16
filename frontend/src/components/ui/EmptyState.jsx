import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

export const EmptyState = ({ 
  icon: Icon = FilePlus, 
  title = "No data available", 
  description = "Get started by creating your first record.",
  primaryAction,
  secondaryAction
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl scale-150"></div>
        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center relative z-10 mx-auto mb-6">
          <Icon className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
        </div>
      </motion.div>

      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed"
      >
        {description}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        {primaryAction && (
          <Button 
            onClick={() => navigate(primaryAction.route)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-600/20 px-6 font-bold"
          >
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            variant="outline" 
            onClick={() => navigate(secondaryAction.route)}
            className="rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 px-6 font-bold"
          >
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>
    </div>
  );
};
