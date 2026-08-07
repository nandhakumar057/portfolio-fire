import Reveal from './Reveal';

/**
 * Consistent section header: small eyebrow, gradient title, subtitle.
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment =
    align === 'left' ? 'items-start text-left' : 'items-center text-center';
  return (
    <Reveal className={`mb-12 flex flex-col gap-3 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-accent">
          <span className="h-px w-6 bg-current" />
          {eyebrow}
          <span className="h-px w-6 bg-current" />
        </span>
      )}
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="max-w-2xl text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </Reveal>
  );
}
