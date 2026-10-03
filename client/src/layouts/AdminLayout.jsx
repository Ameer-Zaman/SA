import { NavLink, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Music2, Film, UserRound, Settings, Inbox, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Wordmark } from '../components/Navbar';
import Seo from '../components/ui/Seo';
import { Loader } from '../components/ui/Primitives';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/music', label: 'Music', icon: Music2 },
  { to: '/admin/videos', label: 'Videos', icon: Film },
  { to: '/admin/biography', label: 'Biography', icon: UserRound },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
];

/** Admin shell. Redirects to /admin/login when there is no session. */
export default function AdminLayout() {
  const { admin, checking, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (checking) return <div className="container-x pt-24"><Loader label="Checking session" /></div>;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 border-l-2 px-4 py-3 font-mono text-xs uppercase tracking-label transition-colors ${
              isActive ? 'border-acid bg-ink-2 text-bone' : 'border-transparent text-mute hover:bg-ink-2 hover:text-bone'
            }`
          }
        >
          <Icon size={16} aria-hidden /> {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <Seo title="Admin" noindex />
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink/95 px-5 py-4 backdrop-blur lg:hidden">
        <Link to="/admin"><Wordmark className="!text-2xl" /></Link>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Toggle admin menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <div className="border-b border-line bg-ink px-2 py-3 lg:hidden">{nav}</div>}

      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-3 py-8 lg:flex">
        <Link to="/admin" className="mb-10 flex items-center gap-3 px-4">
          <Wordmark />
          <span className="label">Admin</span>
        </Link>
        {nav}
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-label text-mute hover:text-bone">
            <ExternalLink size={16} aria-hidden /> View site
          </a>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-label text-mute hover:text-bone">
            <LogOut size={16} aria-hidden /> Log out
          </button>
          <p className="truncate px-4 pt-2 text-xs text-mute/70">{admin.email}</p>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
        <Outlet />
        <div className="mt-16 flex gap-4 border-t border-line pt-6 lg:hidden">
          <a href="/" className="label hover:text-bone">View site</a>
          <button type="button" onClick={logout} className="label hover:text-bone">Log out</button>
        </div>
      </main>
    </div>
  );
}
