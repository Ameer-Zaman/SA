import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Cover from './Cover';
import { Tag } from './Primitives';
import { CREDIT_LABEL, RELEASE_TYPE_LABEL, publicYear, primaryListen, trackCount } from '../../services/format';

/** Release tile: big artwork, minimal type. Whole tile opens the release page; Listen goes straight out. */
export default function ReleaseCard({ release, index, size = 'md' }) {
  const year = publicYear(release);
  const listen = primaryListen(release);
  return (
    <article className="group relative">
      <Link to={`/music/${release.slug}`} className="block" aria-label={`${release.title}, view release`}>
        <div className="overflow-hidden">
          <div className="transition-transform duration-700 ease-cine group-hover:scale-[1.03]">
            <Cover release={release} />
          </div>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {index !== undefined && <span className="font-mono text-[11px] text-mute">{String(index + 1).padStart(2, '0')}</span>}
            <h3 className={`display truncate transition-colors group-hover:text-acid ${size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-3xl'}`}>
              <Link to={`/music/${release.slug}`}>{release.title}</Link>
            </h3>
          </div>
          <p className="label mt-2">
            {[RELEASE_TYPE_LABEL[release.releaseType], trackCount(release), CREDIT_LABEL[release.creditType], year].filter(Boolean).join(' · ')}
          </p>
          {!release.verified && <div className="mt-2"><Tag tone="warn">Details being verified</Tag></div>}
        </div>
        {listen ? (
          <a href={listen} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm shrink-0" aria-label={`Listen to ${release.title}`}>
            Listen <ArrowUpRight size={14} aria-hidden />
          </a>
        ) : (
          <Link to={`/music/${release.slug}`} className="btn-ghost btn-sm shrink-0">View</Link>
        )}
      </div>
    </article>
  );
}
