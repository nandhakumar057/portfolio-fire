import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { achievementIcons, fallbackAchievementIcon } from '../lib/icons';

/** Achievement card with category chip. */
export default function AchievementCard({ achievement, index = 0 }) {
  const Icon = achievementIcons[achievement.icon] || fallbackAchievementIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -5 }}
      className="card group relative flex gap-5 p-6 transition-all duration-300 hover:border-white/40 hover:shadow-xl hover:shadow-white/5"
    >
      {/* Accent bar */}
      <span className="absolute left-0 top-6 h-12 w-1 rounded-r-full bg-white transition-all duration-300 group-hover:h-16" />

      <span className="icon-chip h-12 w-12">
        <Icon size={22} />
      </span>

      <div className="flex-1">
        <h3 className="font-display text-base font-semibold">{achievement.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{achievement.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          {achievement.date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {achievement.date}
            </span>
          )}
          {achievement.category && (
            <span className="chip">
              {achievement.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
