import { motion } from 'framer-motion';

/** Full-page loading spinner (used as Suspense fallback). */
export default function Loader() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="relative h-14 w-14">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border-2 border-accent/30 border-b-accent"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.3, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
