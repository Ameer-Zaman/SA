import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import LinkList from './ui/LinkList';
import { NAV } from './Navbar';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-line">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link to="/" aria-label="SA, home" className="display block text-[clamp(6rem,20vw,16rem)] leading-[0.8] text-bone">
            SA<span className="text-acid">.</span>
          </Link>
          {settings.tagline && <p className="label mt-6">{settings.tagline}</p>}
        </div>

        <nav className="md:col-span-2" aria-label="Footer">
          <p className="label mb-5">Index</p>
          <ul className="space-y-2">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="link-u text-sm text-bone">{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        {settings.streamingProfiles?.length > 0 && (
          <div className="md:col-span-2">
            <p className="label mb-5">Listen</p>
            <LinkList links={settings.streamingProfiles} size="sm" className="flex-col !gap-y-2" />
          </div>
        )}

        {settings.socialLinks?.length > 0 && (
          <div className="md:col-span-3">
            <p className="label mb-5">Follow</p>
            <LinkList links={settings.socialLinks} size="sm" className="flex-col !gap-y-2" />
          </div>
        )}
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label">© {year} SA. All rights reserved.</p>
        <p className="label">Kerala, India</p>
      </div>
    </footer>
  );
}
