import { motion } from 'framer-motion';
import { skillIcons, fallbackSkillIcon } from '../lib/icons';

/** Skill card with an animated proficiency bar — premium black style. */
export default function SkillCard({ skill, index = 0 }) {
  const Icon = skillIcons[skill.icon] || fallbackSkillIcon;
  const level = Math.min(Math.max(skill.level || 0, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-lg hover:shadow-white/5"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="icon-chip">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h4 className="truncate font-display text-sm font-semibold">{skill.name}</h4>
          <p className="text-xs text-muted">{skill.category}</p>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-edge">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          className="h-full rounded-full bg-white"
        />
      </div>
    </motion.div>
  );
}
