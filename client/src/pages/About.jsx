import { ArrowUpRight } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Media from '../components/ui/Media';
import { Loader, ErrorState, Reveal, SectionHeader, Tag } from '../components/ui/Primitives';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { paragraphs } from '../services/format';

const IDENTITY = [
  ['approach', 'Approach to rap'],
  ['languages', 'English & Malayalam'],
  ['style', 'Artistic style'],
  ['influences', 'Influences'],
];

export default function About() {
  const { data, loading, error, reload } = useFetch((s) => api.getAbout(s), []);
  if (loading && !data) return <div className="container-x pt-40"><Loader /></div>;
  if (error) return <div className="container-x pt-40"><ErrorState error={error} onRetry={reload} /></div>;

  const bio = data.biography;
  const identity = IDENTITY.filter(([k]) => bio.musicalIdentity?.[k]);

  return (
    <>
      <Seo title="About" description={bio.introduction?.slice(0, 155)} image={bio.portraitImage} path="/about" />

      {/* Intro */}
      <header className="container-x pt-32 sm:pt-44">
        <p className="label">Biography</p>
        <Reveal>
          <h1 className="display mt-4 text-[clamp(5rem,19vw,19rem)] leading-[0.78]">
            About <span className="text-acid">SA</span>
          </h1>
        </Reveal>
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Media src={bio.portraitImage} alt="Portrait of SA" className="aspect-[4/5] sm:aspect-[16/11]" priority placeholder="Portrait pending" />
          </div>
          <div className="flex flex-col justify-end lg:col-span-5">
            {paragraphs(bio.introduction).map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? 'text-2xl leading-snug text-bone sm:text-3xl' : 'mt-6 text-lg text-bone/75'}>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </header>

      {/* Long-form biography */}
      {bio.biography && (
        <section className="container-x pt-28" aria-labelledby="story-title">
          <SectionHeader index="auto" label="The story" />
          <h2 id="story-title" className="sr-only">The story</h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            {bio.secondaryImage && (
              <div className="lg:col-span-4"><Media src={bio.secondaryImage} alt="SA" className="aspect-[3/4]" /></div>
            )}
            <div className={`space-y-6 text-lg leading-relaxed text-bone/80 ${bio.secondaryImage ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-8 lg:col-start-5'}`}>
              {paragraphs(bio.biography).map((p, i) => <Reveal key={i}><p>{p}</p></Reveal>)}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {bio.timeline?.length > 0 && (
        <section className="container-x pt-28" aria-labelledby="timeline-title">
          <SectionHeader index="auto" label="Timeline" />
          <h2 id="timeline-title" className="sr-only">Timeline</h2>
          <ol className="mt-10">
            {bio.timeline.map((t) => (
              <Reveal as="li" key={t._id} className="grid gap-4 border-b border-line py-8 md:grid-cols-12">
                <span className="display text-4xl text-acid md:col-span-3 md:text-5xl">{t.date || '—'}</span>
                <div className="md:col-span-8">
                  <h3 className="display text-3xl md:text-4xl">{t.title}</h3>
                  {t.description && <p className="mt-3 max-w-2xl text-bone/70">{t.description}</p>}
                  {!t.verified && <div className="mt-3"><Tag tone="warn">Pending verification</Tag></div>}
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {/* Musical identity */}
      {identity.length > 0 && (
        <section className="container-x pt-28" aria-labelledby="identity-title">
          <SectionHeader index="auto" label="Musical identity" />
          <h2 id="identity-title" className="display mt-6 text-[clamp(3rem,9vw,9rem)]">The sound</h2>
          <div className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
            {identity.map(([k, label], i) => (
              <Reveal key={k} delay={i * 0.06} className="bg-ink p-8 sm:p-12">
                <p className="font-mono text-[11px] text-acid">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="display mt-6 text-4xl">{label}</h3>
                <div className="mt-5 space-y-4 text-bone/75">
                  {paragraphs(bio.musicalIdentity[k]).map((p, j) => <p key={j}>{p}</p>)}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Collaborations */}
      {bio.collaborations?.length > 0 && (
        <section className="container-x pt-28" aria-labelledby="collab-title">
          <SectionHeader index="auto" label="Collaborations & collectives" />
          <h2 id="collab-title" className="sr-only">Collaborations and collectives</h2>
          <div className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2">
            {bio.collaborations.map((c) => (
              <Reveal key={c._id}>
                <article>
                  {c.image && <Media src={c.image} alt={c.name} className="mb-6 aspect-[16/10]" />}
                  <p className="label">{c.kind}</p>
                  <h3 className="display mt-3 text-[clamp(3rem,7vw,6rem)]">{c.name}</h3>
                  {c.members?.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {c.members.map((m) => <li key={m}><Tag>{m}</Tag></li>)}
                    </ul>
                  )}
                  {c.description && <p className="mt-5 max-w-xl text-bone/70">{c.description}</p>}
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {!c.verified && <Tag tone="warn">Pending verification</Tag>}
                    {c.link && (
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="link-u inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
                        Official link <ArrowUpRight size={13} aria-hidden />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
