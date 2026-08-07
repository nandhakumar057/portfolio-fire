import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

function navClass({ isActive }) {
  return `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive ? 'text-white' : 'text-muted hover:text-white'
  }`;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-edge bg-black/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-px flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition-transform duration-300 group-hover:rotate-6">
            <Code2 size={18} />
          </span>
          <span>
            Nandha<span className="text-muted">.dev</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={isAdmin ? '/admin' : '/admin/login'}
            title="Admin"
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-edge text-muted transition-colors hover:border-white hover:text-white sm:flex"
          >
            <LayoutDashboard size={17} />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge text-accent lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-edge bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-px flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-white text-black' : 'text-accent'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <NavLink
                to={isAdmin ? '/admin' : '/admin/login'}
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-accent"
              >
                <LayoutDashboard size={16} /> Admin
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
