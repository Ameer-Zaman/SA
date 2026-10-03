import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrolled, useLockBody, useEscape } from '../hooks/useUi';
import { useSettings } from '../context/SettingsContext';
import LinkList from './ui/LinkList';

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/music', label: 'Music' },
  { to: '/about', label: 'About' },
  { to: '/videos', label: 'Videos' },
  { to: '/contact', label: 'Contact' },
];

export function Wordmark({ className = '' }) {
  return (
    <span className={`display inline-flex items-end gap-1 text-3xl leading-none ${className}`}>
      SA<span className="mb-[3px] h-[3px] w-2 bg-acid" aria-hidden />
    </span>
  );
}

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useSettings();

  useEffect(() => setOpen(false), [pathname]);
  useLockBody(open);
  useEscape(() => setOpen(false), open);

  return (
    <>
      <a href="#main" className="sr-only z-[90] bg-acid px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled && !open ? 'border-b border-line bg-ink/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between sm:h-20" aria-label="Main">
          <Link to="/" aria-label="SA — home" className="relative z-[60]"><Wordmark /></Link>

          <ul className="hidden items-center gap-10 md:flex">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `group relative font-mono text-xs uppercase tracking-label transition-colors ${isActive ? 'text-bone' : 'text-mute hover:text-bone'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {n.label}
                      <span className={`absolute -bottom-2 left-0 h-px bg-acid transition-all duration-500 ease-cine ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="relative z-[60] -mr-2 p-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col bg-ink px-5 pb-10 pt-28 md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="flex flex-col gap-2">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) => `flex items-baseline gap-4 ${isActive ? 'text-acid' : 'text-bone'}`}
                  >
                    <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-[17vw] leading-[0.95]">{n.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto border-t border-line pt-6">
              <LinkList links={settings.socialLinks} size="sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
