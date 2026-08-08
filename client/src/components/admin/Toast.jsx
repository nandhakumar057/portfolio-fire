import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/** Lightweight toast used across the admin dashboard — monochrome. */
export default function Toast({ toast, onClose }) {
  const success = toast?.type !== 'error';

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          className={`fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-medium shadow-2xl ${
            success ? 'bg-white text-black' : 'alert'
          }`}
          onClick={onClose}
        >
          {success ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
