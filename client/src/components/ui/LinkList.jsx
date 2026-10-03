import { ArrowUpRight } from 'lucide-react';
import { linkLabel } from '../../services/format';

/** Row of official external links (streaming/social). Renders nothing if none are configured. */
export default function LinkList({ links = [], className = '', size = 'md' }) {
  if (!links?.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-3 ${className}`}>
      {links.map((l) => (
        <li key={`${l.platform}-${l.url}`}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`link-u inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-bone ${
              size === 'sm' ? 'text-[11px]' : 'text-xs'
            }`}
          >
            {linkLabel(l)} <ArrowUpRight size={13} aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
