import { motion } from 'framer-motion';

/**
 * Profile avatar. Renders `photo` when provided (hero/profile image),
 * otherwise initials on a monochrome disc. Used in the hero and about sections.
 */
export default function Avatar({ name, photo = '', size = 260, className = '' }) {
  const initials = (name || 'NT')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Rotating dashed ring */}
      <div className="absolute -inset-3 animate-spin-slow rounded-full border-2 border-dashed border-white/20" />
      {/* Pulsing glow ring */}
      <div className="absolute -inset-6 animate-pulse-ring rounded-full bg-white/5" />

      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center overflow-hidden rounded-full border border-edge bg-section shadow-2xl shadow-black"
      >
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <>
            {/* Decorative inner circles */}
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute right-6 top-8 h-3 w-3 rounded-full bg-white/20" />
            <div className="absolute bottom-12 left-10 h-2 w-2 rounded-full bg-white/25" />

            <span className="font-display text-6xl font-extrabold tracking-tight text-white">
              {initials}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}
