import Media from './Media';
import { RELEASE_TYPE_LABEL } from '../../services/format';

/**
 * Release artwork. Without official artwork, a typographic cover is generated from the
 * title — clearly a design element, not a fake album cover.
 */
export default function Cover({ release, className = '', priority, reveal = true }) {
  if (release?.coverImage) {
    return (
      <Media
        src={release.coverImage}
        alt={`${release.title} cover artwork`}
        className={`aspect-square ${className}`}
        priority={priority}
        reveal={reveal}
      />
    );
  }
  const title = release?.title || '';
  const size = title.length > 14 ? 'text-[13cqw]' : title.length > 8 ? 'text-[17cqw]' : 'text-[24cqw]';
  return (
    <div
      className={`grain relative aspect-square overflow-hidden border border-line bg-ink-2 ${className}`}
      style={{ containerType: 'inline-size' }}
      role="img"
      aria-label={`${title} — artwork pending`}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-[6cqw]">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[3.4cqw] uppercase tracking-label text-mute">SA</span>
          <span className="font-mono text-[3.4cqw] uppercase tracking-label text-mute">
            {RELEASE_TYPE_LABEL[release?.releaseType] || ''}
          </span>
        </div>
        <span className={`display break-words text-bone ${size}`}>{title}</span>
        <div className="flex items-center justify-between">
          <span className="h-[0.8cqw] w-[10cqw] bg-acid" />
          <span className="font-mono text-[3cqw] uppercase tracking-label text-mute/70">Artwork pending</span>
        </div>
      </div>
    </div>
  );
}
