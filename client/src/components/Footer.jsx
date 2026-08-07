import { Link } from 'react-router-dom';
import { Mail, MapPin, Code2 } from 'lucide-react';
import SocialLinks from './SocialLinks';
import { defaultData } from '../data/defaultData';

export default function Footer() {
  const profile = defaultData.profile;

  const quickLinks = [
    { to: '/about', label: 'About' },
    { to: '/projects', label: 'Projects' },
    { to: '/blog', label: 'Blog' },
    { to: '/skills', label: 'Skills' },
    { to: '/certifications', label: 'Certifications' },
    { to: '/resume', label: 'Resume' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="border-t border-edge bg-surface/60 backdrop-blur">
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Code2 size={18} />
            </span>
            Nandha<span className="text-muted">.dev</span>
          </Link>
          <p className="max-w-xs text-sm text-muted">{profile.about}</p>
          <SocialLinks socials={profile.socials} />
        </div>

        {/* Quick links */}
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">
            Get in Touch
          </h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="text-white" />
              <a href={profile.socials.email} className="hover:text-white">
                {profile.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="text-white" />
              {profile.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-edge py-5">
        <p className="container-px flex flex-col items-center justify-between gap-2 text-center text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Nandhakumar Thirunavukkarasu. All rights reserved.</span>
          <span>Built with React and Tailwind CSS</span>
        </p>
      </div>
    </footer>
  );
}
