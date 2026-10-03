import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Cover from '../ui/Cover';
import { Reveal, SectionHeader, Tag } from '../ui/Primitives';
import { CREDIT_LABEL, RELEASE_TYPE_LABEL, publicYear, primaryListen } from '../../services/format';

export default function FeaturedRelease({ release }) {
  if (!release) return null;
  const listen = primaryListen(release);
  const year = publicYear(release);

  return (
    <section className="container-x pt-24 sm:pt-32" aria-labelledby="featured-title">
      <SectionHeader index="auto" label="Featured release" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <Link to={`/music/${release.slug}`} className="group block overflow-hidden" aria-label={`${release.title} — view release`}>
            <div className="transition-transform duration-1000 ease-cine group-hover:scale-[1.02]">
              <Cover release={release} />
            </div>
          </Link>
        </Reveal>

        <div className="flex flex-col justify-end lg:col-span-6">
          <Reveal>
            <p className="label">
              {[RELEASE_TYPE_LABEL[release.releaseType], CREDIT_LABEL[release.creditType], year].filter(Boolean).join(' · ')}
            </p>
            <h2 id="featured-title" className="display mt-4 text-[clamp(4rem,11vw,11rem)]">{release.title}</h2>
            {release.collaborators?.length > 0 && (
              <p className="mt-4 text-mute">with {release.collaborators.join(', ')}</p>
            )}
            {!release.verified && <div className="mt-4"><Tag tone="warn">Details being verified</Tag></div>}
          </Reveal>
          {release.description && (
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/75">{release.description}</p>
            </Reveal>
          )}
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
            {listen && (
              <a href={listen} target="_blank" rel="noopener noreferrer" className="btn-solid">
                Listen now <ArrowUpRight size={15} aria-hidden />
              </a>
            )}
            <Link to={`/music/${release.slug}`} className="btn-ghost">Release details</Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
