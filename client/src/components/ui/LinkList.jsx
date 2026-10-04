import { ArrowUpRight } from 'lucide-react';
import { linkLabel } from '../../services/format';

/** Row of official external links (streaming/social). Renders nothing if none are configured. */
export default function LinkList({ links = [], className = '', size = 'md', variant = 'default' }) {
  if (!links?.length) return null;
  const poster = variant === 'poster';
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {links.map((l) => (
        <li key={`${l.platform}-${l.url}`}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              poster
                ? 'plink inline-flex items-center gap-1 font-poster text-2xl font-extrabold uppercase'
                : `link-u inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-bone ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`
            }
          >
            {linkLabel(l)} <ArrowUpRight size={poster ? 18 : 13} aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
