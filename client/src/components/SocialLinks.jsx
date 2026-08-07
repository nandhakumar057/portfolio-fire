import { Github, Linkedin, Instagram, Mail } from 'lucide-react';

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  email: Mail,
};

/** Social links row. `socials` is the profile.socials object. */
export default function SocialLinks({ socials = {}, size = 18, className = '' }) {
  const links = Object.entries(ICONS)
    .map(([key, Icon]) => ({ key, Icon, href: socials[key] }))
    .filter((l) => l.href);

  if (!links.length) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map(({ key, Icon, href }) => (
        <a
          key={key}
          href={href}
          target={href.startsWith('mailto') ? undefined : '_blank'}
          rel="noreferrer"
          aria-label={key}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-edge bg-card text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:text-white hover:shadow-lg hover:shadow-white/5"
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
