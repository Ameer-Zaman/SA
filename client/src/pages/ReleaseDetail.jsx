import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Cover from '../components/ui/Cover';
import { Loader, ErrorState, Reveal, Tag } from '../components/ui/Primitives';
import { VideoCard, VideoModal } from '../components/ui/Video';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { CREDIT_LABEL, RELEASE_TYPE_LABEL, linkLabel, paragraphs, publicYear, ytId, isProject, trackCount } from '../services/format';
import NotFound from './NotFound';

export default function ReleaseDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useFetch((s) => api.getMusic(slug, s), [slug]);
  const [playing, setPlaying] = useState(null);

  if (error?.status === 404) return <NotFound />;
  if (loading && !data) return <div className="container-x pt-40"><Loader /></div>;
  if (error) return <div className="container-x pt-40"><ErrorState error={error} onRetry={reload} /></div>;

  const { item, videos, appearsOn = [] } = data;
  const tracks = item.tracks || [];
  const year = publicYear(item);
  const credits = [...(item.artists || []), ...(item.collaborators || [])];
  // The release's own YouTube link, unless it's already among the linked videos.
  const ownVideoId = ytId(item.youtubeUrl);
  const ownVideo = ownVideoId && !videos.some((v) => v.youtubeId === ownVideoId)
    ? { _id: 'own', title: item.title, youtubeId: ownVideoId, category: 'music-video' }
    : null;
  const allVideos = [...(ownVideo ? [ownVideo] : []), ...videos];

  const facts = [
    ['Type', RELEASE_TYPE_LABEL[item.releaseType]],
    ['Tracks', isProject(item) && tracks.length ? String(tracks.length) : ''],
    ['Credit', CREDIT_LABEL[item.creditType]],
    ['Year', year],
    ['Artists', item.artists?.join(', ')],
    ['With', item.collaborators?.join(', ')],
  ].filter(([, v]) => v);

  return (
    <>
      <Seo
        title={item.title}
        description={item.description?.slice(0, 155) || `${item.title} by ${credits.join(', ') || 'SA'}.`}
        image={item.coverImage}
        path={`/music/${item.slug}`}
      />
      <article className="container-x pt-28 sm:pt-36">
        <Link to="/music" className="label inline-flex items-center gap-2 hover:text-bone"><ArrowLeft size={14} aria-hidden /> All music</Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28"><Cover release={item} priority /></div>
          </div>

          <div className="lg:col-span-6">
            <Reveal>
              <h1 className="display text-[clamp(4rem,12vw,11rem)]">{item.title}</h1>
              {!item.verified && (
                <div className="mt-5"><Tag tone="warn">Release details are being verified</Tag></div>
              )}
            </Reveal>

            <dl className="mt-10 border-t border-line">
              {facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 border-b border-line py-4">
                  <dt className="label">{k}</dt>
                  <dd className="col-span-2 text-bone">{v}</dd>
                </div>
              ))}
            </dl>

            {item.description && (
              <div className="mt-10 space-y-5 text-lg leading-relaxed text-bone/80">
                {paragraphs(item.description).map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
              </div>
            )}

            {item.streamingLinks?.length > 0 && (
              <div className="mt-12">
                <p className="label mb-4">Listen on</p>
                <div className="grid gap-px border border-line bg-line sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
                  {item.streamingLinks.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between bg-ink px-5 py-5 transition-colors hover:bg-ink-2"
                    >
                      <span className="font-mono text-sm uppercase tracking-wider">{linkLabel(l)}</span>
                      <ArrowUpRight size={18} className="text-mute transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acid" aria-hidden />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {tracks.length > 0 && (
          <section className="mt-24" aria-labelledby="tracklist-title">
            <div className="flex items-center justify-between border-t border-line pt-4">
              <h2 id="tracklist-title" className="label">Tracklist</h2>
              <span className="label">{trackCount(item)}</span>
            </div>
            <ol className="mt-6">
              {tracks.map((t, i) => (
                <li key={t._id || i} className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-b border-line py-5 sm:grid-cols-[4rem_1fr_auto]">
                  <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    {t.release?.slug ? (
                      <Link to={`/music/${t.release.slug}`} className="display inline-flex items-start gap-2 text-2xl transition-colors hover:text-acid sm:text-4xl">{t.title}<ArrowUpRight size={16} className="mt-1 text-mute" aria-hidden /></Link>
                    ) : (
                      <span className="display text-2xl sm:text-4xl">{t.title}</span>
                    )}
                    {t.featuring?.length > 0 && <p className="mt-1 text-sm text-mute">feat. {t.featuring.join(', ')}</p>}
                  </div>
                  <span className="font-mono text-xs text-mute">{t.duration}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {appearsOn.length > 0 && (
          <section className="mt-24" aria-labelledby="appears-title">
            <div className="border-t border-line pt-4"><h2 id="appears-title" className="label">Also on</h2></div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {appearsOn.map((p) => (
                <Link key={p._id} to={`/music/${p.slug}`} className="group block">
                  <div className="overflow-hidden"><div className="transition-transform duration-700 ease-cine group-hover:scale-[1.03]"><Cover release={p} /></div></div>
                  <p className="display mt-3 text-2xl group-hover:text-acid">{p.title}</p>
                  <p className="label mt-1">{[RELEASE_TYPE_LABEL[p.releaseType], publicYear(p)].filter(Boolean).join(' · ')}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {allVideos.length > 0 && (
          <section className="mt-24" aria-labelledby="release-videos">
            <div className="border-t border-line pt-4"><h2 id="release-videos" className="label">Official video</h2></div>
            <div className="mt-8 grid gap-10 md:grid-cols-2">
              {allVideos.map((v) => <VideoCard key={v._id} video={v} onPlay={setPlaying} />)}
            </div>
          </section>
        )}
      </article>
      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
