import { motion } from 'framer-motion';
import { ExternalLink, Calendar } from 'lucide-react';
import { certIcons, fallbackCertIcon } from '../lib/icons';

/** Certification card with issuer, date and credential link. */
export default function CertificationCard({ cert, index = 0 }) {
  const Icon = certIcons[cert.icon] || fallbackCertIcon;
  const Wrapper = cert.credentialurl ? 'a' : 'div';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
      whileHover={{ y: -5 }}
      className="card group relative flex flex-col gap-4 p-6 transition-all duration-300 hover:border-white/40 hover:shadow-xl hover:shadow-white/5"
    >
      <Wrapper
        {...(cert.credentialurl ? { href: cert.credentialurl, target: '_blank', rel: 'noreferrer' } : {})}
        className="icon-chip h-14 w-14 rounded-2xl"
      >
        <Icon size={26} />
      </Wrapper>

      <div className="flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug">{cert.title}</h3>
          {cert.credentialurl && (
            <ExternalLink size={15} className="mt-1 shrink-0 text-muted transition-colors group-hover:text-white" />
          )}
        </div>
        <p className="text-sm text-muted">{cert.issuer}</p>
      </div>

      <div className="flex items-center justify-between border-t border-edge pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {cert.date || '—'}
        </span>
        {cert.category && (
          <span className="rounded-full border border-edge bg-[#222222] px-2.5 py-0.5 font-medium text-accent">
            {cert.category}
          </span>
        )}
      </div>
    </motion.div>
  );
}
