import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../services/api';
import { paragraphs } from '../../services/format';
import Hero from './Hero';
import FeaturedRelease from './FeaturedRelease';
import ReleaseCard from '../ui/ReleaseCard';
import Media from '../ui/Media';
import { Reveal, SectionHeader, Empty } from '../ui/Primitives';
import { VideoCard, VideoModal } from '../ui/Video';

export function LatestReleases() {
  const { settings } = useSettings();
  const { data, loading } = useFetch((s) => api.listMusic({ limit: 7 }, s), []);
  const featuredId = settings.featuredMusic?._id;
  const items = (data?.items || []).filter((m) => m._id !== featuredId).slice(0, 6);
  // Nothing extra to show beyond the featured release → skip the section entirely.
  if (!loading && items.length === 0 && featuredId) return null;

  return (
    <section className="container-x pt-24 sm:pt-32" aria-labelledby="latest-title">
      <SectionHeader
        index="auto"
        label="Latest releases"
        action={<Link to="/music" className="link-u label text-bone">All music <ArrowUpRight size={12} className="inline" aria-hidden /></Link>}
      />
      <h2 id="latest-title" className="sr-only">Latest releases</h2>
      {!loading && items.length === 0 && !featuredId && (
        <div className="mt-10"><Empty title="Music coming soon">New releases will appear here.</Empty></div>
      )}
      {items.length > 0 && (
        <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m, i) => (
            <Reveal key={m._id} delay={(i % 3) * 0.08}><ReleaseCard release={m} index={i} /></Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export function AboutPreview() {
  const { data } = useFetch((s) => api.getAbout(s), []);
  const bio = data?.biography;
  const intro = paragraphs(bio?.introduction)[0];

  return (
    <section id="about" className="container-x scroll-mt-20 pt-24 sm:pt-32" aria-labelledby="about-preview-title">
      <SectionHeader index="auto" label="About" />
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Media src={bio?.portraitImage} alt="Portrait of SA" className="aspect-[4/5]" placeholder="Portrait pending" />
        </div>
        <div className="flex flex-col justify-between gap-10 lg:col-span-7">
          <Reveal>
            <h2 id="about-preview-title" className="display text-[clamp(4rem,12vw,13rem)]">
              Who is <span className="text-outline">SA</span>
            </h2>
          </Reveal>
          <div>
            {intro && (
              <Reveal delay={0.1}>
                <p className="max-w-2xl text-xl leading-relaxed text-bone/80 sm:text-2xl">{intro}</p>
              </Reveal>
            )}
            <Reveal delay={0.2} className="mt-10">
              <Link to="/about" className="btn-ghost">Read the full story <ArrowUpRight size={15} aria-hidden /></Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoPreview() {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(null);
  const fallback = useFetch((s) => (settings.featuredVideos?.length ? Promise.resolve(null) : api.listVideos({ limit: 3 }, s)), [settings.featuredVideos?.length]);
  const videos = (settings.featuredVideos?.length ? settings.featuredVideos : fallback.data?.items || []).slice(0, 3);
  if (!videos.length) return null;
  const [first, ...rest] = videos;

  return (
    <section className="container-x pt-24 sm:pt-32" aria-labelledby="videos-preview-title">
      <SectionHeader
        index="auto"
        label="Videos"
        action={<Link to="/videos" className="link-u label text-bone">All videos <ArrowUpRight size={12} className="inline" aria-hidden /></Link>}
      />
      <h2 id="videos-preview-title" className="sr-only">Music videos</h2>
      <div className="mt-10 grid gap-x-6 gap-y-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-8"><VideoCard video={first} onPlay={setPlaying} large /></Reveal>
        <div className="grid gap-12 lg:col-span-4">
          {rest.map((v, i) => <Reveal key={v._id} delay={0.1 * (i + 1)}><VideoCard video={v} onPlay={setPlaying} /></Reveal>)}
        </div>
      </div>
      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}

export { Hero, FeaturedRelease };
