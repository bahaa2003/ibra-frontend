import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="premium-card-premium flex max-h-[90vh] w-full max-w-lg pointer-events-auto flex-col"
            >
              <div className="flex items-center justify-between border-b border-[color:rgb(var(--color-border-rgb)/0.9)] p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {title}
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {children}
              </div>

              {footer && (
                <div className="rounded-b-[var(--radius-2xl)] border-t border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-elevated-rgb)/0.72)] p-6">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
