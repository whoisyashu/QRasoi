import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-[420px]',
    md: 'max-w-[640px]',
    lg: 'max-w-[960px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay - rgba(17,24,39,0.50) from design system */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#111827]/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Container - 20px radius per design system */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={clsx(
              'relative w-full bg-white rounded-[20px] p-6 shadow-xl border border-[#E5E7EB] z-10 max-h-[90vh] overflow-y-auto',
              maxWidthClasses[maxWidth]
            )}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F3F4F6]">
              <div>
                {title && <h3 className="text-xl font-bold text-[#334155]">{title}</h3>}
                {description && <p className="text-sm text-[#6B7280] mt-0.5">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
