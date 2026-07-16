import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

export const SortableWidget = ({ id, children, isEditMode, onHide }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative group h-full",
        isDragging && "opacity-50 scale-[0.98] blur-[1px]"
      )}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-3 -right-3 z-20 flex items-center gap-1 bg-slate-900/90 dark:bg-slate-100/90 backdrop-blur-md rounded-xl p-1 shadow-xl shadow-slate-900/20 border border-slate-700/50"
        >
          <button 
            {...attributes} 
            {...listeners}
            className="p-1.5 hover:bg-white/20 dark:hover:bg-black/10 rounded-lg text-white dark:text-slate-900 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripHorizontal className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/20 dark:bg-black/10"></div>
          <button 
            onClick={() => onHide(id)}
            className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 dark:hover:text-rose-600 rounded-lg text-white dark:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Widget Content */}
      <div className={cn(
        "h-full w-full transition-all duration-300",
        isEditMode && "ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 ring-offset-4 ring-offset-slate-50 dark:ring-offset-slate-950 rounded-3xl scale-[0.98]"
      )}>
        {children}
      </div>
    </div>
  );
};
