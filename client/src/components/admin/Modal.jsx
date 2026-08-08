import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Accessible modal wrapper with animated backdrop. */
export default function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-2xl border border-edge bg-card p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] ${
              wide ? 'max-w-2xl' : 'max-w-lg'
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
